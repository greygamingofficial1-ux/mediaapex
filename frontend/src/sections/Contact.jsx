import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const services = [
  "Website Design", "Website Development", "Landing Pages", "SEO", "Google Ads", "Meta Ads",
  "AI Chatbots", "AI Automation", "CRM Integration", "API Integration", "Brand Identity",
  "Video Editing", "Social Media Management", "Influencer Marketing", "VIP Numbers", "Other",
];
const budgets = ["AED 1,500 – 5,000", "AED 5,000 – 15,000", "AED 15,000 – 50,000", "AED 50,000+"];

function Field({ label, name, type = "text", value, onChange, required, textarea }) {
  const [focus, setFocus] = useState(false);
  const filled = value && value.length > 0;
  return (
    <label className={`block relative pt-6 pb-3 border-b transition-colors duration-300 ${focus ? "border-[var(--apex-gold)]" : "border-white/15"}`}>
      <span className={`absolute left-0 font-mono text-[10px] tracking-[0.3em] uppercase transition-all duration-300 ${focus || filled ? "top-0 text-[var(--apex-gold)]" : "top-7 text-white/50"}`}>{label}{required && " *"}</span>
      {textarea ? (
        <textarea
          name={name} value={value} required={required}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          onChange={onChange} rows={3}
          className="w-full bg-transparent outline-none text-[var(--apex-warm)] font-body resize-none pt-1"
          data-testid={`contact-field-${name}`}
        />
      ) : (
        <input
          type={type} name={name} value={value} required={required}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          onChange={onChange}
          className="w-full bg-transparent outline-none text-[var(--apex-warm)] font-body pt-1"
          data-testid={`contact-field-${name}`}
        />
      )}
    </label>
  );
}

