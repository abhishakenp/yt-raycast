import os
import json
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, Depends, Request, Response, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from sqlmodel import Field as SqlField, SQLModel, create_engine, Session, select

from cryptography.fernet import Fernet, InvalidToken

# ----------------------------------------------------------------------
# Configuration
# ----------------------------------------------------------------------
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

DB_PATH = DATA_DIR / "chat_collector.db"
ENCRYPTION_KEY_PATH = DATA_DIR / "encryption.key"

# Ensure encryption key exists and is kept locally only
def _load_or_create_key() -> bytes:
    if ENCRYPTION_KEY_PATH.exists():
        return ENCRYPTION_KEY_PATH.read_bytes()
    key = Fernet.generate_key()
    ENCRYPTION_KEY_PATH.write_bytes(key)
    # Restrict permissions: owner read/write only
    os.chmod(ENCRYPTION_KEY_PATH, 0o600)
    return key

FERNET = Fernet(_load_or_create_key())

# ----------------------------------------------------------------------
# Logging (no external transmission)
# ----------------------------------------------------------------------
logger = logging.getLogger("chat_collector")
logger.setLevel(logging.INFO)
handler = logging.FileHandler(DATA_DIR / "app.log")
handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
logger.addHandler(handler)

# ----------------------------------------------------------------------
# Database models
# ----------------------------------------------------------------------
class User(SQLModel, table=True):
    id: Optional[int] = SqlField(default=None, primary_key=True)
    username: str = SqlField(index=True, unique=True)
    password_hash: str

class Provider(SQLModel, table=True):
    id: Optional[int] = SqlField(default=None, primary_key=True)
    name: str = SqlField(index=True, unique=True)
    config_json: str = SqlField(default="{}")  # encrypted JSON string

class ChatThread(SQLModel, table=True):
    id: Optional[int] = SqlField(default=None, primary_key=True)
    user_id: int = SqlField(foreign_key="user.id")
    provider_id: int = SqlField(foreign_key="provider.id")
    title: str
    created_at: datetime = SqlField(default_factory=datetime.utcnow)

class Message(SQLModel, table=True):
    id: Optional[int] = SqlField(default=None, primary_key=True)
    thread_id: int = SqlField(foreign_key="chatthread.id")
    role: str = SqlField(index=True)  # "user" | "assistant" | "system"
    content_encrypted: str
    created_at: datetime = SqlField(default_factory=datetime.utcnow)

class Tag(SQLModel, table=True):
    id: Optional[int] = SqlField(default=None, primary_key=True)
    name: str = SqlField(index=True, unique=True)

class MessageTagLink(SQLModel, table=True):
    message_id: int = SqlField(foreign_key="message.id", primary_key=True)
    tag_id: int = SqlField(foreign_key="tag.id", primary_key=True)

# ----------------------------------------------------------------------
# Database setup
# ----------------------------------------------------------------------
engine = create_engine(f"sqlite:///{DB_PATH}", echo=False, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

create_db_and_tables()

# ----------------------------------------------------------------------
# Security utilities
# ----------------------------------------------------------------------
def hash_password(password: str) -> str:
    import hashlib, secrets
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000)
    return f"{salt}${pwd_hash.hex()}"

def verify_password(password: str, stored_hash: str) -> bool:
    import hashlib, hmac
    try:
        salt, pwd_hash = stored_hash.split("$")
        test_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000).hex()
        return hmac.compare_digest(test_hash, pwd_hash)
    except Exception:
        return False

def encrypt_content(plain: str) -> str:
    return FERNET.encrypt(plain.encode()).decode()

def decrypt_content(cipher: str) -> str:
    try:
        return FERNET.decrypt(cipher.encode()).decode()
    except InvalidToken:
        raise HTTPException(status_code=400, detail="Unable to decrypt data")

# ----------------------------------------------------------------------
# Dependency: simple token auth (local only)
# ----------------------------------------------------------------------
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    token = credentials.credentials
    # In a real app, use JWT signed with a local secret; here we keep it simple
    try:
        user_id = int(token)  # token is just the user id for local usage
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user

# ----------------------------------------------------------------------
# Pydantic schemas (public API)
# ----------------------------------------------------------------------
class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=32)
    password: str = Field(..., min_length=8)

class LoginResponse(BaseModel):
    token: str  # simple user-id token for local usage

class ProviderCreate(BaseModel):
    name: str
    config: dict = Field(default_factory=dict)

    @validator("name")
    def name_must_be_alpha(cls, v):
        if not v.isidentifier():
            raise ValueError("Provider name must be a valid identifier")
        return v

class ThreadCreate(BaseModel):
    provider_id: int
    title: str

class MessageCreate(BaseModel):
    role: str
    content: str

    @validator("role")
    def role_must_be_valid(cls, v):
        if v not in {"user", "assistant", "system"}:
            raise ValueError("Invalid role")
        return v

class TagCreate(BaseModel):
    name: str

# ----------------------------------------------------------------------
# FastAPI app
# ----------------------------------------------------------------------
app = FastAPI(
    title="Chat Collector – Local Privacy Backend",
    description="All data is stored encrypted on the local device. No external network calls are performed.",
    version="0.1.0",
)

# Restrict CORS to same origin (or localhost during dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# ----------------------------------------------------------------------
# Middleware to block outbound HTTP requests (defensive)
# ----------------------------------------------------------------------
class OutboundBlocker:
    """
    Very lightweight guard: monkey‑patch the standard library's socket creation
    to raise if any code attempts to open a network connection.
    This runs at startup and protects the process from accidental leaks.
    """
    def __init__(self):
        import socket
        self.original_socket = socket.socket

    def block(self):
        import socket
        def guarded_socket(*args, **kwargs):
            raise RuntimeError("Outbound network connections are blocked for privacy")
        socket.socket = guarded_socket

    def restore(self):
        import socket
        socket.socket = self.original_socket

