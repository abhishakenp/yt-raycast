from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, validator
from typing import List, Optional
import uuid
import datetime
import json
import os
import shutil

# Assuming these utilities exist in the project
from app.dependencies import get_db, get_current_user
from app.models import User, ChatThread, Message, Attachment, Provider, Tag
from app.security import encrypt_data, decrypt_data, generate_user_key, verify_user_key
from app.email import send_email_async
from app.storage import get_user_storage_path, get_export_path, delete_user_storage

router = APIRouter(prefix="/privacy", tags=["privacy"])


# -------------------- Pydantic Schemas -------------------- #

class PrivacySettings(BaseModel):
    """User‑level privacy preferences."""
    share_usage_data: bool = Field(
        default=False,
        description="Allow anonymized usage data to be sent to the service for analytics."
    )
    enable_auto_backup: bool = Field(
        default=True,
        description="Automatically backup encrypted chat data to the user's chosen cloud storage."
    )
    backup_location: Optional[str] = Field(
        default=None,
        description="Identifier of the backup destination (e.g., 'dropbox', 'gdrive')."
    )
    encryption_key_rotated_at: Optional[datetime.datetime] = None

    @validator("backup_location")
    def backup_location_required_if_auto_backup(cls, v, values):
        if values.get("enable_auto_backup") and not v:
            raise ValueError("backup_location must be set when auto backup is enabled")
        return v


class ExportRequest(BaseModel):
    """Request body for data export."""
    format: str = Field(
        default="json",
        description="Export format. Currently only 'json' is supported."
    )
    include_attachments: bool = Field(
        default=False,
        description="If true, attachments will be bundled in the export archive."
    )


class DeleteAccountRequest(BaseModel):
    """Confirmation payload for account deletion."""
    confirm: bool = Field(..., description="Must be true to confirm deletion.")
    password: str = Field(..., description="Current password for verification.")


# -------------------- Helper Functions -------------------- #

def _serialize_user_data(user: User, db: Session, include_attachments: bool) -> dict:
    """Collect all user data into a serializable dict."""
    threads = (
        db.query(ChatThread)
        .filter(ChatThread.owner_id == user.id)
        .order_by(ChatThread.created_at)
        .all()
    )
    data = {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "created_at": user.created_at.isoformat(),
            "privacy_settings": json.loads(user.privacy_settings_json or "{}"),
        },
        "threads": [],
        "tags": [],
        "providers": [],
    }

    for thread in threads:
        messages = (
            db.query(Message)
            .filter(Message.thread_id == thread.id)
            .order_by(Message.created_at)
            .all()
        )
        thread_dict = {
            "id": str(thread.id),
            "title": thread.title,
            "created_at": thread.created_at.isoformat(),
            "messages": [],
        }
        for msg in messages:
            msg_dict = {
                "id": str(msg.id),
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
                "metadata": msg.metadata,
            }
            if include_attachments:
                attachments = (
                    db.query(Attachment)
                    .filter(Attachment.message_id == msg.id)
                    .all()
                )
                msg_dict["attachments"] = [
                    {
                        "id": str(att.id),
                        "filename": att.filename,
                        "mime_type": att.mime_type,
                        "size": att.size,
                    }
                    for att in attachments
                ]
            thread_dict["messages"].append(msg_dict)
        data["threads"].append(thread_dict)

    # Tags
    tags = db.query(Tag).filter(Tag.owner_id == user.id).all()
    data["tags"] = [{"id": str(t.id), "name": t.name, "color": t.color} for t in tags]

    # Providers
    providers = db.query(Provider).filter(Provider.owner_id == user.id).all()
    data["providers"] = [
        {
            "id": str(p.id),
            "name": p.name,
            "type": p.type,
            "config": p.config,
        }
        for p in providers
    ]

    return data


def _write_export_file(user: User, export_data: dict, export_path: str, include_attachments: bool, db: Session):
    """Write export data to disk, encrypting it with the user's key."""
    # Serialize to JSON
    json_bytes = json.dumps(export_data, indent=2).encode("utf-8")

    # Encrypt with user's master key
    encrypted = encrypt_data(json_bytes, user.master_key)

    # Write encrypted blob
    os.makedirs(os.path.dirname(export_path), exist_ok=True)
    with open(export_path, "wb") as f:
        f.write(encrypted)

    if include_attachments:
        # Bundle attachments in a sub‑folder next to the encrypted file
        attachments_dir = f"{export_path}_attachments"
        os.makedirs(attachments_dir, exist_ok=True)

        # Copy raw attachment files (they are already encrypted at rest)
        for thread in db.query(ChatThread).filter(ChatThread.owner_id == user.id):
            for msg in db.query(Message).filter(Message.thread_id == thread.id):
                for att in db.query(Attachment).filter(Attachment.message_id == msg.id):
                    src = get_user_storage_path(user.id, att.storage_path)
                    dst = os.path.join(attachments_dir, att.filename)
                    shutil.copy2(src, dst)


