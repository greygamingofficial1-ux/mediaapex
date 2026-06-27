import { useEffect } from "react";
import ApexSound from "@/lib/sound";

/**
 * SoundController — invisible component.
 * Wires global interaction → sound hooks:
 *   - pointerover on [data-magnetic] / a / button → "hover"
 *   - click on [data-magnetic] / a / button       → "click"
 *   - custom "apex:success" event                 → "success"
 *   - hashchange / popstate                       → "navigate"
 * No autoplay. Stays silent until ApexSound.enable() is called
 * (or localStorage.apex_sound === "on"). Also auto-unlocks the
 * AudioContext on the first real user gesture so future events fire cleanly.
 */
export default function SoundController() {
  useEffect(() => {
    const SELECTOR = "[data-magnetic], a, button, [role='button']";
    let lastHoverEl = null;

    const onPointerOver = (e) => {
      const t = e.target && e.target.closest && e.target.closest(SELECTOR);
      if (!t || t === lastHoverEl) return;
      lastHoverEl = t;
      ApexSound.play("hover");
    };
    const onPointerOut = (e) => {
      const t = e.target && e.target.closest && e.target.closest(SELECTOR);
      if (t && t === lastHoverEl) lastHoverEl = null;
    };
    const onClick = (e) => {
      const t = e.target && e.target.closest && e.target.closest(SELECTOR);
      if (!t) return;
      ApexSound.play("click");
    };
    const onSuccess = () => ApexSound.play("success");
    const onNavigate = () => ApexSound.play("navigate");

    // First user gesture unlocks AudioContext (no autoplay).
    const firstGesture = () => {
      ApexSound._unlock();
      window.removeEventListener("pointerdown", firstGesture);
      window.removeEventListener("keydown", firstGesture);
    };

    window.addEventListener("pointerover", onPointerOver, { passive: true });
    window.addEventListener("pointerout", onPointerOut, { passive: true });
    window.addEventListener("click", onClick, { passive: true });
    window.addEventListener("apex:success", onSuccess);
    window.addEventListener("hashchange", onNavigate);
    window.addEventListener("popstate", onNavigate);
    window.addEventListener("pointerdown", firstGesture, { once: true });
    window.addEventListener("keydown", firstGesture, { once: true });

    return () => {
      window.removeEventListener("pointerover", onPointerOver);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("click", onClick);
      window.removeEventListener("apex:success", onSuccess);
      window.removeEventListener("hashchange", onNavigate);
      window.removeEventListener("popstate", onNavigate);
    };
  }, []);

  return null;
}
