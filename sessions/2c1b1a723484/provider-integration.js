# app/models.py
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    LargeBinary,
    String,
    Text,
    UniqueConstraint,
    Table,
)
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

# Association table for many‑to‑many between ChatThread and Tag
chatthread_tag = Table(
    "chatthread_tag",
    Base.metadata,
    Column("chatthread_id", ForeignKey("chat_threads.id"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    chat_threads = relationship("ChatThread", back_populates="owner")
    providers = relationship("Provider", back_populates="owner")


class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # e.g. "OpenAI"
    type = Column(String, nullable=False)  # e.g. "openai", "anthropic"
    api_key_encrypted = Column(LargeBinary, nullable=False)
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="providers")

    # One provider can have many chat threads
    chat_threads = relationship("ChatThread", back_populates="provider")


class ChatThread(Base):
    __tablename__ = "chat_threads"
    __table_args__ = (UniqueConstraint("provider_id", "external_id", name="uq_thread_provider_external"),)

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    external_id = Column(String, nullable=False)  # ID from the provider
    created_at = Column(DateTime, default=datetime.utcnow)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="chat_threads")

    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    provider = relationship("Provider", back_populates="chat_threads")

    messages = relationship("Message", back_populates="thread", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=chatthread_tag, back_populates="threads")


class Message(Base):
    __tablename__ = "messages"
    __table_args__ = (UniqueConstraint("thread_id", "external_id", name="uq_message_thread_external"),)

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, nullable=False)  # "user", "assistant", "system"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Hash used for deduplication
    content_hash = Column(String, nullable=False, index=True)

    external_id = Column(String, nullable=False)  # ID from provider
    thread_id = Column(Integer, ForeignKey("chat_threads.id"), nullable=False)
    thread = relationship("ChatThread", back_populates="messages")

    attachments = relationship("Attachment", back_populates="message", cascade="all, delete-orphan")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)

    threads = relationship("ChatThread", secondary=chatthread_tag, back_populates="tags")


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    mime_type = Column(String, nullable=False)
    data_encrypted = Column(LargeBinary, nullable=False)

    message_id = Column(Integer, ForeignKey("messages.id"), nullable=False)
    message = relationship("Message", back_populates="attachments")

# app/schemas.py
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ProviderBase(BaseModel):
    name: str
    type: str = Field(..., description="Provider type identifier, e.g. 'openai'")
    enabled: bool = True


class ProviderCreate(ProviderBase):
    api_key: str = Field(..., description="Plain API key; will be encrypted before storage")


