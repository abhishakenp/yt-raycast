<-> Tag
class ThreadTagLink(SQLModel, table=True):
    thread_id: int = Field(foreign_key="chatthread.id", primary_key=True)
    tag_id: int = Field(foreign_key="tag.id", primary_key=True)


class Attachment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str
    mime_type: str
    size_bytes: int
    data: bytes = Field(sa_column_kwargs={"sqlite_blob": True})
    created_at: datetime = Field(default_factory=datetime.utcnow)

    message_id: Optional[int] = Field(default=None, foreign_key="message.id")
    message: Optional["Message"] = Relationship(back_populates="attachments")


class ChatThread(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str = Field(default="Untitled")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    owner: User = Relationship(back_populates="threads")
    messages: List["Message"] = Relationship(back_populates="thread", cascade="delete")
    tags: List[Tag] = Relationship(back_populates="threads", link_model=ThreadTagLink)


Tag.threads = Relationship(back_populates="tags", link_model=ThreadTagLink)


class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    thread_id: int = Field(foreign_key="chatthread.id")
    role: str = Field(index=True)  # "user", "assistant", "system"
    content: str
    provider_id: Optional[int] = Field(default=None, foreign_key="provider.id")
    metadata: Optional[str] = Field(default=None)  # JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow)
    order_index: int = Field(default=0)  # incremental order within thread

    thread: ChatThread = Relationship(back_populates="messages")
    provider: Optional[Provider] = Relationship()
    attachments: List[Attachment] = Relationship(back_populates="message", cascade="delete")

    @property
    def metadata_dict(self) -> Dict[str, Any]:
        if self.metadata:
            try:
                return json.loads(self.metadata)
            except json.JSONDecodeError:
                return {}
        return {}

    @metadata_dict.setter
    def metadata_dict(self, value: Dict[str, Any]) -> None:
        self.metadata = json.dumps(value)


# ----------------------------------------------------------------------
# Repository helpers
# ----------------------------------------------------------------------
class BaseRepo:
    """Utility base class for common session handling."""

    @staticmethod
    def _session() -> Session:
        return Session(engine)


# ----------------------------------------------------------------------
# User repository
# ----------------------------------------------------------------------
class UserRepo(BaseRepo):
    @staticmethod
    def create(username: str) -> User:
        with UserRepo._session() as s:
            user = User(username=username)
            s.add(user)
            s.commit()
            s.refresh(user)
            return user

    @staticmethod
    def get_by_username(username: str) -> Optional[User]:
        with UserRepo._session() as s:
            stmt = select(User).where(User.username == username)
            return s.exec(stmt).first()


# ----------------------------------------------------------------------
# Provider repository
# ----------------------------------------------------------------------
class ProviderRepo(BaseRepo):
    @staticmethod
    def get_or_create(name: str, display_name: Optional[str] = None) -> Provider:
        with ProviderRepo._session() as s:
            stmt = select(Provider).where(Provider.name == name)
            provider = s.exec(stmt).first()
            if provider:
                return provider
            provider = Provider(name=name, display_name=display_name or name.title())
            s.add(provider)
            s.commit()
            s.refresh(provider)
            return provider


# ----------------------------------------------------------------------
# Tag repository
# ----------------------------------------------------------------------
class TagRepo(BaseRepo):
    @staticmethod
    def get_or_create(name: str) -> Tag:
        with TagRepo._session() as s:
            stmt = select(Tag).where(Tag.name == name)
            tag = s.exec(stmt).first()
            if tag:
                return tag
            tag = Tag(name=name)
            s.add(tag)
            s.commit()
            s.refresh(tag)
            return tag


# ----------------------------------------------------------------------
# Thread repository
# ----------------------------------------------------------------------
class ThreadRepo(BaseRepo):
    @staticmethod
    def create(user_id: int, title: str = "Untitled", tags: Optional[Iterable[str]] = None) -> ChatThread:
        with ThreadRepo._session() as s:
            thread = ChatThread(user_id=user_id, title=title, updated_at=datetime.utcnow())
            if tags:
                thread.tags = [TagRepo.get_or_create(t) for t in tags]
            s.add(thread)
            s.commit()
            s.refresh(thread)
            return thread

    @staticmethod
    def get(thread_id: int) -> Optional[ChatThread]:
        with ThreadRepo._session() as s:
            stmt = select(ChatThread).where(ChatThread.id == thread_id).options(
                selectinload(ChatThread.messages),
                selectinload(ChatThread.tags),
            )
            return s.exec(stmt).first()

    @staticmethod
    def add_tag(thread_id: int, tag_name: str) -> None:
        with ThreadRepo._session() as s:
            thread = s.get(ChatThread, thread_id)
            if not thread:
                raise ValueError("Thread not found")
            tag = TagRepo.get_or_create(tag_name)
            if tag not in thread.tags:
                thread.tags.append(tag)
                s.add(thread)
                s.commit()


# ----------------------------------------------------------------------
# Message repository
# ----------------------------------------------------------------------
class MessageRepo(BaseRepo):
    @staticmethod
    def _hash_content(content: str) -> str:
        """Create a deterministic hash for deduplication."""
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    @staticmethod
    def _exists_duplicate(session: Session, thread_id: int, content_hash: str) -> bool:
        stmt = (
            select(Message)
            .where(Message.thread_id == thread_id)
            .where(Message.metadata.like(f"%{content_hash}%"))
        )
        return session.exec(stmt).first() is not None

    @staticmethod
    def add(
        thread_id: int,
        role: str,
        content: str,
        provider: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        attachments: Optional[Iterable[Dict[str, Any]]] = None,
        deduplicate: bool = True,
    ) -> Message:
        """
        Add a message to a thread.

        Parameters
        ----------
        thread_id: int
            Target thread.
        role: str
            "user", "assistant", or "system".
        content: str
            Message body.
        provider: Optional[str]
            Name of the AI provider (e.g. "openai").
        metadata: Optional[Dict[str, Any]]
            Additional key/value data.
        attachments: Optional[Iterable[Dict]]
            Each dict must contain: filename, mime_type, data (bytes), size_bytes.
        deduplicate: bool
            If True, identical content within the same thread will be ignored.
        """
        with MessageRepo._session() as s:
            # Resolve provider FK
            provider_obj = ProviderRepo.get_or_create(provider) if provider else None

            # Compute hash for deduplication
            content_hash = MessageRepo._hash_content(content)
            if deduplicate and MessageRepo._exists_duplicate(s, thread_id, content_hash):
                # Return existing message (first match) without creating a new one
                stmt = (
                    select(Message)
                    .where(Message.thread_id == thread_id)
                    .where(Message.metadata.like(f"%{content_hash}%"))
                )
                return s.exec(stmt).first()

            # Determine order_index (max+1)
            stmt = select(Message.order_index).where(Message.thread_id == thread_id).order_by(Message.order_index.desc())
            max_index = s.exec(stmt).first()
            order_index = (max_index or 0) + 1

            # Prepare metadata with hash for future dedup checks
            full_metadata = metadata.copy() if metadata else {}
            full_metadata["_content_hash"] = content_hash

            msg = Message(
                thread_id=thread_id,
                role=role,
                content=content,
                provider_id=provider_obj.id if provider_obj else None,
                metadata=json.dumps(full_metadata),
                order_index=order_index,
                created_at=datetime.utcnow(),
            )
            s.add(msg)
            s.flush()  # assign ID before adding attachments

            # Attachments handling
            if attachments:
                for att in attachments:
                    attachment = Attachment(
                        filename=att["filename"],
                        mime_type=att["mime_type"],
                        size_bytes=att["size_bytes"],
                        data=att["data"],
                        message_id=msg.id,
                    )
                    s.add(attachment)

            # Update thread's updated_at
            thread = s.get(ChatThread, thread_id)
            thread.updated_at = datetime.utcnow()
            s.add(thread)

            s.commit()
            s.refresh(msg)
            return msg

    @staticmethod
    def list_by_thread(thread_id: int, limit: int = 100, offset: int = 0) -> List[Message]:
        with MessageRepo._session() as s:
            stmt = (
                select(Message)
                .where(Message.thread_id == thread_id)
                .order_by(Message.order_index)
                .limit(limit)
                .offset(offset)
            )
            return s.exec(stmt).all()

    @staticmethod
    def get(message_id: int) -> Optional[Message]:
        with MessageRepo._session() as s:
            return s.get(Message, message_id)


# ----------------------------------------------------------------------
# Export / Search utilities (lightweight)
# ----------------------------------------------------------------------
def export_thread(thread_id: int) -> Dict[str, Any]:
    """
    Export a thread and its messages (including attachments) as a JSON‑serialisable dict.
    Attachments are base64‑encoded to keep the output self‑contained.
    """
    import base64

    with Session(engine) as s:
        thread = s.get(ChatThread, thread_id)
        if not thread:
            raise ValueError("Thread not found")

        messages_data = []
        for msg in sorted(thread.messages, key=lambda m: m.order_index):
            att_data = [
                {
                    "filename": att.filename,
                    "mime_type": att.mime_type,
                    "size_bytes": att.size_bytes,
                    "data_base64": base64.b64encode(att.data).decode("utf-8"),
                }
                for att in msg.attachments
            ]
            messages_data.append(
                {
                    "role": msg.role,
                    "content": msg.content,
                    "provider": msg.provider.name if msg.provider else None,
                    "metadata": msg.metadata_dict,
                    "created_at": msg.created_at.isoformat(),
                    "attachments": att_data,
                }
            )

        return {
            "thread": {
                "id": thread.id,
                "title": thread.title,
                "created_at": thread.created_at.isoformat(),
                "updated_at": thread.updated_at.isoformat(),
                "tags": [t.name for t in thread.tags],
            },
            "messages": messages_data,
        }


def search_messages(keyword: str, limit: int = 50) -> List[Message]:
    """
    Very simple full‑text search over message content.
    For production use consider integrating SQLite FTS5 or an external search engine.
    """
    pattern = f"%{keyword.lower()}%"
    with Session(engine) as s:
        stmt = (
            select(Message)
            .where(Message.content.ilike(pattern))
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        return s.exec(stmt).all()