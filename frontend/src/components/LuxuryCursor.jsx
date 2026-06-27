import React, { useEffect, useRef, useState } from "react";

/**
 * LuxuryCursor — four-layer gold cursor:
 *   1. Core   — sharp gold dot (fastest, 0.45 lerp)
 *   2. Ring   — outline that grows on hover (0.16 lerp)
 *   3. Glow   — large soft halo that lags furthest (0.09 lerp)
 *   4. Trail  — 6-particle gold trail derived from the core path
 * Also drives magnetic-button physical translation toward the cursor.
 */
export default function LuxuryCursor() {
  const coreRef = useRef(null);
  const ringRef = useRef(null);
  const glowRef = useRef(null);
  const labelRef = useRef(null);
  const trailRefs = useRef([]);
  const [supports, setSupports] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setSupports(mq.matches);
    if (!mq.matches) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let cx = mx, cy = my;       // core
    let rx = mx, ry = my;       // ring
    let gx = mx, gy = my;       // glow
    const trailPositions = Array.from({ length: 8 }, () => ({ x: mx, y: my }));
    let magnet = null;
    let prevMagnet = null;

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      const el = document.elementFromPoint(mx, my);
      const target = el && el.closest && el.closest("[data-magnetic]");
      if (target !== magnet) {
        // Reset previous magnet transform smoothly
        if (magnet) {
          magnet.style.transition = "transform 0.55s cubic-bezier(.2,.8,.2,1)";
          magnet.style.transform = "";
        }
        if (target) {
          target.style.transition = "transform 0.18s cubic-bezier(.2,.8,.2,1)";
        }
        magnet = target;
      }
      const hover = el && el.closest && el.closest('a, button, [data-magnetic], input, textarea, [role="button"]');
      const view = el && el.closest && el.closest("[data-cursor='view']");
      const ring = ringRef.current;
      const glow = glowRef.current;
      if (ring) {
        ring.classList.toggle("hover", !!hover);
        ring.classList.toggle("view", !!view);
      }
      if (glow) glow.classList.toggle("hover", !!hover);
      if (labelRef.current) {
        labelRef.current.textContent = view ? (view.getAttribute("data-cursor-label") || "VIEW") : "";
      }
    };

    const onClick = () => {
      const r = document.createElement("div");
      r.style.cssText = `position:fixed;left:${mx}px;top:${my}px;width:10px;height:10px;border-radius:50%;border:1px solid rgba(212,175,55,0.85);transform:translate(-50%,-50%);pointer-events:none;z-index:99997;`;
      document.body.appendChild(r);
      const start = performance.now();
      const animate = (t) => {
        const p = Math.min(1, (t - start) / 600);
        r.style.width = `${10 + p * 90}px`;
        r.style.height = `${10 + p * 90}px`;
        r.style.opacity = `${1 - p}`;
        if (p < 1) requestAnimationFrame(animate); else r.remove();
      };
      requestAnimationFrame(animate);
    };

    let raf;
    const loop = () => {
      // Magnetic pull on cursor + physical button translation
      let tx = mx, ty = my;
      if (magnet) {
        const rect = magnet.getBoundingClientRect();
        const bx = rect.left + rect.width / 2;
        const by = rect.top + rect.height / 2;
        // Cursor leans toward button center
        tx = bx + (mx - bx) * 0.35;
        ty = by + (my - by) * 0.35;
        // Button leans toward cursor — capped to avoid layout breakage
        const dx = Math.max(-14, Math.min(14, (mx - bx) * 0.22));
        const dy = Math.max(-14, Math.min(14, (my - by) * 0.22));
        magnet.style.transform = `translate(${dx}px, ${dy}px)`;
      }

      // Core — fastest
      cx += (tx - cx) * 0.45;
      cy += (ty - cy) * 0.45;
      // Ring — medium lag
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      // Glow — slowest, biggest layer
      gx += (mx - gx) * 0.09;
      gy += (my - gy) * 0.09;

      if (coreRef.current) coreRef.current.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      if (ringRef.current) ringRef.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      if (glowRef.current) glowRef.current.style.transform = `translate(${gx}px, ${gy}px) translate(-50%,-50%)`;

      // Particle trail
      for (let i = trailPositions.length - 1; i > 0; i--) {
        trailPositions[i].x = trailPositions[i - 1].x;
        trailPositions[i].y = trailPositions[i - 1].y;
      }
      trailPositions[0].x = cx; trailPositions[0].y = cy;
      trailRefs.current.forEach((node, i) => {
        if (!node) return;
        const op = (1 - i / trailPositions.length) * 0.55;
        const s = 1 - i / trailPositions.length;
        node.style.transform = `translate(${trailPositions[i].x}px, ${trailPositions[i].y}px) translate(-50%,-50%) scale(${s})`;
        node.style.opacity = op.toFixed(2);
      });

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      if (magnet) magnet.style.transform = "";
      if (prevMagnet) prevMagnet.style.transform = "";
    };
  }, []);

  if (!supports) return null;

  return (
    <>
      <div ref={glowRef} className="apex-cursor apex-cursor-glow" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => (trailRefs.current[i] = el)}
          className="cursor-trail apex-cursor"
        />
      ))}
      <div ref={ringRef} className="apex-cursor apex-cursor-ring">
        <span ref={labelRef} className="apex-cursor-label" />
      </div>
      <div ref={coreRef} className="apex-cursor apex-cursor-core" />
    </>
  );
}
