import React from "react";

export default function Footer() {
  const backToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  return (
    <footer className="relative pt-24 pb-10 px-6 md:px-10 overflow-hidden" data-testid="footer">
      <div className="gold-line w-full" />
      <div className="mx-auto max-w-7xl">
        {/* Massive brand */}
        <div className="mt-12 select-none pointer-events-none">
          <h2 className="font-display text-[18vw] md:text-[14vw] leading-none tracking-tighter gold-text-gradient italic font-light">
            Apex Media.
          </h2>
        </div>

        <div className="mt-12 grid md:grid-cols-4 gap-10">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-[var(--apex-gold)] uppercase mb-4">Contact</div>
            <a href="tel:+971586169311" className="block text-white/70 hover:text-[var(--apex-gold)] transition-colors" data-magnetic data-testid="footer-phone">+971 58 616 9311</a>
            <a href="mailto:mediaapex15@gmail.com" className="block text-white/70 hover:text-[var(--apex-gold)] transition-colors break-all" data-magnetic data-testid="footer-email">mediaapex15@gmail.com</a>
            <div className="text-white/50 text-sm mt-2">Dubai, UAE</div>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-[var(--apex-gold)] uppercase mb-4">Sitemap</div>
            <ul className="space-y-2">
              {[["Services","#services"],["Work","#portfolio"],["Process","#process"],["Contact","#contact"]].map(([l, h]) => (
                <li key={l}><a href={h} className="text-white/70 hover:text-[var(--apex-gold)] transition-colors" data-magnetic>{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-[var(--apex-gold)] uppercase mb-4">Services</div>
            <ul className="space-y-2 text-white/70">
              <li>Website & Landing Pages</li>
              <li>SEO · Google · Meta Ads</li>
              <li>AI Chat & Automation</li>
              <li>Branding & Video</li>
            </ul>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-[var(--apex-gold)] uppercase mb-4">Social</div>
            <ul className="space-y-2">
              <li><a href="https://wa.me/971586169311" target="_blank" rel="noreferrer" className="text-white/70 hover:text-[var(--apex-gold)] transition-colors" data-magnetic>WhatsApp</a></li>
              <li><a href="#" className="text-white/70 hover:text-[var(--apex-gold)] transition-colors" data-magnetic>Instagram</a></li>
              <li><a href="#" className="text-white/70 hover:text-[var(--apex-gold)] transition-colors" data-magnetic>LinkedIn</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-6">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">© {new Date().getFullYear()} Apex Media · All rights reserved</div>
          <button onClick={backToTop} data-magnetic data-testid="back-to-top" className="group flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/60 group-hover:text-[var(--apex-gold)] transition-colors">Back to top</span>
            <span className="w-10 h-10 rounded-full bg-[var(--apex-gold)] text-[#0a0a0a] flex items-center justify-center pulse-gold">↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
