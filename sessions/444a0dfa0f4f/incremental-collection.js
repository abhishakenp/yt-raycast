```python
"""
incremental_collection.py

Backend logic for incremental collection of chats and messages from external providers.
Handles:
- Fetching new data using provider-specific cursors/timestamps.
- Deduplication of chats and messages.
- Persisting entities with proper relationships.
- Tagging and attachment handling (placeholder hooks).
- Emitting events for downstream processing (e.g., search indexing).

Assumptions:
- SQLAlchemy ORM models exist for User, Chat, Message, Provider, Tag, Attachment.
- Each Provider implementation exposes a `fetch_new(user: User, cursor: Optional[str]) -> ProviderFetchResult`.
- ProviderFetchResult contains `cursor` for next incremental fetch and lists of raw chat/message dicts.
- A `db_session` context manager is available for DB transactions.
- FastAPI is used as the web framework; background tasks are scheduled via Celery.
"""

import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import select, and_

from app.db import db_session  # context manager yielding a Session
from app.models import User, Chat, Message, Provider, Tag, Attachment
from app.providers.base import ProviderBase, ProviderFetchResult
from app.providers.registry import get_provider_instance

logger = logging.getLogger(__name__)


class IncrementalCollector:
    """
    Service class responsible for incremental collection per user/provider.
    """

    def __init__(self, user_id: int, provider_id: int):
        self.user_id = user_id
        self.provider_id = provider_id

    def _load_user_and_provider(self, session: Session) -> tuple[User, Provider]:
        user = session.get(User, self.user_id)
        if not user:
            raise ValueError(f"User {self.user_id} not found")
        provider = session.get(Provider, self.provider_id)
        if not provider:
            raise ValueError(f"Provider {self.provider_id} not found")
        return user, provider

    def _get_last_cursor(self, session: Session, provider: Provider) -> Optional[str]:
        """
        Retrieve the stored cursor for incremental fetch.
        The cursor is stored in Provider.last_cursor (JSONB) per user.
        """
        stmt = select(Provider).where(
            and_(Provider.id == provider.id, Provider.user_id == self.user_id)
        )
        result = session.execute(stmt).scalar_one_or_none()
        return result.last_cursor if result else None

    def _store_cursor(self, session: Session, provider: Provider, cursor: Optional[str]) -> None:
        """
        Persist the new cursor after a successful fetch.
        """
        provider.last_cursor = cursor
        session.add(provider)

    def _deduplicate_chat(self, session: Session, raw_chat: Dict[str, Any]) -> Chat:
        """
        Find existing chat by external_id + provider or create a new one.
        """
        stmt = select(Chat).where(
            and_(
                Chat.external_id == raw_chat["external_id"],
                Chat.provider_id == self.provider_id,
                Chat.user_id == self.user_id,
            )
        )
        chat = session.execute(stmt).scalar_one_or_none()
        if chat:
            # Update mutable fields (e.g., title) if changed
            if chat.title != raw_chat.get("title"):
                chat.title = raw_chat.get("title")
                session.add(chat)
            return chat

        # Create new chat
        chat = Chat(
            user_id=self.user_id,
            provider_id=self.provider_id,
            external_id=raw_chat["external_id"],
            title=raw_chat.get("title", "Untitled"),
            created_at=raw_chat.get("created_at", datetime.utcnow()),
        )
        session.add(chat)
        session.flush()  # assign id
        return chat

    def _deduplicate_message(
        self, session: Session, chat: Chat, raw_msg: Dict[str, Any]
    ) -> Message:
        """
        Find existing message by external_id + provider or create a new one.
        """
        stmt = select(Message).where(
            and_(
                Message.external_id == raw_msg["external_id"],
                Message.provider_id == self.provider_id,
                Message.chat_id == chat.id,
            )
        )
        msg = session.execute(stmt).scalar_one_or_none()
        if msg:
            # Update mutable fields (e.g., content) if changed
            if msg.content != raw_msg.get("content"):
                msg.content = raw_msg.get("content")
                msg.role = raw_msg.get("role", msg.role)
                msg.sent_at = raw_msg.get("sent_at", msg.sent_at)
                session.add(msg)
            return msg

        # Create new message
        msg = Message(
            chat_id=chat.id,
            user_id=self.user_id,
            provider_id=self.provider_id,
            external_id=raw_msg["external_id"],
            role=raw_msg.get("role", "assistant"),
            content=raw_msg.get("content", ""),
            sent_at=raw_msg.get("sent_at", datetime.utcnow()),
        )
        session.add(msg)
        session.flush()
        return msg

    def _process_attachments(
        self, session: Session, message: Message, attachments: List[Dict[str, Any]]
    ) -> None:
        """
        Placeholder for attachment handling.
        Currently stores metadata; actual file storage is out of scope.
        """
        for raw_att in attachments:
            stmt = select(Attachment).where(
                and_(
                    Attachment.external_id == raw_att["external_id"],
                    Attachment.message_id == message.id,
                )
            )
            att = session.execute(stmt).scalar_one_or_none()
            if att:
                continue  # already stored
            att = Attachment(
                message_id=message.id,
                external_id=raw_att["external_id"],
                mime_type=raw_att.get("mime_type", "application/octet-stream"),
                size=raw_att.get("size", 0),
                url=raw_att.get("url", ""),
            )
            session.add(att)

    def _apply_tags(self, session: Session, chat: Chat, tag_names: List[str]) -> None:
        """
        Ensure tags exist and associate them with the chat.
        """
        for name in set(tag_names):
            stmt = select(Tag).where(
                and_(Tag.name == name, Tag.user_id == self.user_id)
            )
            tag = session.execute(stmt).scalar_one_or_none()
            if not tag:
                tag = Tag(name=name, user_id=self.user_id)
                session.add(tag)
                session.flush()
            if tag not in chat.tags:
                chat.tags.append(tag)

    def _store_fetched_data(
        self,
        session: Session,
        fetch_result: ProviderFetchResult,
    ) -> None:
        """
        Persist chats, messages, attachments, and tags from a fetch result.
        """
        for raw_chat in fetch_result.chats:
            chat = self._deduplicate_chat(session, raw_chat)

            # Apply tags if present
            if raw_chat.get("tags"):
                self._apply_tags(session, chat, raw_chat["tags"])

            for raw_msg in raw_chat.get("messages", []):
                message = self._deduplicate_message(session, chat, raw_msg)

                # Attachments handling
                if raw_msg.get("attachments"):
                    self._process_attachments(session, message, raw_msg["attachments"])

    def collect(self) -> None:
        """
        Main entry point. Executes an incremental fetch and persists results.
        """
        with db_session() as session:
            user, provider = self._load_user_and_provider(session)
            cursor = self._get_last_cursor(session, provider)

            # Resolve concrete provider implementation
            provider_impl: ProviderBase = get_provider_instance(provider.type)

            logger.info(
                "Starting incremental collection for user=%s provider=%s cursor=%s",
                self.user_id,
                provider.type,
                cursor,
            )

            # Perform fetch (could be async; here we treat it as sync for simplicity)
            fetch_result: ProviderFetchResult = provider_impl.fetch_new(user, cursor)

            if not fetch_result.chats:
                logger.info("No new data for user=%s provider=%s", self.user_id, provider.type)
                return

            # Persist data
            self._store_fetched_data(session, fetch_result)

            # Update cursor for next run
            self._store_cursor(session, provider, fetch_result.next_cursor)

            session.commit()
            logger.info(
                "Incremental collection completed for user=%s provider=%s, stored %d chats",
                self.user_id,
                provider.type,
                len(fetch_result.chats),
            )


# ---------------------------------------------------------------------------
# Celery task wrapper (if using Celery for background processing)
# ---------------------------------------------------------------------------

from celery import shared_task

@shared_task(bind=True, name="incremental_collection_task")
def incremental_collection_task(self, user_id: int, provider_id: int) -> None:
    """
    Celery task that runs the incremental collector.
    """
    try:
        collector = IncrementalCollector(user_id=user_id, provider_id=provider_id)
        collector.collect()
    except Exception as exc:
        logger.exception(
            "Incremental collection failed for user=%s provider=%s", user_id, provider_id
        )
        raise self.retry(exc=exc, countdown=60, max_retries=5)