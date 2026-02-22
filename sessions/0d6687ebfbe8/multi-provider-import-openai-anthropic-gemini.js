import os
import hashlib
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models import User, ChatThread, Message, Provider, Attachment
from app.schemas import ImportResponse

router = APIRouter(prefix="/import", tags=["import"])
logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# Helper utilities
# --------------------------------------------------------------------------- #

def _hash_message(content: str, role: str, timestamp: datetime) -> str:
    """Create a deterministic hash for a message to aid deduplication."""
    h = hashlib.sha256()
    h.update(content.encode("utf-8"))
    h.update(role.encode("utf-8"))
    h.update(str(int(timestamp.timestamp())).encode("utf-8"))
    return h.hexdigest()


def _deduplicate_messages(
    db: Session, thread: ChatThread, incoming: List[Dict[str, Any]]
) -> List[Message]:
    """
    Compare incoming messages with existing ones in the thread.
    Returns a list of Message objects that are new and should be added.
    """
    existing_hashes = {
        msg.dedup_hash for msg in db.query(Message.dedup_hash)
        .filter(Message.thread_id == thread.id)
        .all()
    }

    new_messages = []
    for msg_data in incoming:
        dedup_hash = _hash_message(
            msg_data["content"], msg_data["role"], msg_data["created_at"]
        )
        if dedup_hash in existing_hashes:
            continue

        message = Message(
            thread_id=thread.id,
            role=msg_data["role"],
            content=msg_data["content"],
            created_at=msg_data["created_at"],
            dedup_hash=dedup_hash,
        )
        new_messages.append(message)

    return new_messages


def _get_or_create_thread(
    db: Session,
    user: User,
    provider_name: str,
    external_thread_id: str,
    title: Optional[str] = None,
) -> ChatThread:
    """
    Retrieve an existing thread for the given provider+external ID,
    or create a new one.
    """
    thread = (
        db.query(ChatThread)
        .filter(
            ChatThread.user_id == user.id,
            ChatThread.provider == provider_name,
            ChatThread.external_id == external_thread_id,
        )
        .first()
    )
    if thread:
        return thread

    thread = ChatThread(
        user_id=user.id,
        provider=provider_name,
        external_id=external_thread_id,
        title=title or f"{provider_name} Thread {external_thread_id}",
        created_at=datetime.utcnow(),
    )
    db.add(thread)
    db.flush()  # assign ID
    return thread


# --------------------------------------------------------------------------- #
# Provider specific import implementations
# --------------------------------------------------------------------------- #

async def _import_openai(user: User, db: Session) -> int:
    """
    Import all OpenAI chat completions for the given user.
    Requires the user to have stored an OpenAI API key in the Provider table.
    Returns the number of new messages imported.
    """
    provider = (
        db.query(Provider)
        .filter(Provider.user_id == user.id, Provider.name == "openai")
        .first()
    )
    if not provider or not provider.api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OpenAI API key not configured for this user.",
        )

    headers = {"Authorization": f"Bearer {provider.api_key}"}
    base_url = "https://api.openai.com/v1"

    # OpenAI does not expose a direct "list all chats" endpoint.
    # We'll assume the user uploads a JSON export file via a separate endpoint.
    # This function therefore only serves as a placeholder for future API support.
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="OpenAI import via API not supported; use file upload endpoint.",
    )


async def _import_anthropic(user: User, db: Session) -> int:
    """
    Import Anthropic chat history.
    Anthropic currently does not provide a public history endpoint,
    so this function expects a JSON export file to be processed elsewhere.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Anthropic import via API not supported; use file upload endpoint.",
    )


async def _import_gemini(user: User, db: Session) -> int:
    """
    Import Google Gemini chat history.
    Gemini also lacks a public history endpoint; rely on file import.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Gemini import via API not supported; use file upload endpoint.",
    )


# --------------------------------------------------------------------------- #
# Public endpoint
# --------------------------------------------------------------------------- #

