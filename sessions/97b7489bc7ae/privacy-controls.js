< 0:
            raise ValueError("retention_days must be non‑negative")
        return v


class PrivacySettingsCreate(PrivacySettingsBase):
    pass


class PrivacySettingsRead(PrivacySettingsBase):
    user_id: int

    class Config:
        orm_mode = True


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------
def get_privacy_settings(db: Session, user_id: int) -> PrivacySettings:
    settings = db.query(PrivacySettings).filter(PrivacySettings.user_id == user_id).first()
    if not settings:
        # Create default settings on‑fly
        settings = PrivacySettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def delete_chat_from_provider(chat: Chat, provider: ProviderEnum):
    """
    Calls the appropriate provider SDK / API to delete the original chat.
    This function should be run in a background task because it may involve
    network latency.
    """
    if provider == ProviderEnum.OPENAI:
        openai_client.delete_conversation(chat.provider_chat_id)
    elif provider == ProviderEnum.ANTHROPIC:
        anthropic_client.delete_conversation(chat.provider_chat_id)
    elif provider == ProviderEnum.GEMINI:
        gemini_client.delete_conversation(chat.provider_chat_id)
    else:
        raise ValueError(f"Unsupported provider: {provider}")


def schedule_provider_deletion(
    background_tasks: BackgroundTasks,
    chat: Chat,
    user_settings: PrivacySettings,
):
    """
    If the user opted‑in for auto‑deletion, enqueue a background task to
    delete the chat from the external provider.
    """
    if user_settings.auto_delete_provider:
        background_tasks.add_task(delete_chat_from_provider, chat, chat.provider)


# ---------------------------------------------------------------------------
# API endpoints
# ---------------------------------------------------------------------------
@router.get("/", response_model=PrivacySettingsRead, status_code=status.HTTP_200_OK)
def read_privacy_settings(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """
    Retrieve the current user's privacy settings.
    """
    settings = get_privacy_settings(db, current_user.id)
    return settings


@router.put("/", response_model=PrivacySettingsRead, status_code=status.HTTP_200_OK)
def update_privacy_settings(
    payload: PrivacySettingsCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update the current user's privacy settings.
    """
    settings = get_privacy_settings(db, current_user.id)

    settings.auto_delete_provider = payload.auto_delete_provider
    settings.retention_days = payload.retention_days
    settings.encryption_enabled = payload.encryption_enabled

    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


# ---------------------------------------------------------------------------
# Integration point – called after a chat is successfully archived
# ---------------------------------------------------------------------------
def handle_post_archive(
    chat: Chat,
    db: Session,
    background_tasks: BackgroundTasks,
):
    """
    This function should be invoked by the archiving service once a chat has
    been stored locally and encrypted (if enabled). It respects the user's
    privacy settings and schedules provider‑side deletion when appropriate.
    """
    # Ensure the chat belongs to a user we can query
    user = db.query(User).filter(User.id == chat.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat owner not found."
        )

    # Load privacy settings (creates defaults if missing)
    settings = get_privacy_settings(db, user.id)

    # Schedule provider deletion if the user opted‑in
    schedule_provider_deletion(background_tasks, chat, settings)

    # Apply retention policy – mark for future cleanup if needed
    if settings.retention_days > 0:
        expiration = datetime.datetime.utcnow() + datetime.timedelta(
            days=settings.retention_days
        )
        chat.expiration_at = expiration
        db.add(chat)
        db.commit()


# ---------------------------------------------------------------------------
# Cleanup task – can be run periodically (e.g., via Celery beat or APScheduler)
# ---------------------------------------------------------------------------
def purge_expired_chats(db: Session):
    """
    Delete chats that have passed their retention period.
    This respects the user's retention_days setting.
    """
    now = datetime.datetime.utcnow()
    expired_chats = (
        db.query(Chat)
        .filter(Chat.expiration_at != None)  # noqa: E711
        .filter(Chat.expiration_at <= now)
        .all()
    )
    for chat in expired_chats:
        db.delete(chat)
    db.commit()


# ---------------------------------------------------------------------------
# Register router (to be included in main FastAPI app)
# ---------------------------------------------------------------------------
def register_routes(app):
    app.include_router(router)