export default function Contact() {
  const [form, setForm] = useState({
    name: "", business: "", email: "", phone: "", country: "UAE", service: "", budget: "", message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [err, setErr] = useState("");

  const update = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending"); setErr("");
    try {
      await axios.post(`${API}/leads`, { ...form, source: "contact_form" });
      setStatus("success");
      setForm({ name: "", business: "", email: "", phone: "", country: "UAE", service: "", budget: "", message: "" });
    } catch (e2) {
      setStatus("error");
      setErr(e2?.response?.data?.detail?.toString() || "Something went wrong. Please reach us on WhatsApp.");
    }
  };

  return (
    <section id="contact" className="section relative" data-testid="contact-section">
      {/* Soft golden fog */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden style={{
        background: "radial-gradient(ellipse at 80% 20%, rgba(212,175,55,0.08), transparent 50%), radial-gradient(ellipse at 10% 80%, rgba(212,175,55,0.05), transparent 50%)",
      }} />

      <div className="mx-auto max-w-7xl relative">
        <div className="max-w-4xl">
          <span className="eyebrow">Let's talk</span>
          <h2 className="mt-6 font-display text-5xl md:text-6xl lg:text-8xl text-[var(--apex-warm)] leading-[0.95] tracking-tighter">
            Let's build something <br/>
            <span className="gold-text-gradient italic font-light">extraordinary.</span>
          </h2>
          <p className="mt-8 max-w-xl text-white/65 text-lg leading-relaxed">
            Whether you need a premium website, AI automation or a complete digital growth engine — Apex Media is ready to design and deliver it.
          </p>
        </div>

        <div className="mt-20 grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9 }}
            className="lg:col-span-2 glass-strong rounded-3xl p-8 md:p-10"
            data-testid="contact-info-card"
          >
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--apex-gold)]">Direct line</div>
            <a href="tel:+971586169311" data-magnetic data-testid="contact-phone" className="block mt-2 font-display text-3xl md:text-4xl text-[var(--apex-warm)] hover:text-[var(--apex-gold)] transition-colors">
              +971 58 616 9311
            </a>
            <div className="mt-1 text-sm text-white/45">Mon — Sat · 9 AM – 7 PM (GST)</div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--apex-gold)]">Email</div>
              <a href="mailto:mediaapex15@gmail.com?subject=Business%20Inquiry" data-magnetic data-testid="contact-email" className="block mt-2 font-display text-xl md:text-2xl text-[var(--apex-warm)] hover:text-[var(--apex-gold)] transition-colors break-all">
                mediaapex15@gmail.com
              </a>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--apex-gold)]">Location</div>
              <div className="mt-2 font-display text-xl text-[var(--apex-warm)]">Dubai, UAE</div>
            </div>

            <div className="mt-10 flex flex-col gap-3">
              <a
                href="https://wa.me/971586169311?text=Hi%20Apex%20Media%2C%20I%20visited%20your%20website%20and%20I'm%20interested%20in%20your%20digital%20growth%20services."
                target="_blank" rel="noreferrer" data-magnetic data-testid="contact-whatsapp"
                className="magnetic-btn primary !w-full"
              >
                <span className="btn-fill" />
                WhatsApp the Team
              </a>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("apex:openChat"))}
                data-magnetic data-testid="contact-open-ai"
                className="magnetic-btn !w-full"
              >
                <span className="btn-fill" />
                Chat with Apex AI
              </button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 text-[10px] font-mono tracking-[0.2em] uppercase text-white/45">
              {["AI Powered","Premium Support","Fast Delivery","Secure Process","Growth Focused","Modern Tech"].map(b => (
                <div key={b} className="glass rounded-full px-3 py-2 text-center">{b}</div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9 }}
            className="lg:col-span-3 glass rounded-3xl p-8 md:p-10"
            data-testid="contact-form"
          >
            <div className="grid md:grid-cols-2 gap-x-8">
              <Field label="Full Name" name="name" value={form.name} onChange={update} required />
              <Field label="Business / Brand" name="business" value={form.business} onChange={update} />
              <Field label="Email" name="email" type="email" value={form.email} onChange={update} required />
              <Field label="Phone" name="phone" value={form.phone} onChange={update} />
              <Field label="Country" name="country" value={form.country} onChange={update} />
              <label className="block relative pt-6 pb-3 border-b border-white/15">
                <span className="absolute left-0 top-0 font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--apex-gold)]">Service</span>
                <select name="service" value={form.service} onChange={update} className="w-full bg-transparent outline-none text-[var(--apex-warm)] font-body pt-1" data-testid="contact-field-service">
                  <option value="" className="bg-black">Select a service</option>
                  {services.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
                </select>
              </label>
              <label className="block relative pt-6 pb-3 border-b border-white/15 md:col-span-2">
                <span className="absolute left-0 top-0 font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--apex-gold)]">Budget Range</span>
                <select name="budget" value={form.budget} onChange={update} className="w-full bg-transparent outline-none text-[var(--apex-warm)] font-body pt-1" data-testid="contact-field-budget">
                  <option value="" className="bg-black">Select budget</option>
                  {budgets.map(b => <option key={b} value={b} className="bg-black">{b}</option>)}
                </select>
              </label>
              <div className="md:col-span-2">
                <Field label="Tell us about your project" name="message" value={form.message} onChange={update} textarea />
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-5">
              <p className="text-xs text-white/45 max-w-xs">By submitting, you agree to be contacted by Apex Media regarding your request. We never share your data.</p>
              <button type="submit" disabled={status === "sending"} data-magnetic data-testid="contact-submit" className="magnetic-btn primary">
                <span className="btn-fill" />
                {status === "sending" ? "Sending…" : status === "success" ? "Sent ✓" : "Start the Project"}
              </button>
            </div>
            {status === "success" && (
              <div className="mt-6 glass rounded-2xl p-5 text-sm text-white/80" data-testid="contact-success">
                Thank you. Your requirement has been noted — Apex Media will reach out shortly. For an instant reply, message us on WhatsApp.
              </div>
            )}
            {status === "error" && (
              <div className="mt-6 glass rounded-2xl p-5 text-sm text-red-300" data-testid="contact-error">{err}</div>
            )}
          </motion.form>
        </div>

        <BookingBlock />
      </div>
    </section>
  );
}

