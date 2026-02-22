import asyncio
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update, and_
from sqlalchemy.exc import IntegrityError

from app.db import get_async_session
from app.models import User, Chat, Message, Provider, Tag, Attachment
from app.schemas import MessageCreate, ChatCreate
from app.providers.openai import OpenAIClient
from app.providers.anthropic import AnthropicClient

logger = logging.getLogger(__name__)

# Mapping provider name to client class
PROVIDER_CLIENTS = {
    "openai": OpenAIClient,
    "anthropic": AnthropicClient,
}


async def _get_last_fetched_timestamp(
    session: AsyncSession, user_id: int, provider_name: str, chat_external_id: str
) -> Optional[datetime]:
    """
    Retrieve the most recent `created_at` timestamp we have stored for a given
    external chat from a specific provider.
    """
    stmt = (
        select(Message.created_at)
        .join(Chat, Message.chat_id == Chat.id)
        .join(Provider, Chat.provider_id == Provider.id)
        .where(
            and_(
                Chat.user_id == user_id,
                Provider.name == provider_name,
                Chat.external_id == chat_external_id,
            )
        )
        .order_by(Message.created_at.desc())
        .limit(1)
    )
    result = await session.execute(stmt)
    row = result.scalar_one_or_none()
    return row


async def _fetch_new_messages_from_provider(
    client: Any,
    external_chat_id: str,
    since: Optional[datetime],
) -> List[Dict[str, Any]]:
    """
    Calls the provider‑specific client to fetch messages newer than `since`.
    The client must return a list of dicts with at least:
        - `id` (provider‑side unique identifier)
        - `role` (e.g. "user", "assistant")
        - `content` (string)
        - `created_at` (datetime)
        - optional `attachments`
    """
    try:
        return await client.fetch_chat_messages(
            chat_id=external_chat_id, after=since
        )
    except Exception as exc:
        logger.exception(
            "Failed to fetch messages from provider %s for chat %s",
            client.provider_name,
            external_chat_id,
        )
        raise exc


