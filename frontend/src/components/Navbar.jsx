import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const links = [
  { label: "Services", id: "services" },
  { label: "Work", id: "portfolio" },
  { label: "Process", id: "process" },
  { label: "Contact", id: "contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.8, ease: [0.7, 0, 0.2, 1] }}
      className={`fixed top-0 inset-x-0 z-[1000] transition-all duration-500 ${scrolled ? "py-4" : "py-7"}`}
      data-testid="navbar"
    >
      <div className={`mx-auto max-w-7xl px-6 md:px-10 flex items-center justify-between ${scrolled ? "glass-strong rounded-full" : ""}`} style={{ transition: "all .5s" }}>
        <a href="#top" className="flex items-center gap-3" data-magnetic data-testid="navbar-logo">
          <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ background: "linear-gradient(135deg, #D4AF37, #B38728)" }}>
            <span className="font-display text-lg text-[#0a0a0a]">A</span>
          </span>
          <div className="leading-none">
            <div className="font-display text-base tracking-[0.3em] text-[var(--apex-warm)]">APEX</div>
            <div className="font-mono text-[9px] tracking-[0.3em] text-[var(--apex-gold)]">MEDIA</div>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-10">
          {links.map((l, i) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              data-magnetic
              data-testid={`nav-link-${l.id}`}
              className="font-mono text-[11px] tracking-[0.3em] uppercase text-white/70 hover:text-[var(--apex-gold)] transition-colors"
            >
              <span className="text-[var(--apex-gold)]/60 mr-2">0{i + 1}</span>{l.label}
            </a>
          ))}
        </nav>

        <a href="#contact" data-magnetic data-testid="navbar-cta" className="magnetic-btn primary text-[10px] !px-6 !py-3">
          <span className="btn-fill" />
          Book Consultation
        </a>
      </div>
    </motion.header>
  );
}
