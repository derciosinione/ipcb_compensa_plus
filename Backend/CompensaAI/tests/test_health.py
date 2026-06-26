import unittest
from asyncio import run

from app.main import health


class CompensaAIHealthTests(unittest.TestCase):
    def test_health_returns_service_identity(self):
        response = run(health())

        self.assertEqual(response, {"status": "Healthy", "service": "compensa-ai"})


if __name__ == "__main__":
    unittest.main()
