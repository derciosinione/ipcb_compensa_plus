import unittest
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.api.auth import get_current_user_context
from app.core.config import get_settings


class CompensaAIAuthTests(unittest.TestCase):
    def setUp(self):
        self.settings = get_settings()
        self.signing_key = "unit-test-signing-key-with-more-than-32-chars"
        self.settings.JWT_SIGNING_KEY = self.signing_key
        self.settings.JWT_ISSUER = "Compensa.Identity"
        self.settings.JWT_AUDIENCE = "Compensa.Api"

    def test_get_current_user_context_returns_identity_from_valid_token(self):
        token = self._make_token(
            {
                "sub": "user-123",
                "email": "teacher@compensa.test",
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": "Test Teacher",
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": ["Teacher", "Coordinator"],
            }
        )

        context = get_current_user_context(self._credentials(token))

        self.assertEqual(context["id"], "user-123")
        self.assertEqual(context["name"], "Test Teacher")
        self.assertEqual(context["email"], "teacher@compensa.test")
        self.assertEqual(context["role"], "teacher")
        self.assertEqual(context["roles"], ["teacher", "coordinator"])
        self.assertEqual(context["token"], token)

    def test_get_current_user_context_rejects_invalid_token(self):
        with self.assertRaises(HTTPException) as exc:
            get_current_user_context(self._credentials("invalid-token"))

        self.assertEqual(exc.exception.status_code, 401)

    def test_get_current_user_context_rejects_token_without_user_id(self):
        token = self._make_token({"email": "teacher@compensa.test"})

        with self.assertRaises(HTTPException) as exc:
            get_current_user_context(self._credentials(token))

        self.assertEqual(exc.exception.status_code, 401)
        self.assertEqual(exc.exception.detail, "User ID not found in token")

    def _make_token(self, claims):
        now = datetime.now(timezone.utc)
        payload = {
            "iss": self.settings.JWT_ISSUER,
            "aud": self.settings.JWT_AUDIENCE,
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
