import unittest
from asyncio import run

from app.main import health


class NotificationHealthTests(unittest.TestCase):
    def test_health_returns_service_identity_without_rabbitmq_connection(self):
        response = run(health())

        self.assertEqual(response["status"], "Healthy")
        self.assertEqual(response["service"], "compensa-notifications")
        self.assertEqual(response["rabbitmq"], "disconnected")


if __name__ == "__main__":
    unittest.main()