class ProviderRead(ProviderBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class ChatThreadBase(BaseModel):
    title: Optional[str] = None


class ChatThreadRead(ChatThreadBase):
    id: int
    external_id: str
    created_at: datetime
    provider_id: int
    tags: List[str] = []

    class Config:
        orm_mode = True


class MessageBase(BaseModel):
    role: str
    content: str


class MessageRead(MessageBase):
    id: int
    external_id: str
    created_at: datetime
    content_hash: str

    class Config:
        orm_mode = True


class SyncResult(BaseModel):
    new_threads: int
    new_messages: int
    deduped_messages: int


# app/utils/crypto.py
from cryptography.fernet import Fernet
import os

# In a real app, the key would be stored securely (e.g., env var, secret manager)
_KEY = os.getenv("APP_ENCRYPTION_KEY")
if not _KEY:
    # For demo purposes only; generate a key at startup if missing
    _KEY = Fernet.generate_key()
    os.environ["APP_ENCRYPTION_KEY"] = _KEY.decode()

_fernet = Fernet(_KEY)


def encrypt(plaintext: str) -> bytes:
    return _fernet.encrypt(plaintext.encode("utf-8"))


def decrypt(ciphertext: bytes) -> str:
    return _fernet.decrypt(ciphertext).decode("utf-8")


# app/utils/deduplication.py
import hashlib


def hash_content(content: str) -> str:
    """Return a deterministic SHA256 hash for a message's content."""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


# app/providers/base.py
from abc import ABC, abstractmethod
from typing import AsyncIterator, Dict, List

from app.models import ChatThread, Message


class ProviderBase(ABC):
    """
    Abstract base class for all provider integrations.
    Implementations must provide async iterators that yield chat threads
    and messages in a provider‑agnostic dict format.
    """

    def __init__(self, api_key: str):
        self.api_key = api_key

    @abstractmethod
    async def list_threads(self) -> AsyncIterator[Dict]:
        """
        Yield dictionaries representing threads.
        Expected keys: external_id, title, created_at (datetime)
        """
        ...

    @abstractmethod
    async def list_messages(self, thread_external_id: str) -> AsyncIterator[Dict]:
        """
        Yield dictionaries representing messages for a given thread.
        Expected keys: external_id, role, content, created_at (datetime)
        """
        ...

# app/providers/openai.py
import os
from datetime import datetime
from typing import AsyncIterator, Dict

import httpx
from app.providers.base import ProviderBase


class OpenAIProvider(ProviderBase):
    """
    Minimal OpenAI Chat Completion history fetcher.
    Uses the `/v1/threads` and `/v1/threads/{thread_id}/messages` endpoints
    from the (hypothetical) OpenAI Assistants API.
    """

    BASE_URL = "https://api.openai.com/v1"

    async def _request(self, method: str, path: str, **kwargs):
        headers = {"Authorization": f"Bearer {self.api_key}"}
        async with httpx.AsyncClient() as client:
            response = await client.request(method, f"{self.BASE_URL}{path}", headers=headers, **kwargs)
            response.raise_for_status()
            return response.json()

    async def list_threads(self) -> AsyncIterator[Dict]:
        data = await self._request("GET", "/threads")
        for thread in data.get("data", []):
            yield {
                "external_id": thread["id"],
                "title": thread.get("metadata", {}).get("title"),
                "created_at": datetime.fromisoformat(thread["created_at"]),
            }

    async def list_messages(self, thread_external_id: str) -> AsyncIterator[Dict]:
        data = await self._request("GET", f"/threads/{thread_external_id}/messages")
        for msg in data.get("data", []):
            yield {
                "external_id": msg["id"],
                "role": msg["role"],
                "content": msg["content"]["text"]["value"],
                "created_at": datetime.fromisoformat(msg["created_at"]),
            }

# app/services/provider_service.py
from typing import Dict, List, Tuple

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update
from sqlalchemy.exc import IntegrityError

from app.models import Provider, ChatThread, Message, User
from app.providers.base import ProviderBase
from app.providers.openai import OpenAIProvider
from app.utils.crypto import encrypt, decrypt
from app.utils.deduplication import hash_content


_PROVIDER_REGISTRY = {
    "openai": OpenAIProvider,
    # Future providers can be added here, e.g. "anthropic": AnthropicProvider
}


def get_provider_instance(provider: Provider) -> ProviderBase:
    cls = _PROVIDER_REGISTRY.get(provider.type)
    if not cls:
        raise ValueError(f"Unsupported provider type: {provider.type}")
    api_key = decrypt(provider.api_key_encrypted)
    return cls(api_key)


async def sync_provider(
    db: AsyncSession, user: User, provider_id: int
) -> Tuple[int, int, int]:
    """
    Sync all threads and messages from a provider for a given user.
    Returns a tuple: (new_threads, new_messages, deduped_messages)
    """
    result = await db.execute(select(Provider).where(Provider.id == provider_id, Provider.owner_id == user.id))
    provider: Provider = result.scalar_one_or_none()
    if not provider or not provider.enabled:
        raise ValueError("Provider not found or disabled")

    provider_impl = get_provider_instance(provider)

    new_threads = 0
    new_messages = 0
    deduped_messages = 0

    async for thread_data in provider_impl.list_threads():
        # Upsert thread
        stmt = insert(ChatThread).values(
            external_id=thread_data["external_id"],
            title=thread_data.get("title"),
            created_at=thread_data["created_at"],
            owner_id=user.id,
            provider_id=provider.id,
        ).on_conflict_do_nothing(index_elements=["provider_id", "external_id"])
        await db.execute(stmt)

        # Retrieve the thread (new or existing)
        result = await db.execute(
            select(ChatThread).where(
                ChatThread.provider_id == provider.id,
                ChatThread.external_id == thread_data["external_id"],
            )
        )
        thread: ChatThread = result.scalar_one()
        if thread.created_at == thread_data["created_at"]:
            new_threads += 1

        async for msg_data in provider_impl.list_messages(thread_data["external_id"]):
            content_hash = hash_content(msg_data["content"])
            stmt_msg = insert(Message).values(
                external_id=msg_data["external_id"],
                role=msg_data["role"],
                content=msg_data["content"],
                created_at=msg_data["created_at"],
                content_hash=content_hash,
                thread_id=thread.id,
            ).on_conflict_do_nothing(
                index_elements=["thread_id", "external_id"]
            )
            try:
                await db.execute(stmt_msg)
                new_messages += 1
            except IntegrityError:
                # Duplicate external_id – ignore
                pass

            # Deduplication across providers: if a message with same hash already exists in this thread, skip
            result = await db.execute(
                select(Message).where(
                    Message.thread_id == thread.id,
                    Message.content_hash == content_hash,
                )
            )
            existing = result.scalar_one_or_none()
            if existing:
                deduped_messages += 1

    await db.commit()
    return new_threads, new_messages, deduped_messages


# app/routers/provider.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas, models, dependencies, services
from app.services.provider_service import sync_provider

router = APIRouter(prefix="/providers", tags=["providers"])


@router.get("/", response_model=list[schemas.ProviderRead])
async def list_providers(
    db: AsyncSession = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user),
):
    result = await db.execute(
        select(models.Provider).where(models.Provider.owner_id == current_user.id)
    )
    return result.scalars().all()


