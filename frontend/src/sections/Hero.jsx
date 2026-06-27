import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroScene from "@/components/HeroScene";

gsap.registerPlugin(ScrollTrigger);

const headingLines = [["AI","Powered"],["Digital","Growth"],["Partner."]];

export default function Hero() {
  const root = useRef(null);
  const sceneRef = useRef(null);
  const headlineRef = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const statsRef = useRef(null);
  const cardsRef = useRef(null);
  const progRef = useRef({ v: 0 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=120%",
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: (st) => {
            progRef.current.v = st.progress;
            window.__heroProgress = st.progress;
          },
        },
      });

      tl.to(headlineRef.current, { y: -80, scale: 1.02, filter: "blur(10px)", opacity: 0, ease: "power2.in" }, 0)
        .to(subRef.current,     { y: -60, opacity: 0, ease: "power2.in" }, 0.05)
        .to(ctaRef.current,     { y: -40, opacity: 0, ease: "power2.in" }, 0.05)
        .to(statsRef.current,   { y: -30, opacity: 0, ease: "power2.in" }, 0.08)
        .to(cardsRef.current?.querySelectorAll(".float-card") || [], {
          y: -120, opacity: 0, filter: "blur(8px)",
          stagger: 0.04, ease: "power2.in",
        }, 0);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="top" ref={root} className="relative min-h-[100svh] w-full overflow-hidden" data-testid="hero">
      <div ref={sceneRef} className="absolute inset-0">
        <HeroScene progressRef={progRef} />
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(3,3,3,0.9) 100%)",
      }} />

      <div ref={cardsRef}><FloatingCards /></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10 pt-40 pb-24 min-h-[100svh] flex flex-col justify-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="eyebrow">
          Apex Media — Dubai, UAE
        </motion.div>

        <h1 ref={headlineRef} className="mt-8 font-display tracking-tighter leading-[0.95] text-[14vw] md:text-[10vw] lg:text-[8.4rem] xl:text-[9.5rem]" data-testid="hero-headline">
          {headingLines.map((line, li) => (
            <div key={li} className="overflow-hidden">
              <motion.div
                initial={{ y: "110%" }} animate={{ y: 0 }}
                transition={{ delay: 0.4 + li * 0.18, duration: 1.1, ease: [0.7, 0, 0.2, 1] }}
                className="flex flex-wrap gap-x-[0.25em]"
              >
                {line.map((w, wi) => (
                  <span key={wi} className={wi === 1 || (li === 2) ? "gold-text-gradient italic font-light" : "text-[var(--apex-warm)]"}>{w}</span>
                ))}
              </motion.div>
            </div>
          ))}
        </h1>

        <motion.p ref={subRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4, duration: 0.9 }} className="mt-10 max-w-xl text-base md:text-lg text-white/65 leading-relaxed">
          We design, build and scale premium digital experiences for ambitious businesses across the UAE — combining award-winning craft with AI automation that compounds growth.
        </motion.p>

        <motion.div ref={ctaRef} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.7, duration: 0.8 }} className="mt-12 flex flex-wrap items-center gap-5">
          <a href="#contact" data-magnetic data-testid="hero-cta-primary" className="magnetic-btn primary"><span className="btn-fill" />Book Free Consultation <span aria-hidden>→</span></a>
          <a href="#portfolio" data-magnetic data-testid="hero-cta-secondary" className="magnetic-btn"><span className="btn-fill" />Explore Our Work</a>
        </motion.div>

        <motion.div ref={statsRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 max-w-3xl">
          {[["120+","Brands scaled"],["19","Growth services"],["350%","Avg lead lift"],["24/7","AI uptime"]].map(([k, v]) => (
            <div key={k} className="border-l border-[var(--apex-gold)]/30 pl-4">
              <div className="font-display text-3xl md:text-4xl gold-text-gradient">{k}</div>
              <div className="mt-1 font-mono text-[10px] tracking-[0.25em] uppercase text-white/50">{v}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <ScrollIndicator />
    </section>
  );
}

function FloatingCards() {
  const cards = [
    { title: "SEO Dashboard", val: "+182%", sub: "Organic Traffic", pos: "top-[18%] left-[6%]", delay: 1.8 },
    { title: "Google Ads",     val: "4.2x",  sub: "ROAS",           pos: "top-[24%] right-[8%]", delay: 2.0 },
    { title: "Apex AI",        val: "Online",sub: "247 chats today",pos: "bottom-[20%] left-[8%]", delay: 2.2 },
    { title: "Meta Campaign",  val: "AED 2.10",sub:"Cost / Lead",   pos: "bottom-[28%] right-[6%]", delay: 2.4 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none hidden lg:block">
      {cards.map((c, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: c.delay, duration: 0.9 }} className={`absolute ${c.pos} floating float-card`} style={{ animationDelay: `${i * 0.6}s` }}>
          <div className="glass rounded-2xl px-5 py-4 min-w-[180px]">
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/50">{c.title}</div>
            <div className="mt-2 font-display text-2xl gold-text-gradient">{c.val}</div>
            <div className="font-mono text-[10px] text-white/45 mt-1">{c.sub}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ScrollIndicator() {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2" data-testid="scroll-indicator">
      <span className="font-mono text-[9px] tracking-[0.4em] text-white/45">SCROLL</span>
      <div className="relative h-14 w-px bg-white/15 overflow-hidden">
        <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--apex-gold)]" style={{ boxShadow: "0 0 12px #D4AF37" }} animate={{ y: [0, 50, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
      </div>
    </div>
  );
}
