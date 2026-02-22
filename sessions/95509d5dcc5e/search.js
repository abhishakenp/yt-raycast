```python
# app/routers/search.py
"""
Search endpoint for AdultStream.

Provides a unified search across Videos, Creators and Categories.
Authenticated users only (JWT bearer token).

Query parameters:
- q: search term (required)
- type: optional filter, one of ["video", "creator", "category"]; defaults to all
- limit: max results per type (default 20)
- offset: pagination offset (default 0)

Response schema:
{
    "videos": [...],
    "creators": [...],
    "categories": [...]
}
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional, Literal

from app import schemas, models, deps, security

router = APIRouter(prefix="/search", tags=["search"])


def _search_videos(db: Session, term: str, limit: int, offset: int) -> List[models.Video]:
    """
    Simple case‑insensitive LIKE search on title and description.
    In production you would replace this with a full‑text search engine
    (PostgreSQL tsvector, ElasticSearch, Meilisearch, etc.).
    """
    like_term = f"%{term}%"
    return (
        db.query(models.Video)
        .filter(
            (models.Video.title.ilike(like_term))
            | (models.Video.description.ilike(like_term))
        )
        .order_by(models.Video.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def _search_creators(db: Session, term: str, limit: int, offset: int) -> List[models.Creator]:
    like_term = f"%{term}%"
    return (
        db.query(models.Creator)
        .filter(
            (models.Creator.display_name.ilike(like_term))
            | (models.Creator.bio.ilike(like_term))
        )
        .order_by(models.Creator.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def _search_categories(db: Session, term: str, limit: int, offset: int) -> List[models.Category]:
    like_term = f"%{term}%"
    return (
        db.query(models.Category)
        .filter(models.Category.name.ilike(like_term))
        .order_by(models.Category.name.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get(
    "/",
    response_model=schemas.SearchResult,
    status_code=status.HTTP_200_OK,
    summary="Search across videos, creators and categories",
)
def search(
    q: str = Query(..., min_length=1, description="Search term"),
    type: Optional[Literal["video", "creator", "category"]] = Query(
        None,
        description="Limit search to a specific entity type",
    ),
    limit: int = Query(20, ge=1, le=100, description="Maximum items per entity type"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(deps.get_db),
):
    """
    Unified search endpoint.

    - If `type` is provided, only that entity list is populated.
    - Otherwise all three lists are returned (each respecting `limit`/`offset`).
    """
    if not q.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query string cannot be empty",
        )

    result = schemas.SearchResult(videos=[], creators=[], categories=[])

    if type in (None, "video"):
        result.videos = [
            schemas.VideoSearchResult.from_orm(v) for v in _search_videos(db, q, limit, offset)
        ]

    if type in (None, "creator"):
        result.creators = [
            schemas.CreatorSearchResult.from_orm(c) for c in _search_creators(db, q, limit, offset)
        ]

    if type in (None, "category"):
        result.categories = [
            schemas.CategorySearchResult.from_orm(cat) for cat in _search_categories(db, q, limit, offset)
        ]

    return result
```

```python
# app/schemas/search.py
"""
Pydantic schemas for the search endpoint.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, HttpUrl, Field


class VideoSearchResult(BaseModel):
    id: int
    title: str
    thumbnail_url: Optional[HttpUrl] = None
    duration_seconds: int
    created_at: datetime
    creator_id: int
    rating: Optional[float] = None

    class Config:
        orm_mode = True


class CreatorSearchResult(BaseModel):
    id: int
    display_name: str
    avatar_url: Optional[HttpUrl] = None
    bio: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True


class CategorySearchResult(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        orm_mode = True


class SearchResult(BaseModel):
    videos: List[VideoSearchResult] = Field(default_factory=list)
    creators: List[CreatorSearchResult] = Field(default_factory=list)
    categories: List[CategorySearchResult] = Field(default_factory=list)
```

```python
# app/models/__init__.py
# Export models for easy imports
from .user import User
from .creator import Creator
from .video import Video
from .category import Category
from .comment import Comment
from .subscription import Subscription
```

```python
# app/models/video.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from .base import Base


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    video_url = Column(String, nullable=False)
    duration_seconds = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    creator_id = Column(Integer, ForeignKey("creators.id"), nullable=False, index=True)
    rating = Column(Float, nullable=True)
    is_premium = Column(Boolean, default=False)

    creator = relationship("Creator", back_populates="videos")
    comments = relationship("Comment", back_populates="video", cascade="all, delete-orphan")
```

```python
# app/models/creator.py
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from .base import Base


class Creator(Base):
    __tablename__ = "creators"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    display_name = Column(String(150), nullable=False, index=True)
    avatar_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    is_verified = Column(Boolean, default=False)

    user = relationship("User", back_populates="creator_profile")
    videos = relationship("Video", back_populates="creator", cascade="all, delete-orphan")
```

```python
# app/models/category.py
from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime

from .base import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

```python
# app/security.py
"""
Utility functions for JWT authentication.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional

from . import models, deps

# Secret key should be stored securely (env var, vault, etc.)
SECRET_KEY = "CHANGE_ME_TO_A_RANDOM_SECURE_STRING"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(deps.get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
```

```python
# app/deps.py
"""
Dependency utilities (DB session, etc.).
"""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost/adultstream")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

```python
# app/main.py
"""
FastAPI application entry point.
"""

from fastapi import FastAPI
from app.routers import search, auth, users, videos, creators, categories

app = FastAPI(
    title="AdultStream API",
    description="Backend for AdultStream – premium adult content streaming platform",
    version="0.1.0",
)

# Include routers
app.include_router(auth.router, prefix="/auth")
app.include_router(users.router, prefix="/users")
app.include_router(videos.router, prefix="/videos")
app.include_router(creators.router, prefix="/creators")
app.include_router(categories.router, prefix="/categories")
app.include_router(search.router, prefix="/search")
```

**Explanation**

* `app/routers/search.py` – the core search endpoint. It validates the JWT, receives the query string, optional type filter, pagination params, and returns a structured `SearchResult`. Simple `ILIKE` queries are used for demonstration; replace with a proper full‑text search engine for production.

* `app/schemas/search.py` – Pydantic models that shape the JSON response. `orm_mode=True` allows direct conversion from SQLAlchemy objects.

* Minimal model definitions (`Video`, `Creator`, `Category`) are provided to illustrate relationships used by the search functions.

* `app/security.py` – JWT utilities and a dependency that extracts the current active user. The search endpoint depends on `get_current_active_user` to enforce authentication.

* `app/deps.py` – DB session dependency.

* `app/main.py` – registers the search router together with other (placeholder) routers.

Add the file `app/routers/search.py` (and the supporting schema, models, security, deps, and main entry) to your project. Adjust import paths if your project structure differs, and replace the placeholder secret key and database URL with secure values. For production‑grade search, integrate PostgreSQL `tsvector` or an external search service (ElasticSearch/Meilisearch) and adjust the `_search_*` helpers accordingly.