< existing_msg.created_at:
                    to_delete_ids.append(existing_msg.id)
                    duplicate_map[key] = msg
                else:
                    to_delete_ids.append(msg.id)
        else:
            duplicate_map[key] = msg

    if not to_delete_ids:
        logger.info("No duplicates found for chat_id=%s", chat_id)
        return 0

    # Perform bulk delete
    delete_stmt = delete(Message).where(Message.id.in_(to_delete_ids))
    result = db.execute(delete_stmt)
    db.commit()

    removed_count = result.rowcount or len(to_delete_ids)
    logger.info(
        "Deduplication complete for chat_id=%s: removed %d duplicate messages",
        chat_id,
        removed_count,
    )
    return removed_count


def deduplicate_user_chats(user_id: int, db: Session, *, batch_size: int = 100) -> int:
    """
    Run deduplication across all chats belonging to a user.

    This function processes chats in batches to avoid loading the entire
    dataset into memory.

    Parameters
    ----------
    user_id: int
        The identifier of the user whose chats should be deduplicated.
    db: Session
        An active SQLAlchemy session.
    batch_size: int, optional
        Number of chats to process per transaction. Defaults to 100.

    Returns
    -------
    int
        Total number of messages removed across all chats.
    """
    logger.info("Starting global deduplication for user_id=%s", user_id)

    total_removed = 0
    offset = 0

    while True:
        chat_ids = (
            db.execute(
                select(Chat.id)
                .where(Chat.user_id == user_id)
                .order_by(Chat.id.asc())
                .offset(offset)
                .limit(batch_size)
            )
        ).scalars().all()

        if not chat_ids:
            break

        for cid in chat_ids:
            removed = deduplicate_chat_messages(cid, db)
            total_removed += removed

        offset += batch_size

    logger.info(
        "Global deduplication finished for user_id=%s: total removed=%d",
        user_id,
        total_removed,
    )
    return total_removed


# Example usage within a FastAPI endpoint or background task:
#
# from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
# from app.dependencies import get_db, get_current_user
#
# router = APIRouter()
#
# @router.post("/chats/{chat_id}/deduplicate")
# async def deduplicate_chat(
#     chat_id: int,
#     background_tasks: BackgroundTasks,
#     db: Session = Depends(get_db),
#     user: User = Depends(get_current_user),
# ):
#     # Ensure the chat belongs to the requesting user
#     chat = db.get(Chat, chat_id)
#     if not chat or chat.user_id != user.id:
#         raise HTTPException(status_code=404, detail="Chat not found")
#
#     background_tasks.add_task(deduplicate_chat_messages, chat_id, db)
#     return {"detail": "Deduplication scheduled"}
#
# @router.post("/users/me/deduplicate")
# async def deduplicate_all_chats(
#     background_tasks: BackgroundTasks,
#     db: Session = Depends(get_db),
#     user: User = Depends(get_current_user),
# ):
#     background_tasks.add_task(deduplicate_user_chats, user.id, db)
#     return {"detail": "Global deduplication scheduled"}