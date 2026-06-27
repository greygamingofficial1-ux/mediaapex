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

## Known Non-Blocking Notes
- `EmailStr` rejects non-standard test TLDs (e.g. `@apex.test`); intentional strict validation.
- Custom cursor is intentionally hidden on touch/non-precise pointer devices.

## Backlog (P1/P2)
- P1: Wire booking calendar to backend slot endpoint (Calendar UI placeholder ready).
- P1: Reduce GSAP/ScrollTrigger reliance with explicit pinned camera sequence for Hero exit.
- P2: Add admin dashboard for leads (auth + table) — endpoint already exists.
- P2: Add hover sound hooks (architecture prepared, audio not autoplayed).
- P2: Add Lighthouse-targeted image AVIF conversion + per-section lazy mount for Three.js.
- P2: SEO meta tags + OG image + JSON-LD Organization/Service schema.
- P2: Konami / easter-egg gold-particle mode.

## Next Actions
- Showcase to user. On feedback, prioritise the P1 polish loop or feature additions.
