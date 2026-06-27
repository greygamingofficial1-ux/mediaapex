import React, { useEffect, useRef, useState } from "react";

/**
 * LuxuryCursor — multi-layer gold cursor with inertia, magnetic snap,
 * particle trail and morphing labels. Pointer-only.
 */
export default function LuxuryCursor() {
  const coreRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);
  const trailRefs = useRef([]);
  const [supports, setSupports] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setSupports(mq.matches);
    if (!mq.matches) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let cx = mx, cy = my;     // core
    let rx = mx, ry = my;     // ring
    const trailPositions = Array.from({ length: 8 }, () => ({ x: mx, y: my }));
    let magnet = null;

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      // detect magnetic target
      const el = document.elementFromPoint(mx, my);
      const target = el && el.closest && el.closest("[data-magnetic]");
      magnet = target;
      // Cursor mode classes
      const hover = el && el.closest && el.closest('a, button, [data-magnetic], input, textarea, [role="button"]');
      const view = el && el.closest && el.closest("[data-cursor='view']");
      const ring = ringRef.current;
      if (!ring) return;
      ring.classList.toggle("hover", !!hover);
      ring.classList.toggle("view", !!view);
      if (labelRef.current) {
        labelRef.current.textContent = view ? (view.getAttribute("data-cursor-label") || "VIEW") : "";
      }
    };

    const onClick = () => {
      // Ripple
      const r = document.createElement("div");
      r.style.cssText = `position:fixed;left:${mx}px;top:${my}px;width:10px;height:10px;border-radius:50%;border:1px solid rgba(212,175,55,0.8);transform:translate(-50%,-50%);pointer-events:none;z-index:99997;`;
      document.body.appendChild(r);
      const start = performance.now();
      const animate = (t) => {
        const p = Math.min(1, (t - start) / 600);
        r.style.width = `${10 + p * 80}px`;
        r.style.height = `${10 + p * 80}px`;
        r.style.opacity = `${1 - p}`;
        if (p < 1) requestAnimationFrame(animate); else r.remove();
      };
      requestAnimationFrame(animate);
    };

    let raf;
    const loop = () => {
      // Magnetic pull
      let tx = mx, ty = my;
      if (magnet) {
        const rect = magnet.getBoundingClientRect();
        const bx = rect.left + rect.width / 2;
        const by = rect.top + rect.height / 2;
        tx = bx + (mx - bx) * 0.25;
        ty = by + (my - by) * 0.25;
      }
      // Core fast
      cx += (tx - cx) * 0.45;
      cy += (ty - cy) * 0.45;
      // Ring lag
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      if (coreRef.current) coreRef.current.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      if (ringRef.current) ringRef.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;

      // Trail
      for (let i = trailPositions.length - 1; i > 0; i--) {
        trailPositions[i].x = trailPositions[i - 1].x;
        trailPositions[i].y = trailPositions[i - 1].y;
      }
      trailPositions[0].x = cx; trailPositions[0].y = cy;
      trailRefs.current.forEach((node, i) => {
        if (!node) return;
        const op = (1 - i / trailPositions.length) * 0.6;
        const s = 1 - i / trailPositions.length;
        node.style.transform = `translate(${trailPositions[i].x}px, ${trailPositions[i].y}px) translate(-50%,-50%) scale(${s})`;
        node.style.opacity = op.toFixed(2);
      });

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
    };
  }, []);

  if (!supports) return null;

  return (
    <>
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
