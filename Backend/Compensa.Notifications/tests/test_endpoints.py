import unittest
from datetime import datetime, timezone

from fastapi import HTTPException

from app.api.endpoints import get_notifications, get_preferences, mark_notification_read, update_preferences


class NotificationEndpointTests(unittest.IsolatedAsyncioTestCase):
    async def test_get_notifications_returns_latest_user_notifications_contract(self):
        created_at = datetime(2026, 6, 25, tzinfo=timezone.utc)
        notification = FakeNotification(
            id="notification-1",
            title="Request approved",
            message="Your request was approved.",
            type="RequestStatusUpdated",
            is_read=False,
            created_at=created_at,
        )
        db = FakeDb(FakeResult(items=[notification]))

        response = await get_notifications(user_id="user-123", db=db)

        self.assertTrue(response["success"])
        self.assertEqual(response["message"], "Notifications retrieved successfully")
        self.assertEqual(
            response["data"],
            [
                {
                    "id": "notification-1",
                    "title": "Request approved",
                    "message": "Your request was approved.",
                    "type": "RequestStatusUpdated",
                    "isRead": False,
                    "createdAt": created_at,
                }
            ],
        )

    async def test_mark_notification_read_updates_only_owned_notification(self):
        notification = FakeNotification(
            id="notification-1",
            title="Request approved",
            message="Your request was approved.",
            type="RequestStatusUpdated",
            is_read=False,
            created_at=datetime.now(timezone.utc),
        )
        db = FakeDb(FakeResult(item=notification))

        response = await mark_notification_read("notification-1", user_id="user-123", db=db)

        self.assertTrue(notification.is_read)
        self.assertTrue(db.committed)
        self.assertEqual(response, {"success": True, "message": "Notification marked as read"})

    async def test_mark_notification_read_returns_404_when_not_found(self):
        db = FakeDb(FakeResult(item=None))

        with self.assertRaises(HTTPException) as exc:
            await mark_notification_read("missing", user_id="user-123", db=db)

        self.assertEqual(exc.exception.status_code, 404)

    async def test_get_preferences_defaults_email_enabled_when_missing(self):
        db = FakeDb(FakeResult(item=None))

        response = await get_preferences(user_id="user-123", db=db)

        self.assertEqual(response["data"], {"emailEnabled": True})

    async def test_update_preferences_requires_email_enabled(self):
        db = FakeDb(FakeResult(item=None))

        with self.assertRaises(HTTPException) as exc:
            await update_preferences({}, user_id="user-123", db=db)

        self.assertEqual(exc.exception.status_code, 400)
        self.assertEqual(exc.exception.detail, "emailEnabled is required")


class FakeNotification:
    def __init__(self, id, title, message, type, is_read, created_at):
        self.id = id
        self.title = title
        self.message = message
        self.type = type
        self.is_read = is_read
        self.created_at = created_at


class FakeDb:
    def __init__(self, result):
        self.result = result
        self.committed = False
        self.added = []

    async def execute(self, _statement):
        return self.result

    def add(self, entity):
        self.added.append(entity)

    async def commit(self):
        self.committed = True


class FakeResult:
    def __init__(self, item=None, items=None):
        self.item = item
        self.items = items or []

    def scalar_one_or_none(self):
        return self.item

    def scalars(self):
        return self

    def all(self):
        return self.items


if __name__ == "__main__":
    unittest.main()
