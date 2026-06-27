import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CinematicLoader — particle assembly + percent counter + dissolve transition.
 */
export default function CinematicLoader({ onComplete }) {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cur = 0;
    const id = setInterval(() => {
      // Ease out
      const step = Math.max(0.6, (100 - cur) / 18);
      cur = Math.min(100, cur + step);
      setPct(Math.round(cur));
      if (cur >= 100) {
        clearInterval(id);
        setTimeout(() => {
          setDone(true);
          setTimeout(() => onComplete && onComplete(), 800);
        }, 700);
      }
    }, 60);
    return () => clearInterval(id);
  }, [onComplete]);

  // Generate particle positions (golden ring forming the A)
  const particles = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < 90; i++) {
      const angle = (i / 90) * Math.PI * 2;
      const radius = 60 + Math.random() * 20;
      arr.push({
        id: i,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        sx: (Math.random() - 0.5) * 600,
        sy: (Math.random() - 0.5) * 600,
        d: Math.random() * 0.4,
      });
    }
    return arr;
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          data-testid="cinematic-loader"
          className="fixed inset-0 z-[100000] flex flex-col items-center justify-center"
          style={{ background: "#030303" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08, filter: "blur(8px)" }}
          transition={{ duration: 0.9, ease: [0.7, 0, 0.2, 1] }}
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08), transparent 60%)",
          }}/>

          {/* Logo particle assembly */}
          <div className="relative" style={{ width: 200, height: 200 }}>
            <svg viewBox="-100 -100 200 200" className="absolute inset-0">
              <defs>
                <radialGradient id="goldparticle">
                  <stop offset="0%" stopColor="#FCF6BA" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                </radialGradient>
              </defs>
              {particles.map((p) => (
                <motion.circle
                  key={p.id}
                  r={1.6}
                  fill="#D4AF37"
                  initial={{ cx: p.sx, cy: p.sy, opacity: 0 }}
                  animate={{ cx: p.x, cy: p.y, opacity: 1 }}
                  transition={{ duration: 1.6, delay: p.d, ease: [0.7, 0, 0.2, 1] }}
                />
              ))}
            </svg>

            {/* Apex Logo text */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.6, duration: 0.8 }}
            >
              <span className="font-display text-5xl gold-text-gradient">A</span>
            </motion.div>
          </div>

          {/* Brand line */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <div className="font-display text-2xl tracking-[0.4em] text-[var(--apex-warm)]">APEX&nbsp;MEDIA</div>
            <div className="mt-3 font-mono text-[10px] tracking-[0.4em] text-[var(--apex-gold)]">
              AI POWERED DIGITAL GROWTH
            </div>
          </motion.div>

          {/* Counter */}
          <div className="mt-12 w-[280px]" data-testid="loader-progress">
            <div className="flex items-center justify-between font-mono text-[11px] tracking-widest text-white/50">
              <span>LOADING</span>
              <span className="text-[var(--apex-gold)]">{String(pct).padStart(3, "0")}%</span>
            </div>
            <div className="mt-3 h-px bg-white/10 overflow-hidden">
              <motion.div
                className="h-full"
                style={{ background: "linear-gradient(90deg, transparent, #FCF6BA, #D4AF37)" }}
                animate={{ width: `${pct}%` }}
                transition={{ ease: "linear", duration: 0.06 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
