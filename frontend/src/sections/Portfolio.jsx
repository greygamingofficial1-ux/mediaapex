import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

const projects = [
  {
    id: "luxury-business-hub",
    name: "Luxury Business Hub",
    industry: "Corporate Services",
    tag: "Branding · Web · CRM",
    img: "https://images.unsplash.com/photo-1723822603065-f799bbe7c3f7?auto=format&fit=crop&w=1400&q=80",
    metrics: [["+340%", "Inbound Leads"], ["+185%", "Conversion"], ["8wk", "Build Time"]],
    challenge: "A premium UAE business hub needed an identity that matched its physical presence.",
    strategy: "Cinematic brand system, conversion-focused site and CRM-integrated lead capture.",
    execution: "Full identity, custom development, automated nurture and Apex AI concierge.",
    result: "3.4x more qualified inquiries within the first quarter post-launch.",
    color: "#D4AF37",
  },
  {
    id: "nexswitch",
    name: "NEXSWITCH Corporate",
    industry: "B2B Services",
    tag: "Web · SEO · Google Ads",
    img: "https://images.pexels.com/photos/12564248/pexels-photo-12564248.jpeg?auto=compress&cs=tinysrgb&w=1400",
    metrics: [["+212%", "Organic Traffic"], ["4.6x", "ROAS"], ["#1", "Dubai SEO"]],
    challenge: "Low brand visibility in a saturated B2B Dubai market.",
    strategy: "Technical SEO foundation + premium content + ABM-style Google Ads.",
    execution: "Re-architected site, schema, programmatic SEO and lead-gen funnels.",
    result: "Ranked top-3 for 28 commercial keywords in 6 months.",
  },
  {
    id: "apex-real-estate",
    name: "Apex Real Estate",
    industry: "Real Estate",
    tag: "Landing Pages · Meta · CRM",
    img: "https://images.unsplash.com/photo-1603350902363-3141f62b7dba?auto=format&fit=crop&w=1400&q=80",
    metrics: [["+520%", "Lead Volume"], ["AED 38", "Cost / Lead"], ["27%", "Close Rate"]],
    challenge: "Real estate team flooded with low-intent leads.",
    strategy: "Pre-qualifying funnels, AI lead scoring and CRM hand-off automation.",
    execution: "Project-specific landing pages, Meta + Google funnels, WhatsApp follow-ups.",
    result: "Sales team closing 27% of routed leads — industry avg is 5%.",
  },
  {
    id: "luxe-hotel-dubai",
    name: "Luxe Hotel Dubai",
    industry: "Hospitality",
    tag: "Brand · Web · Video",
    img: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1400&q=80",
    metrics: [["+98%", "Direct Bookings"], ["62%", "OTA Reduction"], ["4.9★", "Guest Rating"]],
    challenge: "Heavy reliance on third-party OTAs reducing margins.",
    strategy: "Direct-booking-first website with cinematic storytelling and concierge AI.",
    execution: "Custom site, hero films, multilingual AI concierge and loyalty mechanics.",
    result: "Direct bookings nearly doubled, OTA dependency cut by 62%.",
  },
  {
    id: "elite-medical",
    name: "Elite Medical Clinic",
    industry: "Healthcare",
    tag: "Branding · SEO · Booking",
    img: "https://images.unsplash.com/photo-1695799037547-64b0e03212bf?auto=format&fit=crop&w=1400&q=80",
    metrics: [["+260%", "Appointments"], ["3.1x", "Repeat Visits"], ["12s", "Avg Response"]],
    challenge: "Manual booking and slow patient response times.",
    strategy: "Automated booking flow, AI triage and Google Maps SEO.",
    execution: "Glass-style site, online scheduling, AI receptionist on WhatsApp.",
    result: "Appointments up 260% with average reply time under 12 seconds.",
  },
  {
    id: "prestige-restaurant",
    name: "Prestige Restaurant",
    industry: "F&B",
    tag: "Social · Reels · Ads",
    img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80",
    metrics: [["+410%", "Reservations"], ["1.2M", "Reels Reach"], ["72%", "Saves"]],
    challenge: "Empty weekday covers despite premium positioning.",
    strategy: "Reels-led brand identity, geo-targeted Meta ads and review automation.",
    execution: "Content engine, Maps optimisation, AI WhatsApp reservation flow.",
    result: "Fully booked weekdays within 90 days.",
  },
  {
    id: "premium-ecommerce",
    name: "Premium E-commerce",
    industry: "D2C",
    tag: "Web · Ads · CRO",
    img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80",
    metrics: [["+285%", "Revenue"], ["+62%", "AOV"], ["6.8x", "Blended ROAS"]],
    challenge: "Strong product, weak conversion and ad efficiency.",
    strategy: "CRO sprints, premium PDPs and creative testing system.",
    execution: "Rebuilt storefront, 40+ ad creatives/wk, automated post-purchase.",
    result: "Revenue 2.85x in 5 months with 62% higher order value.",
  },
  {
    id: "fashion-luxury",
    name: "Fashion Luxury Brand",
    industry: "Fashion",
    tag: "Brand · Content · Influencer",
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80",
    metrics: [["+730%", "Brand Reach"], ["180+", "Creators"], ["+95%", "Site Traffic"]],
    challenge: "Building cultural relevance for a new UAE label.",
    strategy: "Editorial-grade content, creator network and PR-style launches.",
    execution: "Brand films, lookbooks, influencer activations and editorial site.",
    result: "Recognised in regional press, 730% reach growth in launch quarter.",
  },
];

