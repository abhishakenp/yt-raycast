from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Field, SQLModel, Session, create_engine, select
from typing import Optional, List
from datetime import datetime, timedelta
from jose import JWTError, jwt
import httpx
import uuid
import os

# -------------------- Configuration --------------------
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ai_image_studio.db")
engine = create_engine(DATABASE_URL, echo=False)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# -------------------- Database Models --------------------
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Model(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    provider: str  # e.g., "stability", "openai"
    api_key: str   # stored encrypted in production
    description: Optional[str] = None
    is_default: bool = Field(default=False)


class Prompt(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    model_id: int = Field(foreign_key="model.id")
    text: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Image(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    prompt_id: int = Field(foreign_key="prompt.id")
    user_id: int = Field(foreign_key="user.id")
    url: str
    width: Optional[int] = None
    height: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# -------------------- Pydantic Schemas --------------------
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(SQLModel):
    email: Optional[str] = None


class UserCreate(SQLModel):
    email: str
    password: str


class PromptCreate(SQLModel):
    text: str
    model_id: Optional[int] = None  # if None, use default model


class ImageResponse(SQLModel):
    id: int
    url: str
    width: Optional[int] = None
    height: Optional[int] = None
    created_at: datetime


# -------------------- Utility Functions --------------------
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Placeholder: replace with bcrypt/scrypt in production
    return plain_password == hashed_password


def get_password_hash(password: str) -> str:
    # Placeholder: replace with bcrypt/scrypt in production
    return password


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def authenticate_user(session: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(session, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = get_user_by_email(session, token_data.email)
    if user is None:
        raise credentials_exception
    return user


def get_default_model(session: Session) -> Model:
    statement = select(Model).where(Model.is_default == True)
    model = session.exec(statement).first()
    if not model:
        raise HTTPException(status_code=500, detail="No default model configured")
    return model


# -------------------- External AI Service Integration --------------------
async def call_ai_service(
    model: Model, prompt_text: str
) -> dict:
    """
    Calls the external AI image generation service.
    Returns a dict with at least: {"url": "...", "width": int, "height": int}
    """
    # Example using Stability AI (replace with actual endpoint & params)
    if model.provider == "stability":
        endpoint = "https://api.stability.ai/v1/generation/text-to-image"
        headers = {"Authorization": f"Bearer {model.api_key}"}
        payload = {
            "prompt": prompt_text,
            "width": 512,
            "height": 512,
            "samples": 1,
            "cfg_scale": 7,
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(endpoint, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
            data = response.json()
            # Assuming the API returns a base64 image; you would upload to storage (S3, etc.)
            # Here we mock a public URL response.
            return {
                "url": data["artifacts"][0]["url"],
                "width": 512,
                "height": 512,
            }
    elif model.provider == "openai":
        endpoint = "https://api.openai.com/v1/images/generations"
        headers = {"Authorization": f"Bearer {model.api_key}"}
        payload = {"prompt": prompt_text, "n": 1, "size": "512x512"}
        async with httpx.AsyncClient() as client:
            response = await client.post(endpoint, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
            data = response.json()
            return {
                "url": data["data"][0]["url"],
                "width": 512,
                "height": 512,
            }
    else:
        raise HTTPException(status_code=400, detail="Unsupported model provider")


# -------------------- FastAPI App --------------------
app = FastAPI(title="AI Image Studio Backend")


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


# -------------------- Auth Endpoints --------------------
@app.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token)


@app.post("/users/", response_model=User)
def create_user(user_in: UserCreate, session: Session = Depends(get_session)):
    existing = get_user_by_email(session, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=user_in.email, hashed_password=get_password_hash(user_in.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


# -------------------- Image Generation Endpoint --------------------
@app.post("/generate-image/", response_model=ImageResponse)
async def generate_image(
    prompt_in: PromptCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # Resolve model
    if prompt_in.model_id:
        model = session.get(Model, prompt_in.model_id)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")
    else:
        model = get_default_model(session)

    # Store prompt
    prompt = Prompt(
        user_id=current_user.id,
        model_id=model.id,
        text=prompt_in.text,
    )
    session.add(prompt)
    session.commit()
    session.refresh(prompt)

    # Call external AI service
    try:
        ai_result = await call_ai_service(model, prompt_in.text)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(exc)}")

    # Store image metadata
    image = Image(
        prompt_id=prompt.id,
        user_id=current_user.id,
        url=ai_result["url"],
        width=ai_result.get("width"),
        height=ai_result.get("height"),
    )
    session.add(image)
    session.commit()
    session.refresh(image)

    return ImageResponse(
        id=image.id,
        url=image.url,
        width=image.width,
        height=image.height,
        created_at=image.created_at,
    )


# -------------------- Gallery Endpoints --------------------
@app.get("/gallery/", response_model=List[ImageResponse])
def list_user_images(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = (
        select(Image)
        .where(Image.user_id == current_user.id)
        .order_by(Image.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    images = session.exec(statement).all()
    return [
        ImageResponse(
            id=img.id,
            url=img.url,
            width=img.width,
            height=img.height,
            created_at=img.created_at,
        )
        for img in images
    ]


@app.delete("/images/{image_id}", status_code=204)
def delete_image(
    image_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    image = session.get(Image, image_id)
    if not image or image.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Image not found")
    session.delete(image)
    session.commit()
    return None


# -------------------- Model Management (Admin) --------------------
@app.post("/models/", response_model=Model)
def create_model(
    model_in: Model,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Insufficient privileges")
    session.add(model_in)
    session.commit()
    session.refresh(model_in)
    return model_in


@app.get("/models/", response_model=List[Model])
def list_models(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Any authenticated user can view available models
    statement = select(Model)
    return session.exec(statement).all()