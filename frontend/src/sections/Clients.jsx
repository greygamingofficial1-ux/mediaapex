import React from "react";

const logos = [
  "ATLAS GROUP", "MERIDIAN", "VAULT & CO", "ORION HOTELS", "NEXSWITCH",
  "LUXE RESIDENCES", "PRISMA", "AURA CLINICS", "MAISON 26", "HABITAT",
  "STRATA", "OBSIDIAN",
];

const testimonials = [
  { q: "Apex Media doubled our qualified leads in a quarter. The AI assistant alone changed our operations.", a: "Faisal R.", r: "CMO · Real Estate" },
  { q: "The cleanest, most strategic agency we've worked with in Dubai. Every deliverable feels considered.", a: "Layla H.", r: "Founder · Hospitality" },
  { q: "Our ad spend efficiency tripled. They treat marketing like an engineering discipline.", a: "Omar K.", r: "VP Growth · D2C" },
];

export default function Clients() {
  return (
    <section className="section !py-24 relative" data-testid="clients-section">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="eyebrow mx-auto">Trusted across UAE</span>
        </div>
        <div className="mt-12 overflow-hidden">
          <div className="marquee-track gap-16 px-8">
            {[...logos, ...logos].map((l, i) => (
              <div key={i} className="shrink-0 font-display tracking-[0.2em] text-2xl md:text-3xl text-white/30 hover:text-[var(--apex-gold)] transition-colors">
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-24 grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="glass rounded-3xl p-8 spotlight" data-testid={`testimonial-${i}`}>
              <div className="text-[var(--apex-gold)] text-3xl font-display leading-none">"</div>
              <p className="mt-4 text-white/80 leading-relaxed">{t.q}</p>
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-display text-[var(--apex-warm)]">{t.a}</div>
                  <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/45">{t.r}</div>
                </div>
                <div className="text-[var(--apex-gold)]">★★★★★</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
