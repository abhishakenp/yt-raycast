<= end)
    return query


@router.get("/", response_model=List[ChatOut])
def search_chats(
    q: Optional[str] = Query(None, description="Free‑text search term"),
    provider_ids: Optional[List[int]] = Query(
        None, description="Filter by provider IDs"
    ),
    tag_ids: Optional[List[int]] = Query(
        None, description="Filter by tag IDs"
    ),
    date_from: Optional[datetime] = Query(
        None, description="Created after this datetime (inclusive)"
    ),
    date_to: Optional[datetime] = Query(
        None, description="Created before this datetime (inclusive)"
    ),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search and filter chats belonging to the authenticated user.

    - **q**: free‑text search across chat titles and message bodies.
    - **provider_ids**: restrict results to chats from specific providers.
    - **tag_ids**: restrict results to chats that have at least one of the supplied tags.
    - **date_from / date_to**: filter by chat creation date.
    """
    # Base query: only chats owned by the current user
    base_query = (
        select(Chat)
        .options(
            joinedload(Chat.provider),
            joinedload(Chat.tags),
            joinedload(Chat.messages).joinedload(Message.attachments),
        )
        .where(Chat.user_id == current_user.id)
    )

    # Apply filters step‑by‑step
    if q:
        # Join Message to be able to filter on its content
        base_query = base_query.join(Message, Chat.id == Message.chat_id, isouter=True)
        base_query = _apply_text_filter(base_query, q)

    if provider_ids:
        base_query = _apply_provider_filter(base_query, provider_ids)

    if tag_ids:
        base_query = _apply_tag_filter(base_query, tag_ids)

    if date_from or date_to:
        base_query = _apply_date_filter(base_query, date_from, date_to)

    # Group by Chat.id to avoid duplicate rows when joins produce multiples
    base_query = (
        base_query.group_by(Chat.id)
        .order_by(Chat.created_at.desc())
        .limit(limit)
        .offset(offset)
    )

    result = db.execute(base_query).scalars().unique().all()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No chats match the given criteria.",
        )

    return result