import pytest
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_register_and_login_flow():
    # Register
    payload = {"full_name": "Test User", "email": "test@example.com", "password": "Password123"}
    r = client.post("/api/v1/auth/register", json=payload)
    assert r.status_code == 200
    assert "Registered" in r.json().get("message", "")
    token_return = r.json().get("verification_token")
    assert token_return

    # Login should be forbidden until verified
    r2 = client.post("/api/v1/auth/login", json={"email": "test@example.com", "password": "Password123"})
    assert r2.status_code == 403

    # Verify using token
    rverify = client.post("/api/v1/auth/verify", json={"token": token_return})
    assert rverify.status_code == 200

    # Login now
    r3 = client.post("/api/v1/auth/login", json={"email": "test@example.com", "password": "Password123"})
    assert r3.status_code == 200
    token = r3.json().get("access_token")
    assert token

    # Me
    headers = {"Authorization": f"Bearer {token}"}
    r4 = client.get("/api/v1/auth/me", headers=headers)
    assert r4.status_code == 200
    assert r4.json().get("email") == "test@example.com"


def test_login_wrong_password():
    r = client.post("/api/v1/auth/login", json={"email": "noone@example.com", "password": "x"})
    assert r.status_code == 401


def test_resend_verification_flow():
    # Register a new user
    payload = {"full_name": "Resend User", "email": "resend@example.com", "password": "Password123"}
    r = client.post("/api/v1/auth/register", json=payload)
    assert r.status_code == 200
    assert r.json().get("verification_token")

    # Resend verification
    r2 = client.post("/api/v1/auth/resend-verification", json={"email": "resend@example.com"})
    assert r2.status_code == 200
    token2 = r2.json().get("verification_token")
    assert token2

    # Verify with the resent token
    r3 = client.post("/api/v1/auth/verify", json={"token": token2})
    assert r3.status_code == 200

    # Now login should work
    r4 = client.post("/api/v1/auth/login", json={"email": "resend@example.com", "password": "Password123"})
    assert r4.status_code == 200
