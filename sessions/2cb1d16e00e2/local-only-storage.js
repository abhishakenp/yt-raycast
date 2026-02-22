```python
"""
storage.py - Local-only storage layer for Chat Collector

Implements:
- SQLite database (file based) using SQLModel (SQLAlchemy)
- Data models for User, Chat, Provider, Message, Tag, Attachment
- CRUD operations
- Helper utilities: deduplication, incremental collection, import/export
"""

from __future__ import annotations

import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Sequence, Tuple

from sqlmodel import Field, Relationship, Session, SQLModel, create_engine, select

# ----------------------------------------------------------------------
# Database setup (local file storage)
# ----------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "chat_collector.db"
engine = create_engine(f"sqlite:///{DB_PATH}", echo=False, connect_args={"check_same_thread": False})


def init_db() -> None:
    """Create tables if they don't exist."""
    SQLModel.metadata.create_all(engine)


# ----------------------------------------------------------------------
# Data models
# ----------------------------------------------------------------------
class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    email: str = Field(index=True, nullable=False, unique=True)
    hashed_password: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    chats: List["Chat"] = Relationship(back_populates="owner")


class Provider(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    name: str = Field(nullable=False, unique=True)  # e.g. "OpenAI", "Anthropic"
    api_key: Optional[str] = Field(default=None)  # stored encrypted in real prod

    chats: List["Chat"] = Relationship(back_populates="provider")


class Chat(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    title: Optional[str] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    owner_id: uuid.UUID = Field(foreign_key="user.id")
    provider_id: uuid.UUID = Field(foreign_key="provider.id")

    owner: User = Relationship(back_populates="chats")
    provider: Provider = Relationship(back_populates="chats")
    messages: List["Message"] = Relationship(back_populates="chat")
    tags: List["Tag"] = Relationship(back_populates="chat", link_model="ChatTagLink")
    attachments: List["Attachment"] = Relationship(back_populates="chat")


class Message(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    role: str = Field(nullable=False)  # "user" | "assistant" | "system"
    content: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    chat_id: uuid.UUID = Field(foreign_key="chat.id")
    chat: Chat = Relationship(back_populates="messages")
    attachments: List["Attachment"] = Relationship(back_populates="message")


class Tag(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    name: str = Field(nullable=False, index=True, unique=True)

    chats: List["Chat"] = Relationship(back_populates="tags", link_model="ChatTagLink")


class ChatTagLink(SQLModel, table=True):
    chat_id: uuid.UUID = Field(foreign_key="chat.id", primary_key=True)
    tag_id: uuid.UUID = Field(foreign_key="tag.id", primary_key=True)


class Attachment(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    filename: str = Field(nullable=False)
    mime_type: str = Field(nullable=False)
    size_bytes: int = Field(nullable=False)
    stored_path: str = Field(nullable=False)  # relative path inside ./attachments

    # Either attached to a chat (e.g., image) or a message
    chat_id: Optional[uuid.UUID] = Field(default=None, foreign_key="chat.id")
    message_id: Optional[uuid.UUID] = Field(default=None, foreign_key="message.id")

    chat: Optional[Chat] = Relationship(back_populates="attachments")
    message: Optional[Message] = Relationship(back_populates="attachments")


# ----------------------------------------------------------------------
# Repository helpers
# ----------------------------------------------------------------------
class Repository:
    """Simple repository pattern wrapping a SQLModel Session."""

    def __init__(self, db_path: Path = DB_PATH):
        self.engine = create_engine(f"sqlite:///{db_path}", echo=False, connect_args={"check_same_thread": False})
        init_db()

    # -------------------- User --------------------
    def create_user(self, email: str, hashed_password: str) -> User:
        with Session(self.engine) as session:
            user = User(email=email, hashed_password=hashed_password)
            session.add(user)
            session.commit()
            session.refresh(user)
            return user

    def get_user_by_email(self, email: str) -> Optional[User]:
        with Session(self.engine) as session:
            stmt = select(User).where(User.email == email)
            return session.exec(stmt).first()

    # -------------------- Provider --------------------
    def get_or_create_provider(self, name: str, api_key: Optional[str] = None) -> Provider:
        with Session(self.engine) as session:
            stmt = select(Provider).where(Provider.name == name)
            provider = session.exec(stmt).first()
            if provider:
                if api_key and provider.api_key != api_key:
                    provider.api_key = api_key
                    session.add(provider)
                    session.commit()
                return provider
            provider = Provider(name=name, api_key=api_key)
            session.add(provider)
            session.commit()
            session.refresh(provider)
            return provider

    # -------------------- Chat --------------------
    def create_chat(
        self,
        owner_id: uuid.UUID,
        provider_id: uuid.UUID,
        title: Optional[str] = None,
        tags: Optional[Sequence[str]] = None,
    ) -> Chat:
        with Session(self.engine) as session:
            chat = Chat(owner_id=owner_id, provider_id=provider_id, title=title)
            session.add(chat)
            session.commit()
            session.refresh(chat)

            if tags:
                self._attach_tags_to_chat(session, chat, tags)

            session.commit()
            session.refresh(chat)
            return chat

    def _attach_tags_to_chat(self, session: Session, chat: Chat, tag_names: Sequence[str]) -> None:
        for name in tag_names:
            tag = session.exec(select(Tag).where(Tag.name == name)).first()
            if not tag:
                tag = Tag(name=name)
                session.add(tag)
                session.flush()  # get id
            link = ChatTagLink(chat_id=chat.id, tag_id=tag.id)
            session.add(link)

    def get_chat(self, chat_id: uuid.UUID) -> Optional[Chat]:
        with Session(self.engine) as session:
            stmt = select(Chat).where(Chat.id == chat_id).options(
                selectinload(Chat.messages),
                selectinload(Chat.tags),
                selectinload(Chat.attachments),
            )
            return session.exec(stmt).first()

    def list_user_chats(self, user_id: uuid.UUID, limit: int = 100, offset: int = 0) -> List[Chat]:
        with Session(self.engine) as session:
            stmt = (
                select(Chat)
                .where(Chat.owner_id == user_id)
                .order_by(Chat.updated_at.desc())
                .limit(limit)
                .offset(offset)
            )
            return session.exec(stmt).all()

    # -------------------- Message --------------------
    def add_message(
        self,
        chat_id: uuid.UUID,
        role: str,
        content: str,
        attachments: Optional[Sequence[Tuple[str, bytes, str]]] = None,
    ) -> Message:
        """
        Add a message to a chat.
        attachments: iterable of (filename, file_bytes, mime_type)
        """
        with Session(self.engine) as session:
            # Deduplication: check if same content already exists in this chat
            dup_stmt = select(Message).where(
                Message.chat_id == chat_id,
                Message.content == content,
                Message.role == role,
            )
            if session.exec(dup_stmt).first():
                raise ValueError("Duplicate message detected")

            message = Message(chat_id=chat_id, role=role, content=content)
            session.add(message)
            session.flush()  # get id

            if attachments:
                for filename, data, mime in attachments:
                    att_path = self._store_attachment_file(filename, data)
                    attachment = Attachment(
                        filename=filename,
                        mime_type=mime,
                        size_bytes=len(data),
                        stored_path=att_path,
                        message_id=message.id,
                    )
                    session.add(attachment)

            # Update chat timestamp
            session.exec(
                select(Chat).where(Chat.id == chat_id).update({Chat.updated_at: datetime.utcnow()})
            )
            session.commit()
            session.refresh(message)
            return message

    # -------------------- Attachment --------------------
    ATTACHMENTS_DIR = BASE_DIR / "attachments"

    def _store_attachment_file(self, filename: str, data: bytes) -> str:
        """Save attachment to local disk and return relative path."""
        self.ATTACHMENTS_DIR.mkdir(parents=True, exist_ok=True)
        safe_name = f"{uuid.uuid4().hex}_{filename}"
        path = self.ATTACHMENTS_DIR / safe_name
        with open(path, "wb") as f:
            f.write(data)
        return str(path.relative_to(BASE_DIR))

    def get_attachment_file(self, attachment_id: uuid.UUID) -> Tuple[bytes, str]:
        """Return (bytes, mime_type) for an attachment."""
        with Session(self.engine) as session:
            att = session.get(Attachment, attachment_id)
            if not att:
                raise FileNotFoundError("Attachment not found")
            abs_path = BASE_DIR / att.stored_path
            with open(abs_path, "rb") as f:
                return f.read(), att.mime_type

    # -------------------- Tag --------------------
    def create_tag(self, name: str) -> Tag:
        with Session(self.engine) as session:
            tag = Tag(name=name)
            session.add(tag)
            session.commit()
            session.refresh(tag)
            return tag

    def list_tags(self) -> List[Tag]:
        with Session(self.engine) as session:
            return session.exec(select(Tag).order_by(Tag.name)).all()

    # -------------------- Import / Export --------------------
    def export_user_data(self, user_id: uuid.UUID) -> str:
        """Export all user data as JSON string."""
        with Session(self.engine) as session:
            user = session.get(User, user_id)
            if not user:
                raise ValueError("User not found")

            chats = session.exec(select(Chat).where(Chat.owner_id == user_id)).all()
            data = {
                "user": {"id": str(user.id), "email": user.email, "created_at": user.created_at.isoformat()},
                "chats": [],
            }

            for chat in chats:
                chat_dict = {
                    "id": str(chat.id),
                    "title": chat.title,
                    "created_at": chat.created_at.isoformat(),
                    "updated_at": chat.updated_at.isoformat(),
                    "provider": session.get(Provider, chat.provider_id).name,
                    "tags": [t.name for t in chat.tags],
                    "messages": [],
                    "attachments": [],
                }

                msgs = session.exec(select(Message).where(Message.chat_id == chat.id)).all()
                for msg in msgs:
                    msg_dict = {
                        "id": str(msg.id),
                        "role": msg.role,
                        "content": msg.content,
                        "created_at": msg.created_at.isoformat(),
                        "attachments": [],
                    }
                    for att in msg.attachments:
                        att_path = BASE_DIR / att.stored_path
                        with open(att_path, "rb") as f:
                            b64 = base64.b64encode(f.read()).decode()
                        msg_dict["attachments"].append(
                            {
                                "filename": att.filename,
                                "mime_type": att.mime_type,
                                "size_bytes": att.size_bytes,
                                "data_base64": b64,
                            }
                        )
                    chat_dict["messages"].append(msg_dict)

                # Chat-level attachments (e.g., images not tied to a message)
                for att in chat.attachments:
                    att_path = BASE_DIR / att.stored_path
                    with open(att_path, "rb") as f:
                        b64 = base64.b64encode(f.read()).decode()
                    chat_dict["attachments"].append(
                        {
                            "filename": att.filename,
                            "mime_type": att.mime_type,
                            "size_bytes": att.size_bytes,
                            "data_base64": b64,
                        }
                    )
                data["chats"].append(chat_dict)

            return json.dumps(data, indent=2)

    def import_user_data(self, json_str: str, email: str, hashed_password: str) -> User:
        """Import data for a new user. Returns created User."""
        payload = json.loads(json_str)

        # Create user
        user = self.create_user(email=email, hashed_password=hashed_password)

        # Providers cache
        provider_cache: dict[str, Provider] = {}

        for chat_data in payload.get("chats", []):
            provider_name = chat_data.get("provider", "unknown")
            provider = provider_cache.get(provider_name)
            if not provider:
                provider = self.get_or_create_provider(name=provider_name)
                provider_cache[provider_name] = provider

            chat = self.create_chat(
                owner_id=user.id,
                provider_id=provider.id,
                title=chat_data.get("title"),
                tags=chat_data.get("tags", []),
            )

            # Import chat-level attachments
            for att_dict in chat_data.get("attachments", []):
                data_bytes = base64.b64decode(att_dict["data_base64"])
                att_path = self._store_attachment_file(att_dict["filename"], data_bytes)
                attachment = Attachment(
                    filename=att_dict["filename"],
                    mime_type=att_dict["mime_type"],
                    size_bytes=att_dict["size_bytes"],
                    stored_path=att_path,
                    chat_id=chat.id,
                )
                with Session(self.engine) as s:
                    s.add(attachment)
                    s.commit()

            # Import messages
            for msg_dict in chat_data.get("messages", []):
                msg_attachments = []
                for att_dict in msg_dict.get("attachments", []):
                    data_bytes = base64.b64decode(att_dict["data_base64"])
                    att_path = self._store_attachment_file(att_dict["filename"], data_bytes)
                    msg_attachments.append((att_dict["filename"], data_bytes, att_dict["mime_type"]))

                self.add_message(
                    chat_id=chat.id,
                    role=msg_dict["role"],
                    content=msg_dict["content"],
                    attachments=msg_attachments,
                )

        return user