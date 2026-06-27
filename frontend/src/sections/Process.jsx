import React from "react";
import { motion } from "framer-motion";

const steps = [
  { n: "01", t: "Discovery", d: "We map your business, audience, channels and revenue model." },
  { n: "02", t: "Strategy", d: "A clear plan: positioning, funnels, automation and KPIs." },
  { n: "03", t: "Design",   d: "Premium identity and interfaces engineered to convert." },
  { n: "04", t: "Development", d: "Performant builds, integrations and analytics foundations." },
  { n: "05", t: "Marketing", d: "Paid, organic and AI-driven acquisition in motion." },
  { n: "06", t: "Optimization", d: "Continuous testing — creative, copy, funnels, automations." },
  { n: "07", t: "Scale",    d: "Compounding growth across channels and markets." },
];

export default function Process() {
  return (
    <section id="process" className="section relative" data-testid="process-section">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <span className="eyebrow">How we work</span>
          <h2 className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl text-[var(--apex-warm)] leading-[0.95] tracking-tighter">
            From signal to <br/>
            <span className="gold-text-gradient italic font-light">scale.</span>
          </h2>
        </div>

        <div className="mt-20 relative">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--apex-gold)]/30 to-transparent" />
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
              className={`relative md:grid md:grid-cols-2 md:gap-16 mb-16 md:mb-20 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}
            >
              <div className={`pl-16 md:pl-0 ${i % 2 ? "md:text-left md:pl-16" : "md:text-right md:pr-16"}`}>
                <div className="font-mono text-[10px] tracking-[0.3em] text-[var(--apex-gold)]">{s.n}</div>
                <h3 className="mt-3 font-display text-3xl md:text-4xl text-[var(--apex-warm)]">{s.t}</h3>
                <p className="mt-4 text-white/55 max-w-md leading-relaxed">{s.d}</p>
              </div>
              <div className="hidden md:block" />
              <div className="absolute left-6 md:left-1/2 top-2 -translate-x-1/2 w-4 h-4 rounded-full bg-[var(--apex-gold)] pulse-gold" style={{ boxShadow: "0 0 18px #D4AF37" }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