function buildImageSet(url) {
  // Returns optimized URLs for AVIF/WebP/JPEG + srcset across breakpoints.
  // Works for Unsplash (?auto=format) and Pexels (?auto=compress) — others fall back to original.
  const isUnsplash = url.includes("images.unsplash.com");
  const isPexels = url.includes("images.pexels.com");
  const widths = [480, 768, 1024, 1400];
  const fmt = (w, format) => {
    if (isUnsplash) return url.replace(/([?&])w=\d+/, "").replace("auto=format", `fm=${format}&w=${w}&q=70&auto=format`);
    if (isPexels) return url.replace(/w=\d+/, `w=${w}`) + `&fm=${format}`;
    return url;
  };
  const srcsetFor = (format) => widths.map(w => `${fmt(w, format)} ${w}w`).join(", ");
  return {
    avif: srcsetFor("avif"),
    webp: srcsetFor("webp"),
    fallback: isUnsplash || isPexels ? fmt(1024, "jpg") : url,
    sizes: "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 700px",
  };
}

function ProjectCard({ p, idx, onOpen, span }) {
  const img = React.useMemo(() => buildImageSet(p.img), [p.img]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay: idx * 0.05, ease: [0.7, 0, 0.2, 1] }}
      className={`group relative overflow-hidden rounded-3xl glass cursor-none ${span}`}
      data-cursor="view"
      data-cursor-label={`VIEW · ${String(idx + 1).padStart(2, "0")}`}
      data-testid={`project-card-${p.id}`}
      onClick={() => onOpen(p)}
    >
      <div className="absolute inset-0">
        <picture>
          <source type="image/avif" srcSet={img.avif} sizes={img.sizes} />
          <source type="image/webp" srcSet={img.webp} sizes={img.sizes} />
          <img
            src={img.fallback}
            alt={`${p.name} — ${p.industry} case study by Apex Media`}
            loading={idx === 0 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={idx === 0 ? "high" : "auto"}
            width="1400" height="900"
            className="w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
          />
        </picture>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(3,3,3,0.1) 0%, rgba(3,3,3,0.85) 100%)" }} />
      </div>
      <div className="relative h-full min-h-[320px] md:min-h-[420px] p-7 md:p-9 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.3em] text-[var(--apex-gold)]">/{String(idx + 1).padStart(2, "0")}</span>
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/55">{p.industry}</span>
        </div>
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--apex-gold)]/80 mb-3">{p.tag}</div>
          <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-[var(--apex-warm)] leading-[0.95] tracking-tight">{p.name}</h3>
          <div className="mt-5 flex items-center gap-4 text-[10px] font-mono tracking-[0.3em] text-white/70">
            {p.metrics.slice(0, 2).map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-2">
                <span className="gold-text-gradient font-display text-xl">{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CaseStudyModal({ p, onClose }) {
  const [slider, setSlider] = useState(50);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10"
      style={{ background: "rgba(3,3,3,0.92)", backdropFilter: "blur(20px)" }}
      onClick={onClose}
      data-testid="case-study-modal"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.96, y: 30 }} animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1] }}
        className="glass-strong rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="relative h-72 md:h-96 overflow-hidden rounded-t-3xl">
          <picture>
            <source type="image/avif" srcSet={p.img.replace("auto=format", "fm=avif&q=72&auto=format")} />
            <source type="image/webp" srcSet={p.img.replace("auto=format", "fm=webp&q=72&auto=format")} />
            <img src={p.img} alt={`${p.name} hero — ${p.industry} case study`} width="1400" height="900" decoding="async" loading="lazy" className="w-full h-full object-cover" />
          </picture>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 30%, rgba(3,3,3,0.95) 100%)" }} />
          <button onClick={onClose} data-magnetic data-testid="modal-close" className="absolute top-5 right-5 w-10 h-10 rounded-full glass flex items-center justify-center text-white">×</button>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="font-mono text-[10px] tracking-[0.3em] text-[var(--apex-gold)] uppercase">{p.industry} · {p.tag}</div>
            <h3 className="mt-3 font-display text-4xl md:text-6xl text-[var(--apex-warm)] tracking-tight">{p.name}</h3>
          </div>
        </div>

        <div className="p-7 md:p-10">
          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {p.metrics.map(([k, v]) => (
              <div key={k} className="glass rounded-2xl p-5 text-center">
                <div className="font-display text-3xl md:text-4xl gold-text-gradient">{k}</div>
                <div className="mt-2 font-mono text-[10px] tracking-[0.3em] uppercase text-white/55">{v}</div>
              </div>
            ))}
          </div>

          {/* Case body */}
          <div className="grid md:grid-cols-2 gap-8">
            {[["Challenge", p.challenge], ["Strategy", p.strategy], ["Execution", p.execution], ["Result", p.result]].map(([t, v]) => (
              <div key={t}>
                <div className="font-mono text-[10px] tracking-[0.3em] text-[var(--apex-gold)] uppercase">{t}</div>
                <p className="mt-3 text-white/75 leading-relaxed">{v}</p>
              </div>
            ))}
          </div>

          {/* Before/After */}
          <div className="mt-10">
            <div className="font-mono text-[10px] tracking-[0.3em] text-[var(--apex-gold)] uppercase mb-3">Before · After</div>
            <div className="relative h-64 rounded-2xl overflow-hidden glass">
              <div className="absolute inset-0 flex items-center justify-center font-display text-3xl text-white/40">BEFORE</div>
              <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${slider}%)` }}>
                <img src={p.img} alt="after" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center font-display text-3xl gold-text-gradient">AFTER</div>
              </div>
              <input type="range" min="0" max="100" value={slider} onChange={(e) => setSlider(e.target.value)} className="absolute inset-x-0 bottom-3 mx-6 accent-[#D4AF37]" data-testid="before-after-slider"/>
              <div className="absolute top-0 bottom-0 w-px bg-[var(--apex-gold)]" style={{ left: `${slider}%` }} />
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#contact" onClick={onClose} data-magnetic className="magnetic-btn primary"><span className="btn-fill"/>Start a similar project</a>
            <a href="https://wa.me/971586169311" target="_blank" rel="noreferrer" data-magnetic className="magnetic-btn"><span className="btn-fill"/>WhatsApp the team</a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Portfolio() {
  const [active, setActive] = useState(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  // Asymmetric bento grid spans
  const spans = [
    "md:col-span-2 md:row-span-2",
    "md:col-span-2",
    "md:col-span-2",
    "md:col-span-2 md:row-span-2",
    "md:col-span-2",
    "md:col-span-2",
    "md:col-span-2",
    "md:col-span-2",
  ];

  return (
    <section id="portfolio" ref={ref} className="section relative" data-testid="portfolio-section">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <span className="eyebrow">Selected work</span>
            <h2 className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl text-[var(--apex-warm)] leading-[0.95] tracking-tighter">
              Crafted experiences. <br/>
              <span className="gold-text-gradient italic font-light">Real business results.</span>
            </h2>
          </div>
          <p className="max-w-md text-white/55 leading-relaxed">
            A selection of digital products, brand systems and growth engines we've built for ambitious operators across the UAE.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 auto-rows-[280px] md:auto-rows-[260px] gap-5 md:gap-6">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} p={p} idx={i} span={spans[i] || "md:col-span-2"} onOpen={setActive} />
          ))}
        </div>

        <div className="mt-20 text-center">
          <h3 className="font-display text-3xl md:text-5xl text-[var(--apex-warm)]">
            Ready to build something <span className="gold-text-gradient italic">extraordinary</span>?
          </h3>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
            <a href="#contact" data-magnetic className="magnetic-btn primary"><span className="btn-fill"/>Book Strategy Session</a>
            <button data-magnetic onClick={() => window.dispatchEvent(new CustomEvent("apex:openChat"))} className="magnetic-btn"><span className="btn-fill"/>Talk to Apex AI</button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {active && <CaseStudyModal p={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
}
