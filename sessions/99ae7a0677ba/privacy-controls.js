< 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="data_retention_days must be non‑negative",
            )
        current_user.data_retention_days = payload.data_retention_days

    db.commit()
    db.refresh(current_user)

    log_audit_event(
        db,
        current_user.id,
        action="privacy_settings_updated",
        details=payload.dict(exclude_unset=True),
    )

    return PrivacySettingsResponse(
        encryption_enabled=current_user.encryption_enabled,
        allow_remote_prune=current_user.allow_remote_prune,
        data_retention_days=current_user.data_retention_days,
        deletion_requested_at=current_user.deletion_requested_at,
        deletion_scheduled_for=current_user.deletion_scheduled_for,
    )


@router.post(
    "/export",
    response_model=DataExportResponse,
    summary="Request a full data export (JSON)",
)
def request_data_export(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.deletion_requested_at:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account deletion in progress; export not allowed.",
        )
    token = schedule_data_export(background_tasks, db, current_user)

    log_audit_event(
        db,
        current_user.id,
        action="data_export_requested",
        details={"export_token": token},
    )

    return DataExportResponse(
        message="Your export is being prepared. You will receive an email when ready.",
        export_token=token,
    )


@router.post(
    "/delete",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Initiate account deletion (grace period)",
)
def request_account_deletion(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.deletion_requested_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deletion already requested.",
        )
    schedule_account_deletion(background_tasks, db, current_user)

    log_audit_event(
        db,
        current_user.id,
        action="account_deletion_requested",
        details={"requested_at": datetime.utcnow().isoformat()},
    )

    return {
        "message": "Account deletion scheduled. You will receive a confirmation email. "
        "You can cancel within the grace period."
    }


@router.post(
    "/delete/cancel",
    summary="Cancel a pending account deletion",
)
def cancel_account_deletion(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.deletion_requested_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending deletion to cancel.",
        )
    current_user.deletion_requested_at = None
    current_user.deletion_scheduled_for = None
    db.commit()

    log_audit_event(
        db,
        current_user.id,
        action="account_deletion_cancelled",
        details={"cancelled_at": datetime.utcnow().isoformat()},
    )

    return {"message": "Account deletion has been cancelled."}


@router.get(
    "/audit-log",
    response_model=List[AuditLogEntry],
    summary="Retrieve audit log of privacy‑related actions",
)
def get_audit_log(
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entries = (
        db.query(AuditLog)
        .filter(AuditLog.user_id == current_user.id)
        .order_by(AuditLog.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [
        AuditLogEntry(
            id=str(entry.id),
            action=entry.action,
            details=json.loads(entry.details),
            created_at=entry.created_at,
        )
        for entry in entries
    ]


# ------------------------------
# Router registration (to be included in main app)
# ------------------------------
# In your main FastAPI app file:
# from app.routers import privacy
# app.include_router(privacy.router)