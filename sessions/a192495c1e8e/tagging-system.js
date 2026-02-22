<Tag id={self.id} name={self.name}>"

# ----------------------------------------------------------------------
# Extend existing Chat model with relationship to Tag (if not already present)
# ----------------------------------------------------------------------
if not hasattr(Chat, "tags"):
    Chat.tags = relationship(
        "Tag",
        secondary=chat_tags,
        back_populates="chats",
        lazy="dynamic",
    )

# ----------------------------------------------------------------------
# Pydantic schemas
# ----------------------------------------------------------------------
from pydantic import BaseModel, Field, validator

class TagBase(BaseModel):
    name: str = Field(..., max_length=64, description="Human readable tag name")
    color: Optional[str] = Field(
        None,
        regex=r"^#(?:[0-9a-fA-F]{3}){1,2}$",
        description="Optional hex colour for UI representation",
    )

    @validator("name")
    def strip_name(cls, v: str) -> str:
        return v.strip()

class TagCreate(TagBase):
    pass

class TagUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=64)
    color: Optional[str] = Field(
        None,
        regex=r"^#(?:[0-9a-fA-F]{3}){1,2}$",
    )

    @validator("name")
    def strip_name(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if v else v

class TagRead(TagBase):
    id: int

    class Config:
        orm_mode = True

# ----------------------------------------------------------------------
# Router
# ----------------------------------------------------------------------
router = APIRouter(
    prefix="/tags",
    tags=["tags"],
    dependencies=[Depends(get_current_user)],
    responses={404: {"description": "Not found"}},
)

# Helper functions -------------------------------------------------------
def get_tag(db: Session, tag_id: int, user_id: int) -> Tag:
    tag = db.query(Tag).filter(Tag.id == tag_id, Tag.owner_id == user_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag

# CRUD endpoints ---------------------------------------------------------
@router.get("/", response_model=List[TagRead])
def list_tags(
    db: Session = Depends(get_db),
    current_user: UserBase = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
):
    """Return all tags belonging to the authenticated user."""
    tags = (
        db.query(Tag)
        .filter(Tag.owner_id == current_user.id)
        .order_by(Tag.name)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return tags


@router.post("/", response_model=TagRead, status_code=status.HTTP_201_CREATED)
def create_tag(
    payload: TagCreate,
    db: Session = Depends(get_db),
    current_user: UserBase = Depends(get_current_user),
):
    """Create a new tag for the current user."""
    existing = db.query(Tag).filter(Tag.owner_id == current_user.id, Tag.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tag with this name already exists")
    tag = Tag(name=payload.name, color=payload.color, owner_id=current_user.id)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@router.get("/{tag_id}", response_model=TagRead)
def read_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: UserBase = Depends(get_current_user),
):
    tag = get_tag(db, tag_id, current_user.id)
    return tag


@router.patch("/{tag_id}", response_model=TagRead)
def update_tag(
    tag_id: int,
    payload: TagUpdate,
    db: Session = Depends(get_db),
    current_user: UserBase = Depends(get_current_user),
):
    tag = get_tag(db, tag_id, current_user.id)

    if payload.name is not None:
        # Ensure uniqueness per user
        conflict = (
            db.query(Tag)
            .filter(Tag.owner_id == current_user.id, Tag.name == payload.name, Tag.id != tag.id)
            .first()
        )
        if conflict:
            raise HTTPException(status_code=400, detail="Another tag with this name already exists")
        tag.name = payload.name

    if payload.color is not None:
        tag.color = payload.color

    db.commit()
    db.refresh(tag)
    return tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: UserBase = Depends(get_current_user),
):
    tag = get_tag(db, tag_id, current_user.id)
    db.delete(tag)
    db.commit()
    return None

# ----------------------------------------------------------------------
# Chat‑Tag linking endpoints
# ----------------------------------------------------------------------
@router.get("/chat/{chat_id}", response_model=List[TagRead])
def list_chat_tags(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: UserBase = Depends(get_current_user),
):
    """Return tags attached to a specific chat."""
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.owner_id == current_user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat.tags.order_by(Tag.name).all()


@router.post("/chat/{chat_id}", response_model=List[TagRead])
def add_tags_to_chat(
    chat_id: int,
    tag_ids: List[int] = Field(..., description="List of tag IDs to attach"),
    db: Session = Depends(get_db),
    current_user: UserBase = Depends(get_current_user),
):
    """Attach existing tags to a chat."""
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.owner_id == current_user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Validate tags belong to user
    tags = (
        db.query(Tag)
        .filter(Tag.id.in_(tag_ids), Tag.owner_id == current_user.id)
        .all()
    )
    if len(tags) != len(set(tag_ids)):
        raise HTTPException(status_code=400, detail="One or more tags are invalid or not owned by you")

    for tag in tags:
        if not chat.tags.filter(Tag.id == tag.id).first():
            chat.tags.append(tag)

    db.commit()
    return chat.tags.order_by(Tag.name).all()


@router.delete("/chat/{chat_id}/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_tag_from_chat(
    chat_id: int,
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: UserBase = Depends(get_current_user),
):
    """Detach a tag from a chat."""
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.owner_id == current_user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    tag = (
        db.query(Tag)
        .filter(Tag.id == tag_id, Tag.owner_id == current_user.id)
        .first()
    )
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    if not chat.tags.filter(Tag.id == tag.id).first():
        raise HTTPException(status_code=400, detail="Tag not attached to this chat")

    chat.tags.remove(tag)
    db.commit()
    return None