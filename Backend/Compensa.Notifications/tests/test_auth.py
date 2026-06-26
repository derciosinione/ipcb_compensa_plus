import unittest
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.api.auth import get_current_user_id
from app.core.config import settings


class NotificationAuthTests(unittest.TestCase):
    def setUp(self):
        self.signing_key = "unit-test-signing-key-with-more-than-32-chars"
        settings.JWT_SIGNING_KEY = self.signing_key
        settings.JWT_ISSUER = "Compensa.Identity"
        settings.JWT_AUDIENCE = "Compensa.Api"

    def test_get_current_user_id_returns_sub_from_valid_token(self):
        token = self._make_token({"sub": "user-123"})

        user_id = get_current_user_id(self._credentials(token))

        self.assertEqual(user_id, "user-123")

    def test_get_current_user_id_falls_back_to_name_identifier_claim(self):
        token = self._make_token(
            {
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "user-456"
            }
        )

        user_id = get_current_user_id(self._credentials(token))

        self.assertEqual(user_id, "user-456")

    def test_get_current_user_id_rejects_missing_user_id(self):
        token = self._make_token({"email": "teacher@compensa.test"})

        with self.assertRaises(HTTPException) as exc:
            get_current_user_id(self._credentials(token))

        self.assertEqual(exc.exception.status_code, 401)
        self.assertEqual(exc.exception.detail, "User ID not found in token")

    def test_get_current_user_id_rejects_invalid_token(self):
        with self.assertRaises(HTTPException) as exc:
            get_current_user_id(self._credentials("invalid-token"))

        self.assertEqual(exc.exception.status_code, 401)

    def _make_token(self, claims):
        now = datetime.now(timezone.utc)
        payload = {
            "iss": settings.JWT_ISSUER,
            "aud": settings.JWT_AUDIENCE,
            "iat": now,
            "nbf": now,
            "exp": now + timedelta(minutes=10),
            **claims,
        }
        return jwt.encode(payload, self.signing_key, algorithm="HS256")

    @staticmethod
    def _credentials(token):
        return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


if __name__ == "__main__":
    unittest.main()
