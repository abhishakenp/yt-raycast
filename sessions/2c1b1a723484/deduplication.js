< 2:
                continue  # No possible duplicates

            # Sort bucket by timestamp to make window comparison easier
            bucket.sort(key=lambda m: m.created_at)

            # Sliding window to find messages within time_window
            start = 0
            for end in range(1, len(bucket)):
                while (
                    bucket[end].created_at - bucket[start].created_at
                    > self.time_window
                ):
                    start += 1
                window = bucket[start : end + 1]
                if len(window) > 1:
                    # Record this window as a duplicate group
                    duplicate_groups.append(window.copy())

        # De‑duplicate overlapping groups (keep the largest unique sets)
        unique_groups: List[List[Message]] = []
        seen_msg_ids = set()
        for group in sorted(duplicate_groups, key=lambda g: -len(g)):
            ids = {msg.id for msg in group}
            if not ids.intersection(seen_msg_ids):
                unique_groups.append(group)
                seen_msg_ids.update(ids)

        return unique_groups

    async def _merge_group(self, group: List[Message]) -> Tuple[Message, List[int]]:
        """
        Merge a group of duplicate messages into a single canonical message.
        Returns the kept message and a list of deleted message IDs.
        """
        # Choose the earliest message as the canonical one
        canonical = min(group, key=lambda m: m.created_at)

        # Collect IDs of messages to delete (excluding canonical)
        to_delete = [msg.id for msg in group if msg.id != canonical.id]

        # Re‑associate tags and attachments from duplicates to the canonical message
        await self._relink_associations(to_delete, canonical.id)

        # Optionally, you could concatenate metadata (e.g., provider info) here

        # Delete duplicate rows
        del_stmt = delete(Message).where(Message.id.in_(to_delete))
        await self.session.execute(del_stmt)

        return canonical, to_delete

    async def _relink_associations(self, old_msg_ids: List[int], new_msg_id: int):
        """
        Move Tag and Attachment relationships from old messages to the new one.
        """
        if not old_msg_ids:
            return

        # Tags
        tag_stmt = (
            select(message_tags_association.c.tag_id)
            .where(message_tags_association.c.message_id.in_(old_msg_ids))
        )
        tag_result = await self.session.execute(tag_stmt)
        tag_ids = {row[0] for row in tag_result.fetchall()}

        for tag_id in tag_ids:
            # Insert association if it does not already exist
            insert_stmt = message_tags_association.insert().values(
                message_id=new_msg_id, tag_id=tag_id
            )
            await self.session.execute(
                insert_stmt.on_conflict_do_nothing(index_elements=["message_id", "tag_id"])
            )

        # Attachments
        att_stmt = (
            select(message_attachments_association.c.attachment_id)
            .where(message_attachments_association.c.message_id.in_(old_msg_ids))
        )
        att_result = await self.session.execute(att_stmt)
        att_ids = {row[0] for row in att_result.fetchall()}

        for att_id in att_ids:
            insert_stmt = message_attachments_association.insert().values(
                message_id=new_msg_id, attachment_id=att_id
            )
            await self.session.execute(
                insert_stmt.on_conflict_do_nothing(
                    index_elements=["message_id", "attachment_id"]
                )
            )

    async def run_for_user(self, user_id: int) -> Dict[str, int]:
        """
        Execute deduplication for a specific user.
        Returns a summary dict.
        """
        messages = await self._fetch_user_messages(user_id)
        duplicate_groups = await self._group_duplicates(messages)

        total_merged = 0
        total_deleted = 0

        for group in duplicate_groups:
            _, deleted_ids = await self._merge_group(group)
            total_merged += 1
            total_deleted += len(deleted_ids)

        await self.session.commit()

        return {
            "user_id": user_id,
            "duplicate_groups_found": len(duplicate_groups),
            "messages_merged": total_merged,
            "messages_deleted": total_deleted,
        }

    async def run_global(self) -> List[Dict[str, int]]:
        """
        Run deduplication for all users in the system.
        Returns a list of per‑user summaries.
        """
        # Fetch distinct user IDs that have messages
        stmt = select(ChatThread.owner_id).distinct()
        result = await self.session.execute(stmt)
        user_ids = [row[0] for row in result.fetchall()]

        summaries = []
        for uid in user_ids:
            summary = await self.run_for_user(uid)
            summaries.append(summary)

        return summaries

# Example usage (to be placed in an async task or endpoint):
# async def deduplication_task(session: AsyncSession):
#     service = DeduplicationService(session)
#     report = await service.run_global()
#     print("Deduplication completed:", report)