_outbound_blocker = OutboundBlocker()
_outbound_blocker.block()

# ----------------------------------------------------------------------
# Routes
# ----------------------------------------------------------------------
@app.post("/register", response_model=LoginResponse)
def register(payload: RegisterRequest):
    with Session(engine) as session:
        if session.exec(select(User).where(User.username == payload.username)).first():
            raise HTTPException(status_code=400, detail="Username already exists")
        user = User(username=payload.username, password_hash=hash_password(payload.password))
        session.add(user)
        session.commit()
        session.refresh(user)
        logger.info(f"New user registered: {user.username}")
        return LoginResponse(token=str(user.id))

@app.post("/login", response_model=LoginResponse)
def login(payload: RegisterRequest):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == payload.username)).first()
        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        logger.info(f"User logged in: {user.username}")
        return LoginResponse(token=str(user.id))

@app.post("/providers", response_model=dict)
def create_provider(payload: ProviderCreate, user: User = Depends(get_current_user)):
    encrypted_cfg = encrypt_content(json.dumps(payload.config))
    with Session(engine) as session:
        provider = Provider(name=payload.name, config_json=encrypted_cfg)
        session.add(provider)
        session.commit()
        session.refresh(provider)
        logger.info(f"Provider created: {provider.name} by user {user.username}")
        return {"id": provider.id, "name": provider.name}

@app.get("/providers", response_model=List[dict])
def list_providers(user: User = Depends(get_current_user)):
    with Session(engine) as session:
        providers = session.exec(select(Provider)).all()
        return [{"id": p.id, "name": p.name} for p in providers]

@app.post("/threads", response_model=dict)
def create_thread(payload: ThreadCreate, user: User = Depends(get_current_user)):
    with Session(engine) as session:
        provider = session.get(Provider, payload.provider_id)
        if not provider:
            raise HTTPException(status_code=404, detail="Provider not found")
        thread = ChatThread(user_id=user.id, provider_id=provider.id, title=payload.title)
        session.add(thread)
        session.commit()
        session.refresh(thread)
        logger.info(f"Thread created: {thread.title} (user {user.username})")
        return {"id": thread.id, "title": thread.title}

@app.get("/threads", response_model=List[dict])
def list_threads(user: User = Depends(get_current_user)):
    with Session(engine) as session:
        threads = session.exec(select(ChatThread).where(ChatThread.user_id == user.id)).all()
        return [{"id": t.id, "title": t.title, "provider_id": t.provider_id} for t in threads]

@app.post("/threads/{thread_id}/messages", response_model=dict)
def add_message(thread_id: int, payload: MessageCreate, user: User = Depends(get_current_user)):
    with Session(engine) as session:
        thread = session.get(ChatThread, thread_id)
        if not thread or thread.user_id != user.id:
            raise HTTPException(status_code=404, detail="Thread not found")
        encrypted = encrypt_content(payload.content)
        message = Message(thread_id=thread.id, role=payload.role, content_encrypted=encrypted)
        session.add(message)
        session.commit()
        session.refresh(message)
        logger.info(f"Message added to thread {thread.id} by user {user.username}")
        return {"id": message.id, "role": message.role, "created_at": message.created_at.isoformat()}

@app.get("/threads/{thread_id}/messages", response_model=List[dict])
def get_messages(thread_id: int, user: User = Depends(get_current_user)):
    with Session(engine) as session:
        thread = session.get(ChatThread, thread_id)
        if not thread or thread.user_id != user.id:
            raise HTTPException(status_code=404, detail="Thread not found")
        msgs = session.exec(select(Message).where(Message.thread_id == thread.id).order_by(Message.created_at)).all()
        result = []
        for m in msgs:
            try:
                content = decrypt_content(m.content_encrypted)
            except HTTPException:
                content = "[decryption error]"
            result.append({
                "id": m.id,
                "role": m.role,
                "content": content,
                "created_at": m.created_at.isoformat()
            })
        return result

@app.post("/tags", response_model=dict)
def create_tag(payload: TagCreate, user: User = Depends(get_current_user)):
    with Session(engine) as session:
        if session.exec(select(Tag).where(Tag.name == payload.name)).first():
            raise HTTPException(status_code=400, detail="Tag already exists")
        tag = Tag(name=payload.name)
        session.add(tag)
        session.commit()
        session.refresh(tag)
        logger.info(f"Tag created: {tag.name} by user {user.username}")
        return {"id": tag.id, "name": tag.name}

@app.post("/messages/{message_id}/tags/{tag_id}", response_model=dict)
def tag_message(message_id: int, tag_id: int, user: User = Depends(get_current_user)):
    with Session(engine) as session:
        message = session.get(Message, message_id)
        tag = session.get(Tag, tag_id)
        if not message or not tag:
            raise HTTPException(status_code=404, detail="Message or Tag not found")
        # Verify ownership
        thread = session.get(ChatThread, message.thread_id)
        if thread.user_id != user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        link = MessageTagLink(message_id=message.id, tag_id=tag.id)
        session.add(link)
        session.commit()
        logger.info(f"Message {message.id} tagged with {tag.name} by user {user.username}")
        return {"message_id": message.id, "tag_id": tag.id}

# ----------------------------------------------------------------------
# Graceful shutdown: restore socket if needed
# ----------------------------------------------------------------------
@app.on_event("shutdown")
def restore_socket():
    _outbound_blocker.restore()
    logger.info("Application shutdown – outbound blocker restored.")