@router.post("/{provider_name}", response_model=ImportResponse)
async def import_provider_history(
    provider_name: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Trigger an import for the specified provider.
    The heavy lifting runs in a background task; the endpoint returns immediately
    with a job identifier (currently a timestamp) and a status of "queued".
    """
    provider_name = provider_name.lower()
    if provider_name not in {"openai", "anthropic", "gemini"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported provider. Choose from openai, anthropic, gemini.",
        )

    job_id = datetime.utcnow().isoformat()
    background_tasks.add_task(
        _run_import_job, provider_name, user.id, job_id, db
    )
    return ImportResponse(
        job_id=job_id,
        provider=provider_name,
        status="queued",
        imported_messages=0,
        message="Import job queued. Check status via /import/status/{job_id}.",
    )


async def _run_import_job(
    provider_name: str, user_id: int, job_id: str, db: Session
):
    """
    Internal background task that performs the actual import.
    Updates a simple in‑memory job store (could be replaced by Redis/DB).
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.error(f"Import job {job_id}: user {user_id} not found")
            return

        if provider_name == "openai":
            imported = await _import_openai(user, db)
        elif provider_name == "anthropic":
            imported = await _import_anthropic(user, db)
        elif provider_name == "gemini":
            imported = await _import_gemini(user, db)
        else:
            logger.error(f"Import job {job_id}: unknown provider {provider_name}")
            return

        db.commit()
        logger.info(
            f"Import job {job_id} completed: {imported} new messages from {provider_name}"
        )
        # In a real app, update job status in a persistent store here.
    except Exception as exc:
        logger.exception(f"Import job {job_id} failed: {exc}")
        # Update job status to failed in persistent store if implemented.


# --------------------------------------------------------------------------- #
# Status endpoint (simple in‑memory placeholder)
# --------------------------------------------------------------------------- #

_job_status_store: Dict[str, Dict[str, Any]] = {}

@router.get("/status/{job_id}", response_model=ImportResponse)
def get_import_status(job_id: str):
    """
    Retrieve the status of an import job.
    This placeholder uses an in‑memory dict; replace with Redis/DB for production.
    """
    status_info = _job_status_store.get(job_id)
    if not status_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job ID not found.",
        )
    return ImportResponse(**status_info)


# --------------------------------------------------------------------------- #
# File‑upload fallback endpoint (for providers without API access)
# --------------------------------------------------------------------------- #

@router.post("/{provider_name}/upload", response_model=ImportResponse)
async def upload_provider_export(
    provider_name: str,
    file: bytes = Depends(...),  # placeholder; replace with UploadFile in real code
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Accept a JSON export file from the provider, parse it, deduplicate and store.
    The expected format is a list of threads, each containing a list of messages.
    """
    provider_name = provider_name.lower()
    if provider_name not in {"openai", "anthropic", "gemini"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported provider.",
        )

    try:
        import json

        payload = json.loads(file.decode("utf-8"))
        total_imported = 0

        for thread_data in payload.get("threads", []):
            external_id = thread_data.get("id")
            title = thread_data.get("title")
            messages = thread_data.get("messages", [])

            thread = _get_or_create_thread(
                db, user, provider_name, external_id, title
            )
            # Normalise messages
            normalized = []
            for m in messages:
                normalized.append(
                    {
                        "role": m.get("role", "assistant"),
                        "content": m.get("content", ""),
                        "created_at": datetime.fromisoformat(
                            m.get("created_at")
                        ),
                    }
                )
            new_messages = _deduplicate_messages(db, thread, normalized)
            db.add_all(new_messages)
            total_imported += len(new_messages)

        db.commit()
        job_id = datetime.utcnow().isoformat()
        _job_status_store[job_id] = {
            "job_id": job_id,
            "provider": provider_name,
            "status": "completed",
            "imported_messages": total_imported,
            "message": "File import completed successfully.",
        }
        return ImportResponse(
            job_id=job_id,
            provider=provider_name,
            status="completed",
            imported_messages=total_imported,
            message="File import completed successfully.",
        )
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON file.",
        )
    except Exception as exc:
        logger.exception(f"File import failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing the import file.",
        )