function BookingBlock() {
  const [b, setB] = useState({ name: "", email: "", phone: "", business: "", service: "", date: "", time: "10:00", notes: "" });
  const [st, setSt] = useState("idle"); const [er, setEr] = useState("");
  const upd = (e) => setB(p => ({ ...p, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setSt("sending"); setEr("");
    try {
      await axios.post(`${API}/bookings`, b);
      setSt("success");
    } catch (e2) { setSt("error"); setEr(e2?.response?.data?.detail?.toString() || "Try WhatsApp instead."); }
  };
  const waLink = () => {
    const msg = `Hi Apex Media, I'd like to book a consultation.%0AName: ${b.name}%0ABusiness: ${b.business}%0AService: ${b.service}%0APreferred: ${b.date} ${b.time}%0ANotes: ${b.notes}`;
    return `https://wa.me/971586169311?text=${msg}`;
  };
  const today = new Date().toISOString().slice(0, 10);
  const times = ["09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00","18:00"];
  const inputCls = "w-full bg-transparent outline-none text-[var(--apex-warm)] font-body pt-1 pb-2 border-b border-white/15 focus:border-[var(--apex-gold)] transition-colors";
  return (
    <div id="booking" className="mt-20 glass-strong rounded-3xl p-8 md:p-12" data-testid="booking-block">
      <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
        <div>
          <span className="eyebrow">Book a consultation</span>
          <h3 className="mt-5 font-display text-3xl md:text-5xl text-[var(--apex-warm)] leading-tight">Reserve your <span className="gold-text-gradient italic">strategy session</span>.</h3>
          <p className="mt-3 text-white/55 max-w-xl">Free 30-minute call. We'll map your growth bottlenecks and propose a tailored Apex roadmap.</p>
        </div>
        <a href={waLink()} target="_blank" rel="noreferrer" data-magnetic data-testid="booking-whatsapp" className="magnetic-btn"><span className="btn-fill"/>Book via WhatsApp</a>
      </div>
      <form onSubmit={submit} className="grid md:grid-cols-3 gap-6">
        <input name="name" required placeholder="Full Name *" value={b.name} onChange={upd} className={inputCls} data-testid="booking-name"/>
        <input name="email" type="email" required placeholder="Email *" value={b.email} onChange={upd} className={inputCls} data-testid="booking-email"/>
        <input name="phone" placeholder="Phone (UAE)" value={b.phone} onChange={upd} className={inputCls} data-testid="booking-phone"/>
        <input name="business" placeholder="Business" value={b.business} onChange={upd} className={inputCls} data-testid="booking-business"/>
        <select name="service" value={b.service} onChange={upd} className={inputCls} data-testid="booking-service">
          <option value="" className="bg-black">Service Interest</option>
          {services.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
        </select>
        <input name="date" type="date" required min={today} value={b.date} onChange={upd} className={inputCls} data-testid="booking-date"/>
        <select name="time" value={b.time} onChange={upd} className={inputCls} data-testid="booking-time">
          {times.map(t => <option key={t} value={t} className="bg-black">{t}</option>)}
        </select>
        <input name="notes" placeholder="Notes (optional)" value={b.notes} onChange={upd} className={`${inputCls} md:col-span-2`} data-testid="booking-notes"/>
        <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-5 mt-4">
          <p className="text-xs text-white/45">All times Dubai (GST). We confirm within 2 working hours.</p>
          <button type="submit" disabled={st === "sending"} data-magnetic data-testid="booking-submit" className="magnetic-btn primary"><span className="btn-fill"/>{st === "sending" ? "Booking…" : st === "success" ? "Requested ✓" : "Request Slot"}</button>
        </div>
        {st === "success" && <div className="md:col-span-3 glass rounded-2xl p-4 text-sm text-white/80" data-testid="booking-success">Slot requested. We've sent confirmation to {b.email}. Prefer WhatsApp? Use the button above for instant booking.</div>}
        {st === "error" && <div className="md:col-span-3 glass rounded-2xl p-4 text-sm text-red-300" data-testid="booking-error">{er}</div>}
      </form>
    </div>
  );
}
