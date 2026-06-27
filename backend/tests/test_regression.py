"""Regression test for Apex Media backend after UI/UX refactor (iteration 8).
Covers: root, leads CRUD, admin endpoints, chat (existence), PDF, analytics.
"""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://premium-growth-hub-10.preview.emergentagent.com").rstrip("/")
ADMIN_TOKEN = "apex-admin-2026"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# === Basic health ===
def test_root(s):
    r = s.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, dict)


# === Lead create + persistence ===
def test_create_lead_and_persist(s):
    payload = {
        "name": "TEST_Iter8 Lead",
        "business": "Apex QA",
        "email": "test_iter8@apex.media",
        "phone": "+971500000000",
        "country": "AE",
        "service": "AI Chatbots",
        "budget": "AED 5,000 - 10,000",
        "message": "Regression iter8",
        "source": "qa",
    }
    r = s.post(f"{BASE_URL}/api/leads", json=payload)
    assert r.status_code in (200, 201), r.text
    data = r.json()
    assert "id" in data
    assert data["email"] == payload["email"]
    assert data["status"] == "new"

    # Verify it appears in admin list
    lid = data["id"]
    r2 = s.get(f"{BASE_URL}/api/admin/leads", headers={"X-Admin-Token": ADMIN_TOKEN})
    assert r2.status_code == 200
    leads = r2.json()
    assert any(l["id"] == lid for l in leads), "Created lead not present in admin list"
    return lid


def test_admin_leads_auth(s):
    # No token
    r = s.get(f"{BASE_URL}/api/admin/leads")
    assert r.status_code in (401, 403)
    # Wrong token
    r = s.get(f"{BASE_URL}/api/admin/leads", headers={"X-Admin-Token": "bad"})
    assert r.status_code in (401, 403)
    # Good token
    r = s.get(f"{BASE_URL}/api/admin/leads", headers={"X-Admin-Token": ADMIN_TOKEN})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_admin_analytics(s):
    r = s.get(f"{BASE_URL}/api/admin/analytics", headers={"X-Admin-Token": ADMIN_TOKEN})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, dict)


def test_admin_csv(s):
    r = s.get(f"{BASE_URL}/api/admin/leads.csv?token={ADMIN_TOKEN}")
    assert r.status_code == 200
    assert "text/csv" in r.headers.get("content-type", "").lower() or r.text.startswith("id,") or "," in r.text


def test_pdf_quote(s):
    # Get a lead id (create fresh)
    r = s.post(f"{BASE_URL}/api/leads", json={
        "name": "TEST_PDF Iter8",
        "email": "test_iter8_pdf@apex.media",
        "service": "AI Chatbots",
        "budget": "AED 2,000 - 10,000",
        "message": "pdf test",
    })
    assert r.status_code in (200, 201)
    lid = r.json()["id"]

    # Auth checks
    r0 = s.get(f"{BASE_URL}/api/admin/leads/{lid}/quote.pdf")
    assert r0.status_code in (401, 403)

    # Unknown id
    r404 = s.get(f"{BASE_URL}/api/admin/leads/nonexistent-id/quote.pdf?token={ADMIN_TOKEN}")
    assert r404.status_code == 404

    # Success
    r1 = s.get(f"{BASE_URL}/api/admin/leads/{lid}/quote.pdf?token={ADMIN_TOKEN}")
    assert r1.status_code == 200
    assert "application/pdf" in r1.headers.get("content-type", "").lower()
    assert r1.content[:4] == b"%PDF"
    assert "attachment" in r1.headers.get("content-disposition", "").lower()


def test_chat_endpoint_exists(s):
    # /api/chat/stream — POST should not return 404
    r = s.post(f"{BASE_URL}/api/chat/stream", json={"session_id": "TEST_iter8", "message": "hi"}, stream=True, timeout=10)
    assert r.status_code != 404, f"Chat endpoint missing: {r.status_code} {r.text[:200]}"
    r.close()
