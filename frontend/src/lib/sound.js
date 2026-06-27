// Apex Sound — tiny Web Audio synth manager.
// Zero asset files. Zero autoplay. Opt-in via window.ApexSound.enable()
// or localStorage.apex_sound === 'on'. Designed as a "ready" interaction
// layer that can be wired to UI later without touching components.

const TYPES = ["hover", "click", "success", "navigate"];

let ctx = null;
let enabled =
  typeof window !== "undefined" &&
  window.localStorage &&
  window.localStorage.getItem("apex_sound") === "on";
let unlocked = false;
let lastPlayAt = 0;
const MIN_GAP_MS = 25; // throttle rapid hover bursts

function ensureCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

function unlock() {
  if (unlocked) return;
  const c = ensureCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  unlocked = true;
}

function envelope(node, peak, attack, hold, release) {
  const t = ctx.currentTime;
  node.gain.cancelScheduledValues(t);
  node.gain.setValueAtTime(0, t);
  node.gain.linearRampToValueAtTime(peak, t + attack);
  node.gain.setValueAtTime(peak, t + attack + hold);
  node.gain.linearRampToValueAtTime(0, t + attack + hold + release);
}

function tone({ freq, type = "sine", peak = 0.05, attack = 0.005, hold = 0.02, release = 0.08, glideTo = null }) {
  const c = ensureCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (glideTo) osc.frequency.linearRampToValueAtTime(glideTo, c.currentTime + attack + hold);
  osc.connect(gain).connect(c.destination);
  envelope(gain, peak, attack, hold, release);
  osc.start();
  osc.stop(c.currentTime + attack + hold + release + 0.02);
}

function chord(freqs, opts = {}) {
  freqs.forEach((f, i) => setTimeout(() => tone({ freq: f, ...opts }), i * 80));
}

const players = {
  hover: () => tone({ freq: 880, type: "sine", peak: 0.025, attack: 0.003, hold: 0.012, release: 0.06 }),
  click: () => tone({ freq: 660, type: "sine", peak: 0.06, attack: 0.002, hold: 0.02, release: 0.09, glideTo: 520 }),
  success: () => chord([523, 659, 784], { type: "sine", peak: 0.05, attack: 0.005, hold: 0.05, release: 0.18 }),
  navigate: () => tone({ freq: 440, type: "triangle", peak: 0.04, attack: 0.003, hold: 0.03, release: 0.12 }),
};

function play(type) {
  if (!enabled || !unlocked) return;
  if (!players[type]) return;
  const now = performance.now();
  if (type === "hover" && now - lastPlayAt < MIN_GAP_MS) return;
  lastPlayAt = now;
  try { players[type](); } catch (_) { /* ignore */ }
}

const ApexSound = {
  enable() {
    enabled = true;
    try { window.localStorage.setItem("apex_sound", "on"); } catch (_e) { /* storage unavailable */ }
    unlock();
    return enabled;
  },
  disable() {
    enabled = false;
    try { window.localStorage.setItem("apex_sound", "off"); } catch (_e) { /* storage unavailable */ }
    return enabled;
  },
  toggle() { return enabled ? this.disable() : this.enable(); },
  isEnabled() { return enabled; },
  play,
  types: TYPES,
  _unlock: unlock,
};

if (typeof window !== "undefined") {
  window.ApexSound = ApexSound;
}

export default ApexSound;
