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


# ---------- rate limiting (login) ----------
class TestLoginRateLimit:
    """5 failed login attempts on the same email/IP -> 429 on 6th.
    A successful login BEFORE hitting 5 resets the counter.
    Different emails have separate counters (per identifier=login:{ip}:{email}).
    """

    def test_lockout_after_5_failures(self):
        # dedicated email so we do NOT lock the main test_user account
        email = f"rl_lock_{uuid.uuid4().hex[:8]}@gymtrack.pro"
        pw = "GoodPass1234"
        r = requests.post(f"{API}/auth/register", json={"email": email, "password": pw, "name": "RL"}, timeout=15)
        assert r.status_code == 200, r.text

        # 5 failed attempts -> all should be 401
        for i in range(5):
            r = requests.post(f"{API}/auth/login", json={"email": email, "password": "wrongpass"}, timeout=15)
            assert r.status_code == 401, f"attempt {i+1} expected 401, got {r.status_code} {r.text}"

        # 6th attempt (even with correct pw) -> 429 lockout
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": pw}, timeout=15)
        assert r.status_code == 429, f"expected 429 lockout, got {r.status_code} {r.text}"
        detail = r.json().get("detail", "")
        assert "Demasiados intentos" in detail, f"unexpected msg: {detail}"

    def test_success_before_5_resets_counter(self):
        email = f"rl_reset_{uuid.uuid4().hex[:8]}@gymtrack.pro"
        pw = "GoodPass1234"
        r = requests.post(f"{API}/auth/register", json={"email": email, "password": pw, "name": "RL"}, timeout=15)
        assert r.status_code == 200

        # 4 failed attempts (still below threshold of 5)
        for _ in range(4):
            r = requests.post(f"{API}/auth/login", json={"email": email, "password": "wrongpass"}, timeout=15)
            assert r.status_code == 401

        # successful login resets counter
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": pw}, timeout=15)
        assert r.status_code == 200, r.text

        # after reset: 4 more failures should still be 401 (not 429)
        for i in range(4):
            r = requests.post(f"{API}/auth/login", json={"email": email, "password": "wrongpass"}, timeout=15)
            assert r.status_code == 401, f"after-reset attempt {i+1}: {r.status_code} {r.text}"

        # and a correct password still works (5th attempt not yet reached threshold)
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": pw}, timeout=15)
        assert r.status_code == 200

    def test_other_email_not_affected_by_lockout(self):
        """Locking out email A must not block email B (different identifier)."""
        email_a = f"rl_a_{uuid.uuid4().hex[:8]}@gymtrack.pro"
        email_b = f"rl_b_{uuid.uuid4().hex[:8]}@gymtrack.pro"
        pw = "GoodPass1234"
        for e in (email_a, email_b):
            requests.post(f"{API}/auth/register", json={"email": e, "password": pw, "name": "x"}, timeout=15)

        # lock email A
        for _ in range(5):
            requests.post(f"{API}/auth/login", json={"email": email_a, "password": "wrong"}, timeout=15)
        r = requests.post(f"{API}/auth/login", json={"email": email_a, "password": pw}, timeout=15)
        assert r.status_code == 429

        # email B should still login normally
        r = requests.post(f"{API}/auth/login", json={"email": email_b, "password": pw}, timeout=15)
        assert r.status_code == 200, r.text


