# Apex Media — Premium AI-Powered Digital Growth Agency (UAE)

## Original Problem Statement
Build the digital identity of one of the most premium AI-powered digital agencies in the UAE. Cinematic, luxury, dark + metallic gold. Loader → Hero (Three.js scene) → Services (19 services across 4 categories) → Portfolio (8 case studies, before/after, modal) → Process timeline → Clients/Testimonials → Contact (luxury info card + form + WhatsApp/Email) → Footer + Apex AI chatbot. Custom luxury cursor, Lenis smooth scroll, GSAP-grade motion. Tech: React + Vite/CRA + Tailwind + Three.js + R3F + Framer Motion + Lenis. Backend: FastAPI + MongoDB + GPT-5.2 (Emergent Universal Key).

## Architecture
- Frontend: React 19 (CRA + craco, `@` → `src`), Tailwind, Three.js + R3F, Framer Motion, Lenis, custom luxury cursor.
- Backend: FastAPI + Motor (MongoDB). Endpoints: `/api/`, `/api/leads` (POST/GET), `/api/chat/stream` (POST, text/plain stream).
- AI: emergentintegrations LlmChat → OpenAI `gpt-5.2` via `EMERGENT_LLM_KEY`.

## Implemented (Feb 2026)
- Cinematic Loader (particle assembly + percent counter, dissolve transition).
- Luxury multi-layer cursor: core + ring + gold particle trail + magnetic snap + ripple on click + label morph (VIEW on portfolio).
- Hero: live Three.js scene (1200 gold particles, glass rings, AI neural orb, mouse parallax, camera drift), split-text headline reveal, floating glass UI cards, stats strip, animated scroll indicator.
- Navbar: glass-pill on scroll, magnetic links.
- Services: 4 categories × 19 services, asymmetric bento grid with first-card large hero, bespoke SVG icons per service, 3D tilt + spotlight hover, results strip, CTA.
- Portfolio: 8 luxury placeholder case studies (Luxury Business Hub, NEXSWITCH, Apex Real Estate, Luxe Hotel Dubai, Elite Medical Clinic, Prestige Restaurant, Premium E-commerce, Fashion Luxury Brand), asymmetric grid, hover image zoom, "VIEW" cursor morph, full case-study modal with metrics + Challenge/Strategy/Execution/Result + before/after slider.
- Process: 7-step vertical timeline with pulsing gold nodes.
- Clients: infinite marquee logos + 3 testimonial glass cards.
- Contact: luxury glass info card (phone +971586169311, email mediaapex15@gmail.com, WhatsApp deep link, AI chat trigger, trust badges) + premium form with floating-label inputs writing to `/api/leads`.
- Footer: massive italic gold wordmark, sitemap, animated gold line, gold-orb back-to-top.
- Apex AI Chat widget: bottom-right gold pulse launcher, glass panel, quick replies, streaming responses from `/api/chat/stream`, WhatsApp/Email shortcut bar.
- Design tokens: Fraunces (display, italic accents) + Manrope (body) + JetBrains Mono (eyebrow/meta). Pure black #030303 / charcoal #0c–#11 / metallic gold #D4AF37 / warm white #F8F6F0.

## What's Working (verified by testing agent)
- Webpack compiles clean (compile-error bug fixed by creating Contact.jsx, Footer.jsx, ApexChat.jsx).
- All sections render after loader; all data-testids present.
- `POST /api/leads`, `GET /api/leads`, `POST /api/chat/stream` all 200 OK with valid payloads.
- AI chat streams a real GPT-5.2 reply end-to-end with `X-Session-Id` header.
- Contact form submits and shows success state.

## Iteration 8 — UI/UX & Interaction Audit (Feb 2026)
- Cursor now has all FOUR layers (Core, Ring, Glow, 6-dot Particle Trail) with distinct lerp values (0.45 / 0.16 / 0.09 / cascaded).
- Magnetic buttons physically translate toward the cursor (capped ±14px) in addition to cursor pull — verified inline transform on `hero-cta-primary`.
- Services grid converted from CSS grid to flex layout (`flex-grow basis-[260px]`) — eliminated empty cells in 5/6/7-card category rows; orphan items stretch to fill the row.
- Lenis ↔ GSAP ScrollTrigger bridge installed in `SmoothScroll.jsx` — fixes a black-hero regression after rapid scroll-back; `gsap.ticker` drives Lenis and `lenis.on('scroll', ScrollTrigger.update)` keeps scrub in sync.
- Trail array length corrected (8→6) to match rendered nodes.
- `html { overflow-x: hidden }` added so document `scrollWidth === clientWidth` at 390 / 768 / 1920 (0px delta).
- LuxuryCursor wrapped in fixed clipping container so its fixed children cannot expand `scrollWidth` in any environment.
- Backend regression suite added at `/app/backend/tests/test_regression.py` — 7/7 pytest pass covering `/api/`, leads POST, admin leads (header token), analytics, CSV (query token), PDF (200 + %PDF + auth matrix), chat stream.

## Iteration 9 — Sound Hooks + Booking Availability + Unified Admin Auth (Feb 2026)
- **Sound-ready hooks**: `/app/frontend/src/lib/sound.js` — `window.ApexSound` singleton (enable / disable / toggle / isEnabled / play / types). Web Audio synth for 4 cues: hover, click, success, navigate. NO autoplay — disabled by default, persisted in `localStorage.apex_sound`. `/app/frontend/src/components/SoundController.jsx` — invisible component wires global `pointerover` / `click` on `[data-magnetic]`, `apex:success`, `hashchange`, `popstate`. AudioContext unlocks on first user gesture.
- **Booking availability**: new `GET /api/bookings/availability?date=YYYY-MM-DD` returns `{date, taken:[…]}`; `POST /api/bookings` now rejects double-bookings with 409. `Contact.jsx` BookingBlock fetches availability on date change and disables taken slots in the dropdown (rendered as `HH:MM — Booked`).
- **Unified admin auth**: `require_admin` now accepts EITHER `X-Admin-Token` header OR `?token=` query — applied uniformly to `/admin/leads`, `/admin/leads.csv`, `/admin/leads/{id}/quote.pdf`, `/admin/analytics`, etc. Removes the previous split convention without breaking the existing frontend.
- Regression: backend 18/18 pytest pass (`/app/backend/tests/test_iter9.py` + `test_regression.py`); frontend 100% (no UI changes).

## Known Non-Blocking Notes
- `EmailStr` rejects non-standard test TLDs (e.g. `@apex.test`); intentional strict validation.
- Custom cursor is intentionally hidden on touch/non-precise pointer devices.
- Server.py uses two admin auth conventions (header token for JSON endpoints, query token for file downloads) — works as designed; may be unified later.

## Backlog (P2/P3)
- P2: Wire booking calendar to a real availability range / business hours UI (current implementation surfaces taken slots inside the existing dropdown).
- P2: Optional small UI toggle for the sound layer (currently opt-in via `window.ApexSound.enable()` / `localStorage.apex_sound = "on"`).
- P3: Konami / easter-egg gold-particle mode; idle AI orb wave interactions.
- P3: Clear `b.time` when ALL slots for a date are taken (currently auto-falls back to the first free slot).

## Next Actions
- Final showcase to user. Iteration 8 audit complete — site is production-ready.
