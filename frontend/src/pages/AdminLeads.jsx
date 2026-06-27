import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = "apex_admin_token";
const STATUSES = [
  { v: "all",         l: "All" },
  { v: "new",         l: "New" },
  { v: "contacted",   l: "Contacted" },
  { v: "in_progress", l: "In Progress" },
  { v: "closed",      l: "Closed" },
];
const STATUS_COLOR = {
  new:         "#D4AF37",
  contacted:   "#7DD3FC",
  in_progress: "#FBBF24",
  closed:      "#86EFAC",
};

export default function AdminLeads() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [auth, setAuth]   = useState(!!localStorage.getItem(TOKEN_KEY));
  const [authError, setAuthError] = useState("");
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const headers = useMemo(() => ({ "X-Admin-Token": token }), [token]);

  const login = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      await axios.post(`${API}/admin/login`, { token });
      localStorage.setItem(TOKEN_KEY, token);
      setAuth(true);
    } catch { setAuthError("Invalid token"); }
  };
  const logout = () => { localStorage.removeItem(TOKEN_KEY); setAuth(false); setToken(""); };

  const load = async () => {
    setLoading(true);
    try {
      const [l, a] = await Promise.all([
        axios.get(`${API}/admin/leads`, { headers, params: { status, q } }),
        axios.get(`${API}/admin/analytics`, { headers }),
      ]);
      setLeads(l.data); setAnalytics(a.data);
    } catch (e) {
      if (e?.response?.status === 401) logout();
    } finally { setLoading(false); }
  };

  useEffect(() => { if (auth) load(); /* eslint-disable-next-line */ }, [auth, status]);

  const updateStatus = async (id, s) => {
    try {
      await axios.patch(`${API}/admin/leads/${id}`, { status: s }, { headers });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: s } : l));
    } catch {}
  };

  const [expanded, setExpanded] = useState(null);
  const [transcript, setTranscript] = useState({ loading: false, data: null });
  const toggleExpand = async (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    setTranscript({ loading: true, data: null });
    try {
      const r = await axios.get(`${API}/admin/leads/${id}/chat`, { headers });
      setTranscript({ loading: false, data: r.data });
    } catch {
      setTranscript({ loading: false, data: { lead: null, transcript: [], draft: null } });
    }
  };
  const fmtTime = (iso) => { try { return new Date(iso).toLocaleString(); } catch { return iso; } };

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--apex-black)" }}>
        <form onSubmit={login} className="glass-strong rounded-3xl p-10 w-full max-w-md" data-testid="admin-login">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: "linear-gradient(135deg,#D4AF37,#B38728)" }}>
              <span className="font-display text-[#0a0a0a]">A</span>
            </div>
            <h1 className="mt-5 font-display text-3xl text-[var(--apex-warm)]">Apex Admin</h1>
            <p className="mt-2 text-sm text-white/50">Enter your admin token to continue.</p>
          </div>
          <input
            type="password" autoFocus required value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Admin token"
            data-testid="admin-token-input"
            className="w-full bg-transparent border border-white/15 focus:border-[var(--apex-gold)] rounded-xl px-4 py-3 outline-none text-[var(--apex-warm)]"
          />
          {authError && <div className="mt-3 text-sm text-red-300" data-testid="admin-login-error">{authError}</div>}
          <button type="submit" className="magnetic-btn primary !w-full mt-6" data-testid="admin-login-submit"><span className="btn-fill"/>Sign in</button>
          <a href="/" className="block text-center mt-6 text-xs font-mono tracking-[0.25em] uppercase text-white/40 hover:text-[var(--apex-gold)]">← Back to site</a>
        </form>
      </div>
    );
  }

  const cards = analytics ? [
    { k: "Total Leads",   v: analytics.total_leads,   sub: "All time" },
    { k: "Last 7 Days",   v: analytics.last_7_days,   sub: "New leads" },
    { k: "Bookings",      v: analytics.bookings,      sub: "Strategy calls" },
    { k: "AI Chats",      v: analytics.ai_messages,   sub: "Apex AI msgs" },
  ] : [];

  return (
    <div className="min-h-screen px-4 md:px-10 py-10" style={{ background: "var(--apex-black)" }} data-testid="admin-dashboard">
      <header className="flex items-center justify-between flex-wrap gap-4 mb-10">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-[var(--apex-gold)]">APEX MEDIA · ADMIN</div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl text-[var(--apex-warm)]">Leads Dashboard</h1>
        </div>
        <div className="flex gap-3">
          <a href={`${API}/admin/leads.csv?token=${encodeURIComponent(token)}`} className="magnetic-btn" data-testid="admin-export-csv"><span className="btn-fill"/>Export CSV</a>
          <button onClick={load} className="magnetic-btn" data-testid="admin-refresh"><span className="btn-fill"/>Refresh</button>
          <button onClick={logout} className="magnetic-btn" data-testid="admin-logout"><span className="btn-fill"/>Logout</button>
        </div>
      </header>

      {/* Analytics cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.k} className="glass rounded-2xl p-6" data-testid={`stat-${c.k.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/45">{c.k}</div>
            <div className="mt-3 font-display text-4xl gold-text-gradient">{c.v}</div>
            <div className="mt-1 font-mono text-[10px] text-white/45">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(analytics.by_status).map(([s, n]) => (
            <div key={s} className="glass rounded-2xl p-5 flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/45">{s.replace("_", " ")}</div>
                <div className="mt-2 font-display text-2xl text-[var(--apex-warm)]">{n}</div>
              </div>
              <span className="w-3 h-3 rounded-full" style={{ background: STATUS_COLOR[s] }} />
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="glass rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
        <input
          placeholder="Search name, email, business, service…"
          value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          className="flex-1 min-w-[260px] bg-transparent border border-white/10 focus:border-[var(--apex-gold)] rounded-xl px-4 py-2 outline-none text-sm"
          data-testid="admin-search"
        />
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s.v}
              onClick={() => setStatus(s.v)}
              data-testid={`filter-${s.v}`}
              className={`text-[11px] font-mono tracking-[0.2em] uppercase px-4 py-2 rounded-full border transition-colors ${status === s.v ? "border-[var(--apex-gold)] text-[var(--apex-gold)]" : "border-white/10 text-white/60"}`}
            >{s.l}</button>
          ))}
        </div>
        <button onClick={load} className="magnetic-btn !px-5 !py-2 !text-[10px]"><span className="btn-fill"/>Apply</button>
      </div>

      {/* Leads table */}
      <div className="glass rounded-2xl overflow-hidden" data-testid="admin-leads-table">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[10px] tracking-[0.25em] uppercase text-white/50 border-b border-white/10">
                {["Date","Name","Email","Service","Budget","Status","Source",""].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="px-4 py-10 text-center text-white/40">Loading…</td></tr>}
              {!loading && leads.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-white/40">No leads yet.</td></tr>}
              {leads.map(l => (
                <React.Fragment key={l.id}>
                <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-[11px] text-white/55">{(l.created_at || "").slice(0, 10)}</td>
                  <td className="px-4 py-3 text-[var(--apex-warm)]">{l.name}<div className="text-white/40 text-xs">{l.business}</div></td>
                  <td className="px-4 py-3"><a href={`mailto:${l.email}`} className="text-white/80 hover:text-[var(--apex-gold)]">{l.email}</a><div className="text-white/40 text-xs">{l.phone}</div></td>
                  <td className="px-4 py-3 text-white/70">{l.service || "—"}</td>
                  <td className="px-4 py-3 text-white/70">{l.budget || "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={l.status} onChange={(e) => updateStatus(l.id, e.target.value)}
                      data-testid={`status-select-${l.id}`}
                      className="bg-transparent border rounded-full px-3 py-1 text-xs font-mono tracking-wider uppercase outline-none"
                      style={{ borderColor: STATUS_COLOR[l.status] || "#fff3", color: STATUS_COLOR[l.status] || "#fff" }}
                    >
                      {STATUSES.slice(1).map(s => <option key={s.v} value={s.v} className="bg-black">{s.l}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-white/45 uppercase">
                    {l.source}
                    {l.source === "apex_ai_chat" && <span className="ml-2 inline-block px-2 py-0.5 rounded-full border border-[var(--apex-gold)]/40 text-[9px] text-[var(--apex-gold)]">AI</span>}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => toggleExpand(l.id)}
                      data-testid={`expand-${l.id}`}
                      className="text-[var(--apex-gold)] text-xs hover:underline mr-3"
                    >{expanded === l.id ? "Hide" : "Transcript"}</button>
                    <a href={`${API}/admin/leads/${l.id}/quote.pdf?token=${encodeURIComponent(token)}`}
                       target="_blank" rel="noreferrer"
                       data-testid={`quote-pdf-${l.id}`}
                       className="text-[var(--apex-gold)] text-xs hover:underline mr-3">Quote PDF</a>
                    <a href={`https://wa.me/${(l.phone || "971586169311").replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-[var(--apex-gold)] text-xs hover:underline">WhatsApp</a>
                  </td>
                </tr>
                {expanded === l.id && (
                  <tr className="bg-black/40">
                    <td colSpan={8} className="px-4 py-5" data-testid={`transcript-${l.id}`}>
                      <LeadTranscript loading={transcript.loading} data={transcript.data} fmtTime={fmtTime} />
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top services */}
      {analytics && analytics.top_services?.length > 0 && (
        <div className="mt-8 glass rounded-2xl p-6">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--apex-gold)] mb-4">Top requested services</div>
          <div className="space-y-2">
            {analytics.top_services.map(s => {
              const max = analytics.top_services[0].count || 1;
              return (
                <div key={s.service} className="flex items-center gap-3">
                  <div className="w-48 text-sm text-white/75 truncate">{s.service}</div>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full" style={{ width: `${(s.count / max) * 100}%`, background: "linear-gradient(90deg,#BF953F,#FCF6BA)" }} />
                  </div>
                  <div className="w-10 text-right font-mono text-xs text-white/60">{s.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LeadTranscript({ loading, data, fmtTime }) {
  if (loading) return <div className="text-white/40 text-sm">Loading transcript…</div>;
  if (!data || !data.lead) return <div className="text-white/40 text-sm">Unavailable.</div>;
  const l = data.lead;
  const t = data.transcript || [];
  const captured = [
    ["Name", l.name], ["Business", l.business], ["Email", l.email], ["Phone", l.phone],
    ["Service interest", l.service], ["Budget", l.budget], ["Country", l.country],
  ].filter(([, v]) => v);
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--apex-gold)] mb-3">Captured details</div>
        <dl className="space-y-2 text-sm">
          {captured.map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-28 text-white/40 text-xs font-mono uppercase tracking-wider">{k}</dt>
              <dd className="flex-1 text-white/90 break-words">{v}</dd>
            </div>
          ))}
          {l.message && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-1">Note</div>
              <div className="text-white/80 text-sm whitespace-pre-wrap">{l.message}</div>
            </div>
          )}
        </dl>
      </div>
      <div className="md:col-span-2">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--apex-gold)] mb-3">
          Apex AI Transcript {t.length > 0 && <span className="text-white/40">· {t.length} messages</span>}
        </div>
        {t.length === 0 ? (
          <div className="text-white/40 text-sm italic">No chat transcript for this lead.</div>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2">
            {t.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-[var(--apex-gold)] text-[#0a0a0a]" : "glass text-white/90"}`}>
                  <div className="text-[9px] font-mono tracking-widest uppercase opacity-60 mb-1">
                    {m.role === "user" ? "Visitor" : "Apex AI"} · {fmtTime(m.created_at)}
                  </div>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