# ---------- PR detection (1 per exercise = heaviest set) ----------
class TestPrDetection:
    def test_one_pr_per_exercise_heaviest_set(self, auth_headers):
        """Even with multiple ascending sets, only ONE PR is created for the heaviest set."""
        # unique exercise per test to isolate PR history
        ex_id = f"ex-prtest-{uuid.uuid4().hex[:8]}"
        payload = {
            "name": "TEST_PR_Workout",
            "workoutType": "fuerza",
            "exercises": [
                {"exerciseId": ex_id, "exerciseName": "PRTest Squat",
                 "muscleGroup": "legs",
                 "sets": [
                     {"weight": 60, "reps": 5, "isWarmup": False},
                     {"weight": 80, "reps": 5, "isWarmup": False},
                     {"weight": 100, "reps": 3, "isWarmup": False},
                     {"weight": 90, "reps": 3, "isWarmup": False},
                 ]}
            ],
        }
        r = requests.post(f"{API}/sessions", headers=auth_headers, json=payload, timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        # newPrs should contain the exercise ONCE
        assert data["newPrs"].count("PRTest Squat") == 1, f"expected 1 PR entry, got {data['newPrs']}"

        # Only one set flagged as isPr, and it's the heaviest (100kg)
        ex = data["exercises"][0]
        pr_sets = [s for s in ex["sets"] if s.get("isPr")]
        assert len(pr_sets) == 1, f"expected 1 PR set, got {len(pr_sets)}: {ex['sets']}"
        assert pr_sets[0]["weight"] == 100

        # personal-records collection has exactly one PR for this exerciseId
        r = requests.get(f"{API}/personal-records", headers=auth_headers, timeout=15)
        prs_for_ex = [p for p in r.json() if p["exerciseId"] == ex_id]
        assert len(prs_for_ex) == 1, f"expected 1 PR in DB, got {len(prs_for_ex)}"
        assert prs_for_ex[0]["prValue"] == 100

        # cleanup
        requests.delete(f"{API}/sessions/{data['id']}", headers=auth_headers)


# ---------- user isolation ----------
class TestUserIsolation:
    def _register(self):
        email = f"iso_{uuid.uuid4().hex[:8]}@gymtrack.pro"
        r = requests.post(f"{API}/auth/register", json={"email": email, "password": "IsoPass1234"}, timeout=15)
        assert r.status_code == 200
        return r.json()["token"]

    def test_user_cannot_access_other_users_session_or_template(self):
        tok_a = self._register()
        tok_b = self._register()
        ha = {"Authorization": f"Bearer {tok_a}"}
        hb = {"Authorization": f"Bearer {tok_b}"}

        # user A creates session
        payload = {"name": "TEST_ISO_A", "workoutType": "fuerza",
                   "exercises": [{"exerciseId": "iso-ex", "exerciseName": "IsoEx", "muscleGroup": "chest",
                                  "sets": [{"weight": 50, "reps": 5, "isWarmup": False}]}]}
        r = requests.post(f"{API}/sessions", headers=ha, json=payload, timeout=20)
        assert r.status_code == 200
        sid = r.json()["id"]

        # user A creates template
        r = requests.post(f"{API}/templates", headers=ha,
                          json={"name": "TEST_ISO_TPL", "exercises": []}, timeout=15)
        tid = r.json()["id"]

        # user B cannot GET user A's session
        assert requests.get(f"{API}/sessions/{sid}", headers=hb, timeout=15).status_code == 404
        # user B cannot UPDATE user A's session (should 404, not 200)
        assert requests.put(f"{API}/sessions/{sid}", headers=hb, json={"notes": "hack"}, timeout=15).status_code == 404
        # user B list should not contain A's session
        list_b = requests.get(f"{API}/sessions", headers=hb, timeout=15).json()
        assert not any(s["id"] == sid for s in list_b)

        # user B cannot GET user A's template
        assert requests.get(f"{API}/templates/{tid}", headers=hb, timeout=15).status_code == 404
        list_b_tpl = requests.get(f"{API}/templates", headers=hb, timeout=15).json()
        assert not any(t["id"] == tid for t in list_b_tpl)

        # user B delete of A's session/template should NOT actually delete (returns ok but is a no-op)
        requests.delete(f"{API}/sessions/{sid}", headers=hb, timeout=15)
        requests.delete(f"{API}/templates/{tid}", headers=hb, timeout=15)
        # verify still exists for user A
        assert requests.get(f"{API}/sessions/{sid}", headers=ha, timeout=15).status_code == 200
        assert requests.get(f"{API}/templates/{tid}", headers=ha, timeout=15).status_code == 200

        # cleanup
        requests.delete(f"{API}/sessions/{sid}", headers=ha)
        requests.delete(f"{API}/templates/{tid}", headers=ha)


# ---------- cookie fallback removed (bearer only) ----------
def test_cookie_auth_no_longer_accepted():
    """After iteration 2 fix, get_current_user only accepts Bearer header, not cookie."""
    email = f"ck_{uuid.uuid4().hex[:8]}@gymtrack.pro"
    r = requests.post(f"{API}/auth/register", json={"email": email, "password": "CkPass1234"}, timeout=15)
    assert r.status_code == 200
    token = r.json()["token"]
    # try /me with cookie only (no header)
    r = requests.get(f"{API}/auth/me", cookies={"access_token": token}, timeout=15)
    assert r.status_code == 401, f"cookie fallback should be removed; got {r.status_code}"
