import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const QUICK_REPLIES = [
  "Build a Website", "Generate More Leads", "Improve SEO",
  "Run Google Ads", "Run Meta Ads", "Add AI Chatbot",
  "Automate My Business", "Talk to Human",
];

const WELCOME = `Hi, welcome to Apex Media 👋\nI can help you with websites, SEO, paid ads, AI automation, branding, videos and complete digital growth.\n\nWhat are you looking to improve today?`;

export default function ApexChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: WELCOME }]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fn = () => setOpen(true);
    window.addEventListener("apex:openChat", fn);
    return () => window.removeEventListener("apex:openChat", fn);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (text) => {
    const msg = (text || input || "").trim();
    if (!msg || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }, { role: "assistant", content: "" }]);
    setStreaming(true);
    try {
      const res = await fetch(`${API}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: msg }),
      });
      const newSession = res.headers.get("X-Session-Id");
      if (newSession && !sessionId) setSessionId(newSession);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: buf };
          return copy;
        });
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "Apex AI is briefly unavailable. Please reach us on WhatsApp +971586169311 or email mediaapex15@gmail.com.",
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      {/* Launcher */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        data-magnetic data-testid="chat-launcher"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
        className="fixed bottom-6 right-6 z-[1500] w-16 h-16 rounded-full pulse-gold flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #D4AF37, #B38728)" }}
        aria-label="Open Apex AI"
      >
        <svg className="w-7 h-7 text-[#0a0a0a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M21 12a8 8 0 11-3-6.2L21 4l-1.2 3.2A8 8 0 0121 12z"/>
          <circle cx="8" cy="12" r="1" fill="currentColor"/>
          <circle cx="12" cy="12" r="1" fill="currentColor"/>
          <circle cx="16" cy="12" r="1" fill="currentColor"/>
        </svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.7, 0, 0.2, 1] }}
            className="fixed bottom-24 right-4 md:right-6 z-[1499] w-[min(92vw,420px)] h-[min(80vh,640px)] glass-strong rounded-3xl flex flex-col overflow-hidden"
            data-testid="chat-panel"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #D4AF37, #B38728)" }}>
                  <span className="font-display text-[#0a0a0a]">A</span>
                </div>
                <div>
                  <div className="font-display text-[var(--apex-warm)] leading-none">Apex AI</div>
                  <div className="text-[10px] font-mono tracking-[0.25em] text-[var(--apex-gold)] mt-1">ONLINE · AI CONSULTANT</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} data-magnetic data-testid="chat-close" className="text-white/60 hover:text-white">×</button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-3" data-testid="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-[var(--apex-gold)] text-[#0a0a0a]"
                        : "glass text-white/90"
                    }`}
                  >
                    {m.content || (streaming && i === messages.length - 1 ? <TypingDots /> : "")}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick replies */}
            {messages.length <= 1 && (
              <div className="px-4 pb-3 flex flex-wrap gap-2">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    data-magnetic data-testid={`chat-quick-${q.replace(/\s+/g, '-').toLowerCase()}`}
                    className="text-[11px] font-mono tracking-wide px-3 py-2 rounded-full glass hover:border-[var(--apex-gold)]/50 transition-colors text-white/80"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="px-4 py-4 border-t border-white/10 flex gap-2 items-center"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Apex AI anything…"
                data-testid="chat-input"
                className="flex-1 bg-transparent outline-none text-sm text-[var(--apex-warm)] placeholder:text-white/35 px-2"
              />
              <button
                type="submit"
                disabled={streaming || !input.trim()}
                data-magnetic data-testid="chat-send"
                className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #D4AF37, #B38728)" }}
              >
                <svg className="w-4 h-4 text-[#0a0a0a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
              </button>
            </form>

            {/* Quick contact bar */}
            <div className="px-4 pb-4 flex gap-2">
              <a href="https://wa.me/971586169311" target="_blank" rel="noreferrer" data-magnetic data-testid="chat-whatsapp" className="flex-1 text-center text-[10px] font-mono tracking-[0.25em] uppercase glass rounded-full py-2 hover:border-[var(--apex-gold)]/50 transition-colors">WhatsApp</a>
              <a href="mailto:mediaapex15@gmail.com" data-magnetic data-testid="chat-email" className="flex-1 text-center text-[10px] font-mono tracking-[0.25em] uppercase glass rounded-full py-2 hover:border-[var(--apex-gold)]/50 transition-colors">Email</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--apex-gold)]"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}