def _deduplicate_messages(
    existing_ids: set, incoming: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Remove messages whose provider‑side ID already exists in the DB.
    """
    deduped = [msg for msg in incoming if msg["id"] not in existing_ids]
    if len(incoming) != len(deduped):
        logger.info(
            "Deduplicated %d messages (kept %d)",
            len(incoming) - len(deduped),
            len(deduped),
        )
    return deduped


async def _store_messages(
    session: AsyncSession,
    user_id: int,
    chat: Chat,
    messages: List[Dict[str, Any]],
) -> None:
    """
    Persist a batch of messages. Handles attachment creation and tag linking.
    """
    for msg_data in messages:
        msg_create = MessageCreate(
            chat_id=chat.id,
            provider_message_id=msg_data["id"],
            role=msg_data["role"],
            content=msg_data["content"],
            created_at=msg_data["created_at"],
        )
        stmt = insert(Message).values(**msg_create.dict())
        try:
            await session.execute(stmt)
        except IntegrityError:
            # Race condition – message already inserted by another worker
            logger.debug(
                "Message %s already exists, skipping", msg_data["id"]
            )
            continue

        # Attachments handling (optional)
        attachments = msg_data.get("attachments", [])
        for att in attachments:
            att_obj = Attachment(
                message_id=msg_create.id,
                url=att["url"],
                mime_type=att.get("mime_type", "application/octet-stream"),
                size=att.get("size"),
            )
            session.add(att_obj)

    await session.commit()


async def incremental_collect_for_user(
    user_id: int,
    provider_name: str,
    external_chat_id: str,
) -> None:
    """
    Core entry point for incremental collection.
    - Determines the provider client.
    - Retrieves the last fetched timestamp.
    - Pulls new messages.
    - Deduplicates against existing DB rows.
    - Persists the new messages.
    """
    async with get_async_session() as session:
        # Resolve provider
        provider_cls = PROVIDER_CLIENTS.get(provider_name.lower())
        if not provider_cls:
            raise ValueError(f"Unsupported provider: {provider_name}")

        client = provider_cls(api_key=await _get_provider_api_key(session, user_id, provider_name))

        # Resolve Chat (or create a placeholder if missing)
        chat = await _get_or_create_chat(
            session, user_id, provider_name, external_chat_id
        )

        # Determine the cutoff timestamp
        last_ts = await _get_last_fetched_timestamp(
            session, user_id, provider_name, external_chat_id
        )

        # Fetch new messages
        raw_messages = await _fetch_new_messages_from_provider(
            client, external_chat_id, last_ts
        )
        if not raw_messages:
            logger.info(
                "No new messages for user %s, provider %s, chat %s",
                user_id,
                provider_name,
                external_chat_id,
            )
            return

        # Gather existing provider_message_ids for deduplication
        stmt = select(Message.provider_message_id).where(
            Message.chat_id == chat.id
        )
        result = await session.execute(stmt)
        existing_ids = {row[0] for row in result.fetchall()}

        # Deduplicate
        new_messages = _deduplicate_messages(existing_ids, raw_messages)

        if not new_messages:
            logger.info(
                "All fetched messages were already present for chat %s", chat.id
            )
            return

        # Store
        await _store_messages(session, user_id, chat, new_messages)
        logger.info(
            "Collected %d new messages for user %s, chat %s",
            len(new_messages),
            user_id,
            chat.id,
        )


async def _get_provider_api_key(
    session: AsyncSession, user_id: int, provider_name: str
) -> str:
    """
    Retrieve the stored API key for a user/provider combination.
    """
    stmt = select(Provider.api_key).where(
        and_(Provider.user_id == user_id, Provider.name == provider_name)
    )
    result = await session.execute(stmt)
    api_key = result.scalar_one_or_none()
    if not api_key:
        raise ValueError(
            f"API key for provider {provider_name} not found for user {user_id}"
        )
    return api_key


async def _get_or_create_chat(
    session: AsyncSession,
    user_id: int,
    provider_name: str,
    external_chat_id: str,
) -> Chat:
    """
    Fetch the Chat row matching the external ID and provider.
    If it does not exist, create a minimal placeholder (title will be updated later).
    """
    stmt = (
        select(Chat)
        .join(Provider, Chat.provider_id == Provider.id)
        .where(
            and_(
                Chat.user_id == user_id,
                Provider.name == provider_name,
                Chat.external_id == external_chat_id,
            )
        )
    )
    result = await session.execute(stmt)
    chat = result.scalar_one_or_none()
    if chat:
        return chat

    # Provider lookup / creation
    provider_stmt = select(Provider).where(
        and_(Provider.user_id == user_id, Provider.name == provider_name)
    )
    provider_res = await session.execute(provider_stmt)
    provider = provider_res.scalar_one_or_none()
    if not provider:
        provider = Provider(
            user_id=user_id,
            name=provider_name,
            display_name=provider_name.title(),
        )
        session.add(provider)
        await session.flush()  # assign id

    chat = Chat(
        user_id=user_id,
        provider_id=provider.id,
        external_id=external_chat_id,
        title="Untitled Chat",
        created_at=datetime.now(timezone.utc),
    )
    session.add(chat)
    await session.flush()
    await session.commit()
    return chat


# ---------------------------------------------------------------------------
# Background scheduler integration (example with FastAPI + APScheduler)
# ---------------------------------------------------------------------------

from apscheduler.triggers.interval import IntervalTrigger
from fastapi import Depends, BackgroundTasks

def schedule_incremental_collection(
    scheduler,
    interval_seconds: int = 300,
):
    """
    Register a periodic job that runs incremental collection for all users.
    """
    scheduler.add_job(
        func=_run_collection_for_all,
        trigger=IntervalTrigger(seconds=interval_seconds),
        name="incremental_collection",
        replace_existing=True,
    )


async def _run_collection_for_all():
    """
    Iterate over all active user/provider/chat combos and trigger collection.
    This function is deliberately lightweight – heavy lifting is delegated to
    `incremental_collect_for_user`.
    """
    async with get_async_session() as session:
        stmt = (
            select(User.id, Provider.name, Chat.external_id)
            .join(Chat, Chat.user_id == User.id)
            .join(Provider, Chat.provider_id == Provider.id)
        )
        result = await session.execute(stmt)
        rows = result.fetchall()

    tasks = []
    for user_id, provider_name, external_chat_id in rows:
        tasks.append(
            incremental_collect_for_user(user_id, provider_name, external_chat_id)
        )
    if tasks:
        await asyncio.gather(*tasks)