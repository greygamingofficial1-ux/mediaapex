"""Iteration 9 tests: booking availability + unified admin auth (header OR ?token=).
Run: pytest /app/backend/tests/test_iter9.py -v
"""
import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN_TOKEN = "apex-admin-2026"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ===== Booking availability =====
class TestBookingAvailability:
    def test_unbooked_future_date_returns_empty_taken(self, s):
        date = "2030-12-31"
        r = s.get(f"{BASE_URL}/api/bookings/availability", params={"date": date})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["date"] == date
        assert data["taken"] == []

    def test_bad_date_format_returns_400(self, s):
        r = s.get(f"{BASE_URL}/api/bookings/availability", params={"date": "31-12-2030"})
        assert r.status_code == 400, r.text

        r = s.get(f"{BASE_URL}/api/bookings/availability", params={"date": "not-a-date"})
        assert r.status_code == 400

    def test_create_booking_then_appears_in_taken(self, s):
        # use a deterministic far-future date unique per test run
        date = "2030-11-15"
        time_slot = "14:30"
        payload = {
            "name": f"TEST_Iter9 Booker {uuid.uuid4().hex[:6]}",
            "email": "test_iter9_booking@apex.media",
            "phone": "+971500000099",
            "business": "Apex QA",
            "service": "AI Chatbots",
            "date": date,
            "time": time_slot,
            "notes": "iter9 booking test",
        }
        r = s.post(f"{BASE_URL}/api/bookings", json=payload)
        assert r.status_code in (200, 201), r.text
        b = r.json()
        assert b["date"] == date
        assert b["time"] == time_slot
        assert "id" in b

        # availability now shows the slot
        r2 = s.get(f"{BASE_URL}/api/bookings/availability", params={"date": date})
        assert r2.status_code == 200
        data = r2.json()
        assert time_slot in data["taken"], f"slot {time_slot} not in taken {data['taken']}"

        # re-post same slot returns 409 conflict
        r3 = s.post(f"{BASE_URL}/api/bookings", json=payload)
        assert r3.status_code == 409, f"expected 409, got {r3.status_code}: {r3.text}"


# ===== Unified admin auth (header OR ?token=) =====
class TestUnifiedAdminAuth:
    def _ensure_lead(self, s):
        r = s.post(f"{BASE_URL}/api/leads", json={
            "name": "TEST_Iter9 AuthLead",
            "email": "test_iter9_auth@apex.media",
            "service": "AI Chatbots",
            "budget": "AED 2,000 - 10,000",
            "message": "iter9 unified-auth lead",
        })
        assert r.status_code in (200, 201), r.text
        return r.json()["id"]

    # --- /api/admin/leads.csv ---
    def test_csv_with_header(self, s):
        r = s.get(f"{BASE_URL}/api/admin/leads.csv", headers={"X-Admin-Token": ADMIN_TOKEN})
        assert r.status_code == 200
        assert "," in r.text or r.text.startswith("id,")

    def test_csv_with_query_token(self, s):
        r = s.get(f"{BASE_URL}/api/admin/leads.csv", params={"token": ADMIN_TOKEN})
        assert r.status_code == 200

    def test_csv_no_token(self, s):
        r = s.get(f"{BASE_URL}/api/admin/leads.csv")
        assert r.status_code == 401

    # --- /api/admin/leads/{id}/quote.pdf ---
    def test_pdf_with_header(self, s):
        lid = self._ensure_lead(s)
        r = s.get(f"{BASE_URL}/api/admin/leads/{lid}/quote.pdf",
                  headers={"X-Admin-Token": ADMIN_TOKEN})
        assert r.status_code == 200
        assert "application/pdf" in r.headers.get("content-type", "").lower()
        assert r.content[:4] == b"%PDF"

    def test_pdf_with_query_token(self, s):
        lid = self._ensure_lead(s)
        r = s.get(f"{BASE_URL}/api/admin/leads/{lid}/quote.pdf",
                  params={"token": ADMIN_TOKEN})
        assert r.status_code == 200
        assert r.content[:4] == b"%PDF"

    def test_pdf_no_token(self, s):
        lid = self._ensure_lead(s)
        r = s.get(f"{BASE_URL}/api/admin/leads/{lid}/quote.pdf")
        assert r.status_code == 401

    # --- /api/admin/leads (JSON list — now accepts query token too) ---
    def test_leads_json_with_header(self, s):
        r = s.get(f"{BASE_URL}/api/admin/leads", headers={"X-Admin-Token": ADMIN_TOKEN})
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_leads_json_with_query_token(self, s):
        r = s.get(f"{BASE_URL}/api/admin/leads", params={"token": ADMIN_TOKEN})
        assert r.status_code == 200, r.text
        assert isinstance(r.json(), list)

    def test_leads_json_no_token(self, s):
        r = s.get(f"{BASE_URL}/api/admin/leads")
        assert r.status_code == 401

    def test_leads_json_wrong_token(self, s):
        r = s.get(f"{BASE_URL}/api/admin/leads", params={"token": "bad"})
        assert r.status_code == 401


# ===== Regression: existing endpoints still alive =====
class TestRegression:
    def test_root_alive(self, s):
        r = s.get(f"{BASE_URL}/api/")
        assert r.status_code == 200

    def test_create_lead_still_works(self, s):
        r = s.post(f"{BASE_URL}/api/leads", json={
            "name": "TEST_Iter9 Regression",
            "email": "test_iter9_reg@apex.media",
            "service": "AI Chatbots",
            "budget": "AED 2,000 - 10,000",
            "message": "regression check",
        })
        assert r.status_code in (200, 201)
        assert r.json()["status"] == "new"

    def test_admin_analytics(self, s):
        r = s.get(f"{BASE_URL}/api/admin/analytics", headers={"X-Admin-Token": ADMIN_TOKEN})
        assert r.status_code == 200
        assert "bookings" in r.json()

    def test_admin_login(self, s):
        r = s.post(f"{BASE_URL}/api/admin/login", json={"token": ADMIN_TOKEN})
        assert r.status_code == 200
        r2 = s.post(f"{BASE_URL}/api/admin/login".replace("{BASE_URL}", BASE_URL),
                    json={"token": "wrong"})
        assert r2.status_code == 401

    def test_chat_stream_exists(self, s):
        r = s.post(f"{BASE_URL}/api/chat/stream",
                   json={"session_id": "TEST_iter9", "message": "hi"},
                   stream=True, timeout=10)
        assert r.status_code != 404
        r.close()