def _schedule_key_rotation(user: User, db: Session):
    """Rotate the user's master encryption key and re‑encrypt all data."""
    old_key = user.master_key
    new_key = generate_user_key()
    user.master_key = new_key
    user.privacy_settings.encryption_key_rotated_at = datetime.datetime.utcnow()
    db.add(user)

    # Re‑encrypt all messages and attachments
    for msg in db.query(Message).filter(Message.owner_id == user.id):
        decrypted = decrypt_data(msg.encrypted_content, old_key)
        msg.encrypted_content = encrypt_data(decrypted, new_key)
        db.add(msg)

    for att in db.query(Attachment).filter(Attachment.owner_id == user.id):
        # Attachments are stored as files; re‑encrypt the file on disk
        file_path = get_user_storage_path(user.id, att.storage_path)
        with open(file_path, "rb") as f:
            raw = f.read()
        decrypted = decrypt_data(raw, old_key)
        re_encrypted = encrypt_data(decrypted, new_key)
        with open(file_path, "wb") as f:
            f.write(re_encrypted)
        db.add(att)

    db.commit()


# -------------------- API Endpoints -------------------- #

@router.get("/settings", response_model=PrivacySettings)
def get_privacy_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the current user's privacy settings."""
    settings_json = current_user.privacy_settings_json or "{}"
    return PrivacySettings.parse_raw(settings_json)


@router.put("/settings", response_model=PrivacySettings)
def update_privacy_settings(
    payload: PrivacySettings,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update privacy preferences."""
    # Persist JSON representation
    current_user.privacy_settings_json = payload.json()
    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    # If the user requested a key rotation, schedule it
    if payload.encryption_key_rotated_at is None:
        # Trigger async rotation (fire‑and‑forget)
        _schedule_key_rotation(current_user, db)

    return payload


@router.post("/export", status_code=status.HTTP_202_ACCEPTED)
def request_data_export(
    request: ExportRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Queue a data export job. The user receives an email with a download link."""
    export_id = uuid.uuid4()
    export_path = get_export_path(current_user.id, f"{export_id}.enc")

    def export_job():
        export_data = _serialize_user_data(
            user=current_user,
            db=db,
            include_attachments=request.include_attachments,
        )
        _write_export_file(
            user=current_user,
            export_data=export_data,
            export_path=export_path,
            include_attachments=request.include_attachments,
            db=db,
        )
        download_url = f"{os.getenv('APP_URL')}/privacy/export/{export_id}"
        send_email_async(
            to=current_user.email,
            subject="Your Chat Collector data export is ready",
            body=f"Download your data here: {download_url}\nThe file is encrypted with your master key.",
        )

    background_tasks.add_task(export_job)
    return {"detail": "Export queued. You will receive an email when ready.", "export_id": str(export_id)}


@router.get("/export/{export_id}")
def download_export(
    export_id: str,
    current_user: User = Depends(get_current_user),
):
    """Serve the encrypted export file. Authentication ensures only the owner can download."""
    export_path = get_export_path(current_user.id, f"{export_id}.enc")
    if not os.path.isfile(export_path):
        raise HTTPException(status_code=404, detail="Export not found")

    return {
        "filename": f"chat-collector-export-{export_id}.enc",
        "file_path": export_path,
        # The actual response should be a StreamingResponse in the real app.
    }


@router.post("/delete-account", status_code=status.HTTP_202_ACCEPTED)
def request_account_deletion(
    payload: DeleteAccountRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Initiate a full account deletion after password verification."""
    if not payload.confirm:
        raise HTTPException(status_code=400, detail="Deletion not confirmed")
    if not verify_user_key(current_user, payload.password):
        raise HTTPException(status_code=403, detail="Invalid password")

    def deletion_job():
        # Delete all relational data
        db.query(Message).filter(Message.owner_id == current_user.id).delete()
        db.query(ChatThread).filter(ChatThread.owner_id == current_user.id).delete()
        db.query(Tag).filter(Tag.owner_id == current_user.id).delete()
        db.query(Provider).filter(Provider.owner_id == current_user.id).delete()
        db.query(Attachment).filter(Attachment.owner_id == current_user.id).delete()
        db.commit()

        # Delete encrypted files from storage
        delete_user_storage(current_user.id)

        # Finally, delete the user record
        db.delete(current_user)
        db.commit()

        send_email_async(
            to=current_user.email,
            subject="Your Chat Collector account has been deleted",
            body="All of your data has been permanently removed from our servers.",
        )

    background_tasks.add_task(deletion_job)
    return {"detail": "Account deletion scheduled. You will receive a confirmation email."}


@router.post("/rotate-key", status_code=status.HTTP_202_ACCEPTED)
def rotate_encryption_key(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Manually trigger a rotation of the user's master encryption key."""
    background_tasks.add_task(_schedule_key_rotation, current_user, db)
    return {"detail": "Key rotation scheduled. All data will be re‑encrypted shortly."}