"""Backend test suite for GymTrack Pro (FastAPI + MongoDB)."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else "https://fitness-tracker-1877.preview.emergentagent.com"
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def test_user():
    email = f"test_{uuid.uuid4().hex[:8]}@gymtrack.pro"
    return {"email": email, "password": "TestPass1234", "name": "Test User"}


@pytest.fixture(scope="session")
def token(test_user):
    r = requests.post(f"{API}/auth/register", json=test_user, timeout=15)
    assert r.status_code == 200, f"register failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and "user" in data
    assert data["user"]["email"] == test_user["email"]
    return data["token"]


@pytest.fixture
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- health ----------
def test_health():
    r = requests.get(f"{API}/health", timeout=10)
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


# ---------- auth ----------
class TestAuth:
    def test_register_duplicate_email(self, token, test_user):
        r = requests.post(f"{API}/auth/register", json=test_user, timeout=15)
        assert r.status_code == 400

    def test_login_success(self, test_user, token):
        r = requests.post(f"{API}/auth/login",
                          json={"email": test_user["email"], "password": test_user["password"]}, timeout=15)
        assert r.status_code == 200
        assert "token" in r.json()

    def test_login_invalid(self, test_user):
        r = requests.post(f"{API}/auth/login",
                          json={"email": test_user["email"], "password": "wrongpass1"}, timeout=15)
        assert r.status_code == 401

    def test_me(self, auth_headers, test_user):
        r = requests.get(f"{API}/auth/me", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == test_user["email"]

    def test_me_no_token(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401


# ---------- exercises (public) ----------
def test_exercises_public():
    r = requests.get(f"{API}/exercises", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 40, f"expected >=40 exercises, got {len(data)}"


# ---------- templates ----------
class TestTemplates:
    def test_create_and_list_delete(self, auth_headers):
        payload = {
            "name": "TEST_Push Day",
            "description": "test",
            "exercises": [
                {"exerciseId": "ex1", "exerciseName": "Bench", "muscleGroup": "chest",
                 "defaultSets": 3, "defaultReps": 10}
            ],
        }
        r = requests.post(f"{API}/templates", headers=auth_headers, json=payload, timeout=15)
        assert r.status_code == 200
        tpl = r.json()
        assert tpl["name"] == "TEST_Push Day"
        assert len(tpl["exercises"]) == 1
        tid = tpl["id"]

        # list
        r = requests.get(f"{API}/templates", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert any(t["id"] == tid for t in r.json())

        # get by id
        r = requests.get(f"{API}/templates/{tid}", headers=auth_headers, timeout=15)
        assert r.status_code == 200

        # delete
        r = requests.delete(f"{API}/templates/{tid}", headers=auth_headers, timeout=15)
        assert r.status_code == 200

        # verify gone
        r = requests.get(f"{API}/templates/{tid}", headers=auth_headers, timeout=15)
        assert r.status_code == 404

    def test_templates_unauth(self):
        r = requests.get(f"{API}/templates", timeout=15)
        assert r.status_code == 401


# ---------- sessions ----------
class TestSessions:
    def test_create_full_session_with_pr(self, auth_headers):
        payload = {
            "name": "TEST_Workout",
            "workoutType": "fuerza",
            "exercises": [
                {"exerciseId": "ex-bench", "exerciseName": "Press Banca",
                 "muscleGroup": "chest",
                 "sets": [
                     {"weight": 80, "reps": 5, "isWarmup": False},
                     {"weight": 100, "reps": 3, "isWarmup": False},
                 ]}
            ],
        }
        r = requests.post(f"{API}/sessions", headers=auth_headers, json=payload, timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["totalVolume"] == 80 * 5 + 100 * 3
        assert "newPrs" in data
        assert "Press Banca" in data["newPrs"]
        sid = data["id"]

        # get
        r = requests.get(f"{API}/sessions/{sid}", headers=auth_headers, timeout=15)
        assert r.status_code == 200

        # list
        r = requests.get(f"{API}/sessions", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert any(s["id"] == sid for s in r.json())

        # update
        r = requests.put(f"{API}/sessions/{sid}", headers=auth_headers,
                         json={"notes": "great"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["notes"] == "great"

        # delete
        r = requests.delete(f"{API}/sessions/{sid}", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        r = requests.get(f"{API}/sessions/{sid}", headers=auth_headers, timeout=15)
        assert r.status_code == 404

    def test_quick_log(self, auth_headers):
        payload = {
            "name": "TEST_Quick",
            "startedAt": "2026-01-15T10:00:00Z",
            "durationMinutes": 45,
            "notes": "cardio",
            "workoutType": "cardio",
            "totalVolume": 0,
        }
        r = requests.post(f"{API}/sessions/quick", headers=auth_headers, json=payload, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["name"] == "TEST_Quick"
        assert data["durationMinutes"] == 45
        # cleanup
        requests.delete(f"{API}/sessions/{data['id']}", headers=auth_headers)

    def test_sessions_unauth(self):
        r = requests.get(f"{API}/sessions", timeout=15)
        assert r.status_code == 401


# ---------- PRs ----------
def test_personal_records(auth_headers):
    r = requests.get(f"{API}/personal-records", headers=auth_headers, timeout=15)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_prs_unauth():
    r = requests.get(f"{API}/personal-records", timeout=15)
    assert r.status_code == 401