@router.post("/", response_model=schemas.ProviderRead, status_code=status.HTTP_201_CREATED)
async def create_provider(
    payload: schemas.ProviderCreate,
    db: AsyncSession = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user),
):
    encrypted_key = encrypt(payload.api_key)
    new_provider = models.Provider(
        name=payload.name,
        type=payload.type,
        api_key_encrypted=encrypted_key,
        enabled=payload.enabled,
        owner_id=current_user.id,
    )
    db.add(new_provider)
    await db.commit()
    await db.refresh(new_provider)
    return new_provider


@router.post("/{provider_id}/sync", response_model=schemas.SyncResult)
async def sync_provider_endpoint(
    provider_id: int,
    db: AsyncSession = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user),
):
    try:
        new_threads, new_messages, deduped = await sync_provider(db, current_user, provider_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return schemas.SyncResult(
        new_threads=new_threads,
        new_messages=new_messages,
        deduped_messages=deduped,
    )

# app/dependencies.py
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session
from app.models import User
from app.utils.crypto import decrypt

# Placeholder for real authentication (e.g., OAuth2, JWT)
async def get_current_user(request: Request) -> User:
    # In a real implementation, extract token, verify, load user.
    # Here we raise 401 to indicate missing auth.
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session

# app/database.py
import os
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./chatcollector.db")

engine: AsyncEngine = create_async_engine(DATABASE_URL, echo=False, future=True)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# main.py
import uvicorn
from fastapi import FastAPI

from app.routers import provider
from app.database import engine
from app.models import Base

app = FastAPI(
    title="Chat Collector",
    description="Own and manage your AI chat history locally",
    version="0.1.0",
)

app.include_router(provider.router)


@app.on_event("startup")
async def on_startup():
    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)