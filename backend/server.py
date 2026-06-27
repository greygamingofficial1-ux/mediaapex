from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI(title="Apex Media API")
api_router = APIRouter(prefix="/api")


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
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    history: Optional[List[ChatMessage]] = []


APEX_SYSTEM_PROMPT = """You are Apex AI, the premium digital growth consultant for Apex Media — an AI-powered digital agency based in Dubai, UAE.

PERSONALITY: Professional, helpful, confident, polite, premium, business-focused. Never robotic, never overpromise, never salesy.

SERVICES Apex Media offers:
Website Design, Website Development, Landing Pages, SEO, Google Ads, Meta Ads, AI Chatbots, AI Customer Support, AI Automation, CRM Integration, API Integration, Business Manager Setup, Social Media Management, Influencer Marketing, Brand Identity, Poster Design, Video Editing, AI Video Creation, VIP Numbers.

CONTACT:
- WhatsApp / Phone: +971586169311
- Email: mediaapex15@gmail.com
- Location: Dubai, UAE
- Hours: Mon–Sat, 9 AM – 7 PM

PRICING (give ranges only if asked, then ask to qualify):
- Landing Page: AED 1,500 – AED 5,000
- Business Website: AED 3,500 – AED 10,000
- Premium Corporate Website: AED 8,000 – AED 25,000+
- AI Chatbot: AED 2,000 – AED 10,000+
- Google/Meta Ads Management: custom monthly pricing

LEAD QUALIFICATION: When user picks a service, ask 3–5 short qualifying questions one at a time (industry, scope, budget range, timeline, contact preference). Always end with offering WhatsApp +971586169311 or booking a consultation.

INDUSTRY RECOMMENDATIONS (when user shares industry):
- Restaurant: Website, Google Maps SEO, Meta Ads, WhatsApp Automation, Reels, AI Chatbot
- Real Estate: Landing Pages, Google Ads, Meta Ads, CRM Integration, Lead Follow-up Automation, Video Ads
- Corporate Services: Premium Website, SEO, Google Ads, AI Chatbot, Appointment Booking, CRM
- Beauty/Salon: Instagram Ads, Booking System, Google Maps SEO, WhatsApp Automation, SMM

RULES:
- Never claim guaranteed sales or guaranteed rankings. Use realistic language ("designed to", "built to support", "optimized for").
- Off-topic questions → politely redirect to Apex Media services.
- Keep responses concise, premium, well-formatted. Use short paragraphs and occasional bullet points.
- Always nudge user toward booking a consultation or sharing contact details.
- Currency is AED (UAE Dirham).
"""


# ===== Routes =====
@api_router.get("/")
async def root():
    return {"message": "Apex Media API", "status": "live"}


@api_router.post("/leads", response_model=Lead)
async def create_lead(payload: LeadCreate):
    lead = Lead(**payload.model_dump())
    await db.leads.insert_one(lead.model_dump())
    return lead


@api_router.get("/leads", response_model=List[Lead])
async def list_leads():
    docs = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


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

    # Persist conversation
    await db.chat_messages.insert_one({
        "session_id": session_id,
        "role": "user",
        "content": req.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    full_text_parts: list[str] = []

    async def event_generator():
        try:
            async for ev in chat.stream_message(UserMessage(text=req.message)):
                if isinstance(ev, TextDelta):
                    full_text_parts.append(ev.content)
                    yield ev.content
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            logger.exception("LLM stream failed")
            yield f"\n\n[Apex AI is briefly unavailable. Please reach us on WhatsApp +971586169311.]"
        finally:
            # Save assistant message
            try:
                await db.chat_messages.insert_one({
                    "session_id": session_id,
                    "role": "assistant",
                    "content": "".join(full_text_parts),
                    "created_at": datetime.now(timezone.utc).isoformat(),
                })
            except Exception:
                pass

    return StreamingResponse(
        event_generator(),
        media_type="text/plain; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "X-Session-Id": session_id,
        },
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
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
