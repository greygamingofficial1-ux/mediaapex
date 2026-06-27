from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse, PlainTextResponse
from motor.motor_asyncio import AsyncIOMotorClient
import os, io, csv, logging, uuid, time, re
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from io import BytesIO

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', 'change-me')

app = FastAPI(title="Apex Media API")
api_router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

LEAD_STATUSES = ["new", "contacted", "in_progress", "closed"]


# ===== Models =====
class LeadCreate(BaseModel):
    name: str
    business: Optional[str] = ""
    email: EmailStr
    phone: Optional[str] = ""
    country: Optional[str] = ""
    service: Optional[str] = ""
    budget: Optional[str] = ""
    message: Optional[str] = ""
    source: Optional[str] = "contact_form"


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    business: Optional[str] = ""
    email: str
    phone: Optional[str] = ""
    country: Optional[str] = ""
    service: Optional[str] = ""
    budget: Optional[str] = ""
    message: Optional[str] = ""
    source: Optional[str] = "contact_form"
    status: str = "new"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class LeadStatusUpdate(BaseModel):
    status: str


class BookingCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    business: Optional[str] = ""
    service: Optional[str] = ""
    date: str  # ISO date
    time: str  # "HH:MM"
    notes: Optional[str] = ""


class Booking(BookingCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "requested"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str


class AdminLogin(BaseModel):
    token: str


APEX_SYSTEM_PROMPT = """You are Apex AI, the premium digital growth consultant for Apex Media — an AI-powered digital agency based in Dubai, UAE.

PERSONALITY: Professional, helpful, confident, polite, premium, business-focused. Never robotic, never overpromise, never salesy.

SERVICES: Website Design, Website Development, Landing Pages, SEO, Google Ads, Meta Ads, AI Chatbots, AI Customer Support, AI Automation, CRM Integration, API Integration, Business Manager Setup, Social Media Management, Influencer Marketing, Brand Identity, Poster Design, Video Editing, AI Video Creation, VIP Numbers.

CONTACT: WhatsApp/Phone +971586169311 · Email mediaapex15@gmail.com · Dubai, UAE · Mon-Sat 9 AM-7 PM.

PRICING ranges: Landing Page AED 1,500–5,000 · Business Website AED 3,500–10,000 · Premium Corporate AED 8,000–25,000+ · AI Chatbot AED 2,000–10,000+ · Ads management custom monthly.

RULES: Never claim guaranteed sales/rankings. Use realistic language. Keep responses concise and premium. Always nudge toward booking a consultation. Currency AED."""


# ===== Admin auth =====
def require_admin(
    x_admin_token: Optional[str] = Header(None),
    token: Optional[str] = None,
):
    """Accept either the X-Admin-Token header (JSON APIs) or a ?token= query
    parameter (file downloads — CSV, PDF). Both routes share the same secret."""
    provided = x_admin_token or token
    if not provided or provided != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


# ===== Rate limiter (in-memory, per IP+route, sliding window) =====
_rate_buckets: dict[str, list[float]] = {}

def rate_limit(req: Request, route: str, max_calls: int = 5, window_sec: int = 60):
    ip = (req.headers.get("x-forwarded-for", "").split(",")[0].strip()
          or (req.client.host if req.client else "unknown"))
    key = f"{ip}:{route}"
    now = time.time()
    bucket = [t for t in _rate_buckets.get(key, []) if now - t < window_sec]
    if len(bucket) >= max_calls:
        retry = int(window_sec - (now - bucket[0]))
        raise HTTPException(status_code=429, detail=f"Too many requests. Please retry in {retry}s.",
                            headers={"Retry-After": str(max(1, retry))})
    bucket.append(now)
    _rate_buckets[key] = bucket


# ===== AI lead enrichment =====
EMAIL_RE = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PHONE_RE = re.compile(r"(\+?\d[\d\s\-()]{6,}\d)")

def extract_contacts(text: str) -> dict:
    out = {}
    if not text: return out
    m = EMAIL_RE.search(text)
    if m: out["email"] = m.group(0)
    p = PHONE_RE.search(text)
    if p: out["phone"] = re.sub(r"\s+", "", p.group(0))
    return out


async def upsert_chat_lead(session_id: str, content: str):
    """Best-effort: build/update a lead record from chat content for this session."""
    if not session_id or not content: return
    found = extract_contacts(content)
    existing = await db.leads.find_one({"chat_session_id": session_id}, {"_id": 0})
    if existing:
        update = {k: v for k, v in found.items() if v and not existing.get(k)}
        if update:
            await db.leads.update_one({"id": existing["id"]}, {"$set": update})
        return
    if "email" not in found:
        return
    # Merge any previously captured draft fields (service, budget, etc.)
    draft = await db.chat_drafts.find_one({"session_id": session_id}, {"_id": 0}) or {}
    lead = Lead(
        name=draft.get("name") or "Apex AI Lead",
        email=found["email"],
        phone=found.get("phone") or draft.get("phone") or "",
        business=draft.get("business") or "",
        service=draft.get("service") or "",
        budget=draft.get("budget") or "",
        country=draft.get("country") or "",
        message=content[:500],
        source="apex_ai_chat",
    )
    doc = lead.model_dump()
    doc["chat_session_id"] = session_id
    await db.leads.insert_one(doc)
    await db.chat_drafts.delete_one({"session_id": session_id})


# ===== Public Routes =====
@api_router.get("/")
async def root():
    return {"message": "Apex Media API", "status": "live"}


@api_router.post("/leads", response_model=Lead)
async def create_lead(payload: LeadCreate, request: Request):
    rate_limit(request, "leads", max_calls=5, window_sec=60)
    lead = Lead(**payload.model_dump())
    await db.leads.insert_one(lead.model_dump())
    return lead


@api_router.post("/bookings", response_model=Booking)
async def create_booking(payload: BookingCreate, request: Request):
    rate_limit(request, "bookings", max_calls=5, window_sec=60)
    # Prevent double-booking the same date+time slot (cancelled slots are reusable).
    clash = await db.bookings.find_one({
        "date": payload.date,
        "time": payload.time,
        "status": {"$ne": "cancelled"},
    })
    if clash:
        raise HTTPException(status_code=409, detail="This slot is already booked. Please choose another time.")
    booking = Booking(**payload.model_dump())
    await db.bookings.insert_one(booking.model_dump())
    # also drop a lead record so admin sees it in one place
    try:
        lead = Lead(
            name=payload.name, email=payload.email, phone=payload.phone or "",
            business=payload.business or "", service=payload.service or "",
            message=f"Booking request for {payload.date} {payload.time}. {payload.notes or ''}".strip(),
            source="booking",
        )
        await db.leads.insert_one(lead.model_dump())
    except Exception:
        pass
    return booking


@api_router.get("/bookings/availability")
async def booking_availability(date: str, request: Request):
    """Return the list of HH:MM slots already booked on a given ISO date.
    Public read-only endpoint so the booking form can disable taken slots."""
    rate_limit(request, "availability", max_calls=60, window_sec=60)
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date or ""):
        raise HTTPException(status_code=400, detail="date must be YYYY-MM-DD")
    docs = await db.bookings.find(
        {"date": date, "status": {"$ne": "cancelled"}},
        {"_id": 0, "time": 1},
    ).to_list(200)
    taken = sorted({d.get("time") for d in docs if d.get("time")})
    return {"date": date, "taken": taken}


@api_router.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")
    session_id = req.session_id or str(uuid.uuid4())

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=APEX_SYSTEM_PROMPT,
    ).with_model("openai", "gpt-5.2")

    await db.chat_messages.insert_one({
        "session_id": session_id, "role": "user", "content": req.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    # Enrich admin lead with any contact details mentioned by user
    try:
        await upsert_chat_lead(session_id, req.message)
    except Exception:
        pass

    parts: list[str] = []

    async def gen():
        try:
            async for ev in chat.stream_message(UserMessage(text=req.message)):
                if isinstance(ev, TextDelta):
                    parts.append(ev.content); yield ev.content
                elif isinstance(ev, StreamDone):
                    break
        except Exception:
            logger.exception("LLM stream failed")
            yield "\n\n[Apex AI is briefly unavailable. Please reach us on WhatsApp +971586169311.]"
        finally:
            try:
                await db.chat_messages.insert_one({
                    "session_id": session_id, "role": "assistant",
                    "content": "".join(parts),
                    "created_at": datetime.now(timezone.utc).isoformat(),
                })
            except Exception:
                pass

    return StreamingResponse(
        gen(),
        media_type="text/plain; charset=utf-8",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "X-Session-Id": session_id},
    )


class ChatLeadUpdate(BaseModel):
    session_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    business: Optional[str] = None
    service: Optional[str] = None
    budget: Optional[str] = None
    country: Optional[str] = None
    message: Optional[str] = None


@api_router.post("/chat/lead")
async def chat_lead(payload: ChatLeadUpdate, request: Request):
    """Upsert a lead record tied to an Apex AI chat session with any qualification fields the visitor shares."""
    rate_limit(request, "chat-lead", max_calls=30, window_sec=60)
    if not payload.session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    fields = {k: v for k, v in payload.model_dump().items()
              if k != "session_id" and v not in (None, "")}
    existing = await db.leads.find_one({"chat_session_id": payload.session_id}, {"_id": 0})
    if existing:
        if fields:
            await db.leads.update_one({"id": existing["id"]}, {"$set": fields})
        return {"ok": True, "id": existing["id"], "updated": True}
    # New lead: require at least email or phone to create
    if not (fields.get("email") or fields.get("phone")):
        # Track partial profile as draft (chat_messages already saved separately)
        await db.chat_drafts.update_one(
            {"session_id": payload.session_id},
            {"$set": {**fields, "session_id": payload.session_id, "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
        return {"ok": True, "id": None, "draft": True}
    lead = Lead(
        name=fields.get("name", "Apex AI Lead"),
        email=fields.get("email", "noemail@apex.media"),
        phone=fields.get("phone", ""),
        business=fields.get("business", ""),
        service=fields.get("service", ""),
        budget=fields.get("budget", ""),
        country=fields.get("country", ""),
        message=fields.get("message", ""),
        source="apex_ai_chat",
    )
    doc = lead.model_dump()
    doc["chat_session_id"] = payload.session_id
    # Merge any prior draft data
    draft = await db.chat_drafts.find_one({"session_id": payload.session_id}, {"_id": 0})
    if draft:
        for k in ("name","business","service","budget","country","phone","email"):
            if (not doc.get(k)) and draft.get(k):
                doc[k] = draft[k]
        await db.chat_drafts.delete_one({"session_id": payload.session_id})
    await db.leads.insert_one(doc)
    return {"ok": True, "id": doc["id"], "created": True}


# ===== Admin Routes =====
@api_router.post("/admin/login")
async def admin_login(payload: AdminLogin):
    if payload.token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"ok": True}


@api_router.get("/admin/leads", response_model=List[Lead])
async def admin_list_leads(
    _: bool = Depends(require_admin),
    status: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 500,
):
    flt = {}
    if status and status != "all":
        flt["status"] = status
    if q:
        flt["$or"] = [
            {"name":    {"$regex": q, "$options": "i"}},
            {"email":   {"$regex": q, "$options": "i"}},
            {"business":{"$regex": q, "$options": "i"}},
            {"service": {"$regex": q, "$options": "i"}},
            {"message": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.leads.find(flt, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return docs


@api_router.patch("/admin/leads/{lead_id}")
async def admin_update_lead(lead_id: str, payload: LeadStatusUpdate, _: bool = Depends(require_admin)):
    if payload.status not in LEAD_STATUSES:
        raise HTTPException(status_code=400, detail=f"status must be one of {LEAD_STATUSES}")
    r = await db.leads.update_one({"id": lead_id}, {"$set": {"status": payload.status}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"ok": True, "status": payload.status}


@api_router.get("/admin/leads.csv")
async def admin_leads_csv(_: bool = Depends(require_admin)):
    # CSV endpoint accepts query token (so plain <a download> works) or header.
    docs = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(5000)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["id","created_at","status","name","business","email","phone","country","service","budget","source","message"])
    for d in docs:
        writer.writerow([
            d.get("id",""), d.get("created_at",""), d.get("status",""),
            d.get("name",""), d.get("business",""), d.get("email",""),
            d.get("phone",""), d.get("country",""), d.get("service",""),
            d.get("budget",""), d.get("source",""), (d.get("message","") or "").replace("\n", " "),
        ])
    return PlainTextResponse(
        buf.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=apex-leads.csv"},
    )


@api_router.get("/admin/analytics")
async def admin_analytics(_: bool = Depends(require_admin)):
    total = await db.leads.count_documents({})
    by_status = {}
    for s in LEAD_STATUSES:
        by_status[s] = await db.leads.count_documents({"status": s})
    # last 7 days
    cutoff = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    last7 = await db.leads.count_documents({"created_at": {"$gte": cutoff}})
    bookings = await db.bookings.count_documents({})
    chats = await db.chat_messages.count_documents({"role": "user"})

    # group by service top 6
    pipeline = [
        {"$match": {"service": {"$nin": ["", None]}}},
        {"$group": {"_id": "$service", "n": {"$sum": 1}}},
        {"$sort": {"n": -1}}, {"$limit": 6},
    ]
    top_services = [{"service": x["_id"], "count": x["n"]} async for x in db.leads.aggregate(pipeline)]

    # daily timeline last 14 days
    daily = []
    now = datetime.now(timezone.utc).date()
    for i in range(13, -1, -1):
        d = now - timedelta(days=i)
        start = datetime.combine(d, datetime.min.time(), tzinfo=timezone.utc).isoformat()
        end   = datetime.combine(d, datetime.max.time(), tzinfo=timezone.utc).isoformat()
        n = await db.leads.count_documents({"created_at": {"$gte": start, "$lte": end}})
        daily.append({"date": d.isoformat(), "count": n})

    return {
        "total_leads": total, "by_status": by_status, "last_7_days": last7,
        "bookings": bookings, "ai_messages": chats,
        "top_services": top_services, "daily": daily,
    }


@api_router.get("/admin/bookings", response_model=List[Booking])
async def admin_list_bookings(_: bool = Depends(require_admin)):
    docs = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.get("/admin/leads/{lead_id}/chat")
async def admin_lead_chat(lead_id: str, _: bool = Depends(require_admin)):
    """Return the lead record + full Apex AI chat transcript tied to its session."""
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    transcript = []
    sid = lead.get("chat_session_id")
    if sid:
        transcript = await db.chat_messages.find(
            {"session_id": sid}, {"_id": 0}
        ).sort("created_at", 1).to_list(500)
    draft = None
    if sid:
        draft = await db.chat_drafts.find_one({"session_id": sid}, {"_id": 0})
    return {"lead": lead, "transcript": transcript, "draft": draft}


# Estimated pricing per service (AED) for quick proposal lines
SERVICE_BASE_PRICES = {
    "Website Design": (3500, 10000),
    "Website Development": (5000, 18000),
    "Landing Pages": (1500, 5000),
    "SEO": (3000, 9000),
    "Google Ads": (4000, 12000),
    "Meta Ads": (4000, 12000),
    "AI Chatbots": (2000, 10000),
    "AI Customer Support": (3500, 14000),
    "AI Automation": (4500, 18000),
    "CRM Integration": (3500, 12000),
    "API Integration": (3000, 9000),
    "Business Manager Setup": (1000, 3000),
    "Social Media Management": (3500, 12000),
    "Influencer Marketing": (5000, 25000),
    "Brand Identity": (5000, 18000),
    "Poster Design": (800, 2500),
    "Video Editing": (1500, 6000),
    "AI Video Creation": (2000, 8000),
    "VIP Numbers": (1000, 25000),
}


def build_quote_pdf(lead: dict, transcript: list) -> bytes:
    GOLD = HexColor("#D4AF37")
    WARM = HexColor("#F8F6F0")
    DARK = HexColor("#0a0a0a")
    SUB  = HexColor("#7a7a7a")

    buf = BytesIO()
    c = pdfcanvas.Canvas(buf, pagesize=A4)
    W, H = A4

    # Background
    c.setFillColor(HexColor("#030303"))
    c.rect(0, 0, W, H, stroke=0, fill=1)
    # Gold accent bar
    c.setFillColor(GOLD)
    c.rect(0, H - 6*mm, W, 6*mm, stroke=0, fill=1)

    # Brand
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(20*mm, H - 18*mm, "APEX MEDIA · DUBAI, UAE")
    c.setFillColor(WARM)
    c.setFont("Helvetica-Bold", 28)
    c.drawString(20*mm, H - 32*mm, "Proposal")
    c.setFillColor(SUB)
    c.setFont("Helvetica", 10)
    c.drawString(20*mm, H - 39*mm, "AI Powered Digital Growth Partner")

    # Right: quote meta
    c.setFillColor(SUB); c.setFont("Helvetica", 8)
    c.drawRightString(W - 20*mm, H - 18*mm, "QUOTE")
    c.setFillColor(WARM); c.setFont("Helvetica-Bold", 10)
    c.drawRightString(W - 20*mm, H - 23*mm, f"#{(lead.get('id') or '')[:8].upper()}")
    c.setFillColor(SUB); c.setFont("Helvetica", 9)
    c.drawRightString(W - 20*mm, H - 30*mm, datetime.now(timezone.utc).strftime("%d %b %Y"))

    # Client block
    y = H - 60*mm
    c.setFillColor(GOLD); c.setFont("Helvetica-Bold", 9)
    c.drawString(20*mm, y, "PREPARED FOR")
    c.setFillColor(WARM); c.setFont("Helvetica-Bold", 16)
    y -= 7*mm
    c.drawString(20*mm, y, (lead.get("name") or "Valued Client")[:60])
    c.setFillColor(SUB); c.setFont("Helvetica", 10)
    y -= 6*mm
    for line in [lead.get("business"), lead.get("email"), lead.get("phone"), lead.get("country")]:
        if line:
            c.drawString(20*mm, y, str(line)[:80]); y -= 5*mm

    # Engagement summary
    y -= 8*mm
    c.setStrokeColor(GOLD); c.setLineWidth(0.4); c.line(20*mm, y, W - 20*mm, y); y -= 8*mm
    c.setFillColor(GOLD); c.setFont("Helvetica-Bold", 9)
    c.drawString(20*mm, y, "ENGAGEMENT SUMMARY"); y -= 6*mm
    c.setFillColor(WARM); c.setFont("Helvetica", 10)
    summary = lead.get("message") or "Strategic digital growth engagement scoped from initial discovery with Apex AI."
    # naive wrap
    line, words = "", summary.split()
    for w in words:
        if len(line) + len(w) + 1 > 95:
            c.drawString(20*mm, y, line); y -= 5*mm; line = w
        else:
            line = (line + " " + w).strip()
    if line: c.drawString(20*mm, y, line); y -= 5*mm

    # Service & estimate
    y -= 6*mm
    c.setFillColor(GOLD); c.setFont("Helvetica-Bold", 9)
    c.drawString(20*mm, y, "PROPOSED SCOPE"); y -= 7*mm
    c.setFillColor(WARM); c.setFont("Helvetica-Bold", 12)
    svc = lead.get("service") or "Custom Digital Growth Engagement"
    c.drawString(20*mm, y, svc); y -= 6*mm

    lo, hi = SERVICE_BASE_PRICES.get(svc, (5000, 25000))
    budget_hint = lead.get("budget") or ""
    c.setFillColor(SUB); c.setFont("Helvetica", 9)
    c.drawString(20*mm, y, f"Indicative range based on scope and complexity"); y -= 6*mm

    # Pricing card
    c.setFillColor(HexColor("#0c0c0c"))
    c.roundRect(20*mm, y - 30*mm, W - 40*mm, 30*mm, 4*mm, stroke=0, fill=1)
    c.setFillColor(GOLD); c.setFont("Helvetica-Bold", 9)
    c.drawString(25*mm, y - 8*mm, "ESTIMATE")
    c.setFillColor(WARM); c.setFont("Helvetica-Bold", 22)
    c.drawString(25*mm, y - 18*mm, f"AED {lo:,} — {hi:,}")
    c.setFillColor(SUB); c.setFont("Helvetica", 9)
    c.drawString(25*mm, y - 25*mm, (f"Client budget noted: {budget_hint}" if budget_hint else "Final scope confirmed during discovery."))

    y -= 40*mm

    # Inclusions
    c.setFillColor(GOLD); c.setFont("Helvetica-Bold", 9)
    c.drawString(20*mm, y, "INCLUDED"); y -= 6*mm
    incl = [
        "Discovery workshop & strategy roadmap",
        "Full creative & technical execution by Apex Media",
        "Performance dashboard & weekly reporting",
        "AI automation hand-off and training",
        "Post-launch optimization for the first 30 days",
    ]
    c.setFillColor(WARM); c.setFont("Helvetica", 10)
    for i in incl:
        c.drawString(22*mm, y, "•")
        c.drawString(26*mm, y, i); y -= 5*mm

    # Footer
    c.setStrokeColor(GOLD); c.setLineWidth(0.4); c.line(20*mm, 28*mm, W - 20*mm, 28*mm)
    c.setFillColor(SUB); c.setFont("Helvetica", 8)
    c.drawString(20*mm, 22*mm, "Apex Media · Dubai, UAE  ·  +971 58 616 9311  ·  mediaapex15@gmail.com")
    c.drawString(20*mm, 17*mm, "This quote is valid for 30 days. Final pricing confirmed after discovery.")
    c.setFillColor(GOLD); c.setFont("Helvetica-Bold", 8)
    c.drawRightString(W - 20*mm, 22*mm, "WWW.APEXMEDIA.AE")

    c.showPage(); c.save()
    return buf.getvalue()


@api_router.get("/admin/leads/{lead_id}/quote.pdf")
async def admin_lead_quote_pdf(lead_id: str, _: bool = Depends(require_admin)):
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    transcript = []
    sid = lead.get("chat_session_id")
    if sid:
        transcript = await db.chat_messages.find({"session_id": sid}, {"_id": 0}).sort("created_at", 1).to_list(500)
    pdf_bytes = build_quote_pdf(lead, transcript)
    safe_name = re.sub(r"[^a-zA-Z0-9_-]+", "_", (lead.get("name") or "client"))
    from fastapi.responses import Response
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="apex-quote-{safe_name}-{lead_id[:8]}.pdf"'},
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Session-Id"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
