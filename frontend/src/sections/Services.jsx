import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const categories = [
  {
    key: "presence",
    title: "Digital Presence",
    num: "01",
    services: [
      { id: "web-design", name: "Website Design", desc: "Premium websites that build trust and convert visitors.", icon: "browser" },
      { id: "web-dev", name: "Website Development", desc: "Fast, scalable, responsive builds with modern tech.", icon: "code" },
      { id: "landing", name: "Landing Pages", desc: "High-converting pages built for campaigns and launches.", icon: "funnel" },
      { id: "brand", name: "Brand Identity", desc: "Luxury identity systems that elevate perception.", icon: "diamond" },
      { id: "poster", name: "Poster Design", desc: "Premium banners and creatives that look established.", icon: "frame" },
      { id: "video", name: "Video Editing", desc: "Cinematic edits for ads, reels and brand stories.", icon: "play" },
      { id: "ai-video", name: "AI Video Creation", desc: "AI-generated videos for fast, scalable content.", icon: "sparkles" },
    ],
  },
  {
    key: "growth",
    title: "Growth & Advertising",
    num: "02",
    services: [
      { id: "seo", name: "SEO", desc: "Search visibility systems for sustainable inbound growth.", icon: "globe" },
      { id: "google-ads", name: "Google Ads", desc: "Performance campaigns engineered for quality leads.", icon: "target" },
      { id: "meta-ads", name: "Meta Ads", desc: "Scroll-stopping IG & FB campaigns that convert.", icon: "share" },
      { id: "influencer", name: "Influencer Marketing", desc: "Place your brand with trusted creator audiences.", icon: "users" },
      { id: "smm", name: "Social Media Management", desc: "Consistent presence designed to build authority.", icon: "calendar" },
      { id: "bm-setup", name: "Business Manager Setup", desc: "Clean setup for ads, pixels, assets and tracking.", icon: "shield" },
    ],
  },
  {
    key: "ai",
    title: "AI & Automation",
    num: "03",
    services: [
      { id: "ai-chat", name: "AI Chatbots", desc: "24/7 assistants that answer instantly and capture leads.", icon: "chat" },
      { id: "ai-support", name: "AI Customer Support", desc: "Reduce response time and elevate experience.", icon: "headset" },
      { id: "automation", name: "AI Automation", desc: "Workflows that remove manual work end-to-end.", icon: "workflow" },
      { id: "crm", name: "CRM Integration", desc: "Unify leads, sales and customer data cleanly.", icon: "pipeline" },
      { id: "api", name: "API Integration", desc: "Connect your tools, websites and business systems.", icon: "plug" },
    ],
  },
  {
    key: "premium",
    title: "Premium Add-ons",
    num: "04",
    services: [
      { id: "vip", name: "VIP Numbers", desc: "Premium numbers for stronger brand recall and identity.", icon: "phone" },
      { id: "cro", name: "Conversion Optimization", desc: "A/B tests and funnel work to compound revenue.", icon: "trend" },
      { id: "analytics", name: "Analytics Setup", desc: "GA4, pixels and dashboards configured properly.", icon: "chart" },
      { id: "consult", name: "Consulting", desc: "Strategic direction from experienced operators.", icon: "spark" },
    ],
  },
];

function Icon({ name }) {
  const common = "w-8 h-8 text-[var(--apex-gold)]";
  switch (name) {
    case "browser": return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/></svg>);
    case "code":    return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16"/></svg>);
    case "funnel":  return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M3 4h18l-7 9v7l-4-2v-5L3 4z"/></svg>);
    case "diamond": return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M6 3h12l4 6-10 12L2 9l4-6zM2 9h20M9 3l3 6 3-6"/></svg>);
    case "frame":   return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>);
    case "play":    return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="9"/><path d="M10 8l6 4-6 4V8z" fill="currentColor"/></svg>);
    case "sparkles":return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3zM19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z"/></svg>);
    case "globe":   return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>);
    case "target":  return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>);
    case "share":   return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 11l8-4M8 13l8 4"/></svg>);
    case "users":   return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.2"/><path d="M3 19c1-3 4-5 6-5s5 2 6 5M14 19c1-2.5 3-4 5-4s4 1.5 4 4"/></svg>);
    case "calendar":return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>);
    case "shield":  return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>);
    case "chat":    return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M21 12a8 8 0 11-3-6.2L21 4l-1.2 3.2A8 8 0 0121 12z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></svg>);
    case "headset": return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M4 13v-2a8 8 0 0116 0v2M4 13a2 2 0 002 2h1v-5H6a2 2 0 00-2 2v1zM20 13a2 2 0 01-2 2h-1v-5h1a2 2 0 012 2v1z"/></svg>);
    case "workflow":return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="9" y="15" width="6" height="6" rx="1"/><path d="M6 9v3h12V9M12 12v3"/></svg>);
    case "pipeline":return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M3 7h6l3 5 3-5h6M3 17h6l3-5 3 5h6"/></svg>);
    case "plug":    return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M9 2v6M15 2v6M7 8h10v3a5 5 0 01-5 5 5 5 0 01-5-5V8zM12 16v6"/></svg>);
    case "phone":   return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M5 3h6l2 5-3 2a12 12 0 006 6l2-3 5 2v6c-9 0-18-9-18-18z"/></svg>);
    case "trend":   return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M3 17l6-6 4 4 8-9M15 6h6v6"/></svg>);
    case "chart":   return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M4 20V8M10 20V4M16 20v-8M22 20H2"/></svg>);
    case "spark":   return (<svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M12 3v6M12 15v6M3 12h6M15 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4"/></svg>);
    default:        return null;
  }
}

