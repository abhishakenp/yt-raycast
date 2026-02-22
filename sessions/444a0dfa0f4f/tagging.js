<Tag id={self.id} name={self.name}>"


# Extend existing models with back_populates if not already present
Chat.tags = relationship("Tag", secondary=chat_tags, back_populates="chats")
Message.tags = relationship("Tag", secondary=message_tags, back_populates="messages")
User.tags = relationship("Tag", back_populates="creator", cascade="all, delete-orphan")


# ---------- Pydantic Schemas ----------
class TagBase(BaseModel):
    name: str = Field(..., max_length=64, description="Human‑readable tag name")
    color: Optional[str] = Field(
        None,
        regex=r"^#([A-Fa-f0-9]{6})$",
        description="Optional HEX colour for UI representation (e.g. #3B82F6)",
    )

    @validator("name")
    def strip_name(cls, v: str) -> str:
        return v.strip()


class TagCreate(TagBase):
    pass


class TagRead(TagBase):
    id: int
    creator_id: int

    class Config:
        orm_mode = True


class TagAssign(BaseModel):
    tag_id: int = Field(..., description="ID of the tag to assign")


# ---------- Helper Functions ----------
def get_tag_or_404(tag_id: int, db: Session) -> Tag:
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    return tag


def ensure_tag_owner(tag: Tag, user: User):
    if tag.creator_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this tag",
        )


# ---------- Endpoints ----------
@router.post("/", response_model=TagRead, status_code=status.HTTP_201_CREATED)
def create_tag(
    payload: TagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Enforce uniqueness per user (case‑insensitive)
    existing = (
        db.query(Tag)
        .filter(Tag.creator_id == current_user.id, Tag.name.ilike(payload.name))
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tag with this name already exists",
        )
    tag = Tag(name=payload.name, color=payload.color, creator_id=current_user.id)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@router.get("/", response_model=List[TagRead])
def list_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Tag).filter(Tag.creator_id == current_user.id).order_by(Tag.name).all()


@router.get("/{tag_id}", response_model=TagRead)
def read_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tag = get_tag_or_404(tag_id, db)
    ensure_tag_owner(tag, current_user)
    return tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tag = get_tag_or_404(tag_id, db)
    ensure_tag_owner(tag, current_user)
    db.delete(tag)
    db.commit()
    return None


# ---- Assign / Remove tags to/from Chats ----
@router.post("/chats/{chat_id}/assign", status_code=status.HTTP_200_OK)
def assign_tag_to_chat(
    chat_id: int,
    payload: TagAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.owner_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    tag = get_tag_or_404(payload.tag_id, db)
    ensure_tag_owner(tag, current_user)

    if tag not in chat.tags:
        chat.tags.append(tag)
        db.commit()
    return {"detail": "Tag assigned to chat"}


@router.post("/chats/{chat_id}/remove", status_code=status.HTTP_200_OK)
def remove_tag_from_chat(
    chat_id: int,
    payload: TagAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.owner_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    tag = get_tag_or_404(payload.tag_id, db)
    ensure_tag_owner(tag, current_user)

    if tag in chat.tags:
        chat.tags.remove(tag)
        db.commit()
    return {"detail": "Tag removed from chat"}


# ---- Assign / Remove tags to/from Messages ----
@router.post("/messages/{message_id}/assign", status_code=status.HTTP_200_OK)
def assign_tag_to_message(
    message_id: int,
    payload: TagAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    message = (
        db.query(Message)
        .join(Chat)
        .filter(Message.id == message_id, Chat.owner_id == current_user.id)
        .first()
    )
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    tag = get_tag_or_404(payload.tag_id, db)
    ensure_tag_owner(tag, current_user)

    if tag not in message.tags:
        message.tags.append(tag)
        db.commit()
    return {"detail": "Tag assigned to message"}


@router.post("/messages/{message_id}/remove", status_code=status.HTTP_200_OK)
def remove_tag_from_message(
    message_id: int,
    payload: TagAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    message = (
        db.query(Message)
        .join(Chat)
        .filter(Message.id == message_id, Chat.owner_id == current_user.id)
        .first()
    )
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    tag = get_tag_or_404(payload.tag_id, db)
    ensure_tag_owner(tag, current_user)

    if tag in message.tags:
        message.tags.remove(tag)
        db.commit()
    return {"detail": "Tag removed from message"}


# ---- Filtering helpers ----
@router.get("/chats", response_model=List[TagRead])
def list_chats_by_tags(
    tag_ids: List[int] = [],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return chats that have **all** of the supplied tag IDs.
    If no tag_ids are provided, all chats for the user are returned.
    """
    query = db.query(Chat).filter(Chat.owner_id == current_user.id)

    if tag_ids:
        # Join through association table and group by chat.id having count = len(tag_ids)
        query = (
            query.join(chat_tags)
            .filter(chat_tags.c.tag_id.in_(tag_ids))
            .group_by(Chat.id)
            .having(func.count(Chat.id) == len(tag_ids))
        )
    return query.all()


# Register router in main application (example)
# from fastapi import FastAPI
# app = FastAPI()
# app.include_router(router)