function ServiceCard({ s, large }) {
  const cardRef = useRef(null);
  const onMove = (e) => {
    const el = cardRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
    const rx = ((y - 50) / 50) * -4;
    const ry = ((x - 50) / 50) * 4;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  };
  const onLeave = () => {
    const el = cardRef.current; if (!el) return;
    el.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg)`;
  };
  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      data-testid={`service-card-${s.id}`}
      className={`group spotlight tilt-card glass rounded-2xl p-7 md:p-8 transition-colors duration-500 hover:border-[var(--apex-gold)]/40 ${large ? "md:col-span-2 md:row-span-2" : ""}`}
    >
      <div className="flex items-start justify-between">
        <Icon name={s.icon} />
        <span className="font-mono text-[10px] tracking-[0.3em] text-white/30">/SERVICE</span>
      </div>
      <h3 className={`mt-8 font-display text-[var(--apex-warm)] leading-tight ${large ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"}`}>
        {s.name}
      </h3>
      <p className="mt-3 text-sm text-white/55 leading-relaxed max-w-md">{s.desc}</p>
      <div className="mt-8 flex items-center justify-between text-[10px] font-mono tracking-[0.3em] uppercase text-[var(--apex-gold)]/70 group-hover:text-[var(--apex-gold)] transition-colors">
        <span>Learn more</span>
        <span className="transform transition-transform group-hover:translate-x-2">→</span>
      </div>
    </div>
  );
}

export default function Services() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <section id="services" ref={ref} className="section relative" data-testid="services-section">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div className="max-w-2xl">
            <span className="eyebrow">What we do</span>
            <h2 className="mt-6 font-display text-[var(--apex-warm)] text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tighter">
              Digital growth <br/>
              <span className="gold-text-gradient italic font-light">systems</span> built for <br/>
              modern businesses.
            </h2>
          </div>
          <p className="max-w-md text-white/55 text-base leading-relaxed">
            From high-converting websites to AI automation, paid ads, SEO, branding and integrations — Apex Media engineers complete systems designed to attract, convert and scale.
          </p>
        </div>

        <div className="mt-20 space-y-20">
          {categories.map((cat, ci) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: ci * 0.1, duration: 0.9, ease: [0.7, 0, 0.2, 1] }}
            >
              <div className="flex items-baseline gap-6 mb-8">
                <span className="font-mono text-[10px] tracking-[0.3em] text-[var(--apex-gold)]">{cat.num}</span>
                <h3 className="font-display text-2xl md:text-3xl text-[var(--apex-warm)]">{cat.title}</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-[var(--apex-gold)]/40 to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6 auto-rows-fr">
                {cat.services.map((s, si) => (
                  <ServiceCard key={s.id} s={s} large={ci === 0 && si === 0} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Results strip */}
        <div className="mt-24 glass-strong rounded-3xl p-8 md:p-12 flex flex-wrap items-center justify-between gap-8" data-testid="results-strip">
          {["More Leads", "Better Trust", "Higher Conversions", "Smart Automation", "Premium Brand"].map((t, i) => (
            <div key={t} className="flex items-center gap-3">
              <span className="font-mono text-[10px] tracking-[0.3em] text-[var(--apex-gold)]">/{String(i+1).padStart(2,"0")}</span>
              <span className="font-display text-lg md:text-xl text-[var(--apex-warm)]">{t}</span>
            </div>
          ))}
        </div>

        {/* Section CTA */}
        <div className="mt-20 text-center">
          <h3 className="font-display text-3xl md:text-5xl text-[var(--apex-warm)]">
            Need a complete <span className="gold-text-gradient italic">growth system</span>?
          </h3>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
            <a href="#contact" data-magnetic className="magnetic-btn primary"><span className="btn-fill"/>Book Strategy Call</a>
            <button data-magnetic onClick={() => window.dispatchEvent(new CustomEvent("apex:openChat"))} className="magnetic-btn"><span className="btn-fill"/>Talk to Apex AI</button>
          </div>
        </div>
      </div>
    </section>
  );
}
