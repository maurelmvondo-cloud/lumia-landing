"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, AlertCircle, XCircle, Sparkles, Loader2, Menu, X, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import LumiaAnimation, { HeroAnimation, useCurrentFrame } from "@/components/LumiaAnimation";
import { FakeChatInterface } from "@/components/FakeChatInterface";


// ─── Global Styles ────────────────────────────────────────────────────────────
// Note: DM Sans is loaded via <link> tag in the Home component (not @import here)
const GLOBAL_STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  
  .hero-title {
    white-space: nowrap;
    text-align: center;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  .mobile-break {
    display: none;
  }

  .claude-chat-layer {
    position: absolute;
    top: -150px;
    left: 80px;
    right: -180px;
    bottom: 130px;
    z-index: 0;
  }

  @media (max-width: 768px) {
    .hero-title {
      white-space: normal !important;
      font-size: clamp(48px, 14vw, 64px) !important;
      letter-spacing: -2px !important;
    }
    .mobile-break {
      display: block;
    }
    .claude-chat-layer {
      top: 20px !important;
      left: 0px !important;
      right: 0px !important;
      bottom: 80px !important;
    }
  }

  :root {
    --violet: #567EFC;
    --violet-light: #8BA8FD;
    --violet-soft: #EEF2FF;
    --pink: #EB5E5E;
    --bg: #F8F7FF;
    --surface: #FFFFFF;
    --surface-2: #F3F4FF;
    --text: #0F0A1E;
    --text-2: #6B6480;
    --text-3: #A89FC0;
    --border: rgba(86,126,252,0.12);
    --border-2: rgba(86,126,252,0.06);
    --gradient: linear-gradient(135deg, #567EFC 0%, #C2AED4 50%, #EB5E5E 100%);
    --shadow-card: 0 2px 24px rgba(86,126,252,0.10);
    --shadow-lg: 0 8px 48px rgba(86,126,252,0.18);
    --shadow-dark: 0 24px 60px rgba(0,0,0,0.35);
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #fff;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
    50% { opacity: 0.8; transform: scale(1.15); box-shadow: 0 0 0 6px rgba(239,68,68,0); }
  }
  @keyframes blink-cursor {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  @keyframes marquee-scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(24px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes fillBar {
    from { width: 0%; }
    to { width: 94%; }
  }
  @keyframes glow-pulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.08); }
  }
  @keyframes toast-in {
    from { opacity: 0; transform: translateY(8px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .hover-lift {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  .btn-spring {
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease, box-shadow 0.2s ease;
  }
  .btn-spring:hover {
    transform: translateY(-2px) scale(1.02);
  }
  .blink { animation: blink-cursor 1s infinite; }

  /* Marquee mask */
  .marquee-mask {
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
    mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
  }

  /* AI logos marquee */
  .ai-marquee { animation: marquee-scroll 22s linear infinite; }
  .ai-marquee:hover { animation-play-state: paused; }

  /* ─── Pain Section ──────────────────────────────────────────────────── */
  .pain-section {
    background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 100%);
    border-top: 0.5px solid rgba(86,126,252,0.06);
    border-bottom: 0.5px solid rgba(86,126,252,0.06);
    padding: 80px 48px;
  }
  .pain-header-rule {
    width: 40px;
    height: 1.5px;
    background: linear-gradient(90deg, #567EFC, #C2AED4, #FF7769);
    margin: 24px auto 0;
  }
  .pain-cards-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 48px;
    align-items: stretch;
  }
  .pain-cards-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .pain-card-hero {
    background: #0F0A1E;
    border: 0.5px solid rgba(86,126,252,0.2);
    border-radius: 16px;
    padding: 32px;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    cursor: default;
  }
  .pain-card-hero:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 48px rgba(86,126,252,0.3);
  }
  .pain-card-hero-divider {
    width: 100%;
    height: 0.5px;
    background: rgba(86,126,252,0.15);
    margin: 24px 0;
    flex-shrink: 0;
  }
  .pain-f1-inner-tag {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(167,139,250,0.6);
    margin-bottom: 12px;
  }
  .pain-f1-inner-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    line-height: 1.8;
    color: rgba(255,255,255,0.65);
  }
  .pain-f1-inner-text .accent {
    background: linear-gradient(90deg, #567EFC, #C2AED4, #FF7769);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 500;
  }
  .pain-f1-inner-footer {
    font-size: 12px;
    color: rgba(255,255,255,0.25);
    margin-top: 14px;
    padding-top: 12px;
    border-top: 0.5px solid rgba(255,255,255,0.06);
    font-style: italic;
    font-family: 'DM Sans', sans-serif;
  }
  .pain-card-sm {
    background: #FFFFFF;
    border: 0.5px solid rgba(124,58,237,0.12);
    border-radius: 16px;
    padding: 28px;
    transition: all 0.25s ease;
    flex: 1;
    min-height: 0;
    cursor: default;
  }
  .pain-card-sm.accented {
    border-left: 3px solid rgba(86,126,252,0.45);
    border-radius: 0 16px 16px 0;
  }
  .pain-card-sm.subtle {
    background: #FAFAFA;
    border-color: rgba(124,58,237,0.08);
  }
  .pain-card-sm:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(86,126,252,0.10);
  }
  .pain-most-common {
    display: inline-block;
    font-size: 10px;
    font-weight: 500;
    background: rgba(86,126,252,0.07);
    color: #567EFC;
    padding: 2px 8px;
    border-radius: 999px;
    margin-bottom: 8px;
  }
  .pain-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'Bricolage Grotesque', var(--font-bricolage), sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    border-radius: 999px;
    padding: 3px 10px;
    width: fit-content;
    margin-bottom: 20px;
  }
  .pain-badge-dark {
    color: rgba(86,126,252,0.8);
    background: rgba(86,126,252,0.08);
    border: 0.5px solid rgba(86,126,252,0.2);
  }
  .pain-badge-light {
    background: rgba(86,126,252,0.08);
    border: 0.5px solid rgba(86,126,252,0.15);
    color: #567EFC;
  }
  .pain-card-label-dark {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(86,126,252,0.5);
    font-family: 'DM Sans', sans-serif;
    margin-top: 20px;
  }
  .pain-card-label-light {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-3);
    font-family: 'DM Sans', sans-serif;
    margin-top: 16px;
  }
  .pain-card-title {
    font-family: 'Bricolage Grotesque', var(--font-bricolage), sans-serif;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: var(--text);
    line-height: 1.2;
  }
  .pain-card-title-sm { font-size: 18px; margin-top: 4px; }
  .pain-card-title-hero { font-size: 22px; letter-spacing: -0.5px; color: #FFFFFF; margin-top: 6px; }
  .pain-card-desc {
    font-size: 14px;
    color: var(--text-2);
    line-height: 1.7;
    margin-top: 10px;
    font-family: 'DM Sans', sans-serif;
  }
  .pain-card-desc-hero { color: rgba(255,255,255,0.55); font-size: 14px; margin-top: 12px; }
  .pain-card-quote {
    font-size: 13px;
    font-style: italic;
    background: linear-gradient(90deg, #567EFC, #C2AED4, #FF7769);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 0.5px solid rgba(255,255,255,0.06);
    line-height: 1.6;
    font-family: 'DM Sans', sans-serif;
  }
  .pain-card-quote-light {
    font-size: 12px;
    font-style: italic;
    background: linear-gradient(90deg, #567EFC, #C2AED4, #FF7769);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 0.5px solid rgba(124,58,237,0.08);
    line-height: 1.6;
    font-family: 'DM Sans', sans-serif;
  }
  .pain-bridge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-top: 48px;
    padding: 0 0 8px;
  }
  .pain-bridge-rule {
    width: 48px;
    height: 0.5px;
    background: linear-gradient(90deg, #567EFC, #FF7769);
    margin-bottom: 8px;
  }
  .pain-bridge-title {
    font-family: 'Bricolage Grotesque', var(--font-bricolage), sans-serif;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.5px;
    color: var(--text);
    text-align: center;
  }
  .pain-bridge-sub {
    font-size: 15px;
    color: var(--text-2);
    font-style: italic;
    text-align: center;
    font-family: 'DM Sans', sans-serif;
  }
  .pain-bridge-link {
    font-size: 14px;
    font-weight: 600;
    background: linear-gradient(90deg, #567EFC, #C2AED4, #FF7769);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-decoration: none;
    cursor: pointer;
    margin-top: 4px;
    font-family: 'DM Sans', sans-serif;
  }
  .pain-bridge-link:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .pain-reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .pain-reveal.visible { opacity: 1; transform: translateY(0); }
  .pain-gradient {
    background: linear-gradient(90deg, #567EFC, #C2AED4, #FF7769);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  @media (max-width: 768px) {
    .pain-section { padding: 64px 24px; }
    .pain-cards-grid { grid-template-columns: 1fr; }
    .pain-bridge-title { font-size: 18px; }
    .pain-card-sm.accented {
      border-left: 0.5px solid rgba(124,58,237,0.12);
      border-radius: 16px;
    }
  }
`;

// ─── AI Logos ─────────────────────────────────────────────────────────────────
const AI_LOGOS = [
  { src: "/claude-ai-icon.webp",      name: "Claude" },
  { src: "/chatgpt-icon.webp",       name: "ChatGPT" },
  { src: "/google-gemini-icon.webp",  name: "Gemini" },
  { src: "/perplexity-ai-icon.webp", name: "Perplexity" },
  { src: "/microsoft_copilot-logo_brandlogos.net_zaqzr.png", name: "Copilot" },
  { src: "/Deepseek-logo-icon.svg.png", name: "DeepSeek" },
  { src: "/Notion_app_logo.png",      name: "Notion AI" },
  { src: "/cursor-logo-icon-freelogovectors.net_.png", name: "Cursor" },
  { src: "/grok-icon.webp",          name: "Grok" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type QualityKey = "short" | "mid" | "struct";

// ─── WaitlistForm ─────────────────────────────────────────────────────────────
function WaitlistForm({ variant = "hero" }: { variant?: "hero" | "pricing" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setErrorMessage("");
    if (!isSupabaseConfigured) {
      setStatus("error");
      setErrorMessage("Configuration missing.");
      return;
    }
    try {
      const { error } = await supabase.from("waitlist").insert([{ email }]);
      if (error) {
        if (error.code === "23505") throw new Error("This email is already registered.");
        throw new Error(error.message || "An error occurred.");
      }
      setStatus("success");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong.");
    }
  };

  if (status === "success") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#22C55E", fontWeight: 600, padding: "12px 0" }}>
        <CheckCircle2 size={18} /> <span>You're on the list — we'll be in touch.</span>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          style={{ flex: 1, minWidth: 200, padding: "12px 16px", borderRadius: 999, border: "1.5px solid var(--border)", background: "#fff", fontSize: 14, fontFamily: "DM Sans, sans-serif", color: "var(--text)", outline: "none" }}
        />
        <button type="submit" disabled={status === "loading"}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 20px", borderRadius: 999, background: "var(--gradient)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>
          {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <>Join waitlist <ArrowRight size={14} /></>}
        </button>
      </form>
      {status === "error" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#EF4444", fontSize: 13, marginTop: 8, paddingLeft: 4 }}>
          <AlertCircle size={14} /> {errorMessage}
        </div>
      )}
    </div>
  );
}

// ─── PricingPaidForm ──────────────────────────────────────────────────────────
function PricingPaidForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setErrorMessage("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong.");
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          style={{ width: "100%", padding: "13px 18px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 14, fontFamily: "DM Sans, sans-serif", outline: "none" }}
        />
        <button type="submit" disabled={status === "loading"}
          className="btn-spring"
          style={{ width: "100%", padding: "14px 24px", borderRadius: 999, background: "#fff", color: "#0F0A1E", border: "none", cursor: "pointer", fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <>Become a founding member <ArrowRight size={15} /></>}
        </button>
      </form>
      {status === "error" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#FCA5A5", fontSize: 13, marginTop: 8 }}>
          <AlertCircle size={14} /> {errorMessage}
        </div>
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <>
      <style>{`
        .nav-link { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: var(--text-2); background: none; border: none; cursor: pointer; transition: color 0.2s; padding: 4px 0; }
        .nav-link:hover { color: var(--text); }
      `}</style>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(20px, 5vw, 64px)",
        background: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "0.5px solid var(--border)" : "none",
        transition: "all 0.3s ease",
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/logo.png" alt="Lumia" style={{ width: 28, height: 28, objectFit: "contain" }} />
          <span style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text)", letterSpacing: "-0.5px" }}>Lumia</span>
        </a>

        {/* Desktop nav */}
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", alignItems: "center", gap: 36 }} className="hidden md:flex">
          {[["How it works", "how"], ["Compare", "compare"], ["Pricing", "pricing"]].map(([label, id]) => (
            <button key={id} className="nav-link" onClick={() => scrollTo(id)}>{label}</button>
          ))}
        </div>

        {/* Desktop CTA */}
        <button onClick={() => scrollTo("pricing")}
          className="btn-spring hidden md:flex"
          style={{ alignItems: "center", gap: 8, background: "#0F0A1E", color: "#fff", border: "none", borderRadius: 999, padding: "10px 18px", cursor: "pointer", fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF4444", display: "inline-block", animation: "pulse-dot 1.5s infinite" }} />
          Founding member — $99 lifetime
        </button>

        {/* Mobile burger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text)", padding: 6 }}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            style={{ position: "fixed", top: 64, left: 0, right: 0, zIndex: 99, background: "#fff", padding: "20px 24px 24px", borderBottom: "0.5px solid var(--border)", display: "flex", flexDirection: "column", gap: 16 }}>
            {[["How it works", "how"], ["Compare", "compare"], ["Pricing", "pricing"]].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{ textAlign: "left", background: "none", border: "none", fontSize: 17, fontWeight: 500, color: "var(--text)", cursor: "pointer", fontFamily: "DM Sans, sans-serif", padding: "4px 0" }}>{label}</button>
            ))}
            <button onClick={() => scrollTo("pricing")}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#0F0A1E", color: "#fff", border: "none", borderRadius: 999, padding: "14px 24px", fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF4444", display: "inline-block", animation: "pulse-dot 1.5s infinite" }} />
              Founding member — $99 lifetime
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", textAlign: "center", padding: "clamp(100px, 13vh, 150px) clamp(20px, 5vw, 64px) 32px", position: "relative", overflow: "hidden", background: "var(--bg)" }}>
      {/* Background glows */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "10%", left: "15%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(86,126,252,0.10) 0%, transparent 70%)", animation: "glow-pulse 6s infinite ease-in-out" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(235,94,94,0.08) 0%, transparent 70%)", animation: "glow-pulse 6s 3s infinite ease-in-out" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, width: "100%", margin: "0 auto" }}>
        {/* Eyebrow */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--violet-soft)", border: "0.5px solid var(--border)", borderRadius: 999, padding: "7px 16px", marginBottom: 28, fontSize: 13, fontWeight: 600, color: "var(--violet)", letterSpacing: "0.01em", animation: "fadeUp 0.6s ease both" }}>
          ✦ Your personal prompt consultant — always on
        </div>

        {/* H1 */}
        <h1 className="hero-title" style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: "clamp(64px, 9.5vw, 120px)", letterSpacing: "-4px", lineHeight: 1.0, color: "var(--text)", margin: "0 auto 28px", animation: "fadeUp 0.7s 0.08s ease both" }}>
          Vibe prompting <br />
          <span style={{ background: "linear-gradient(90deg, #567EFC, #C2AED4, #FF7769)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>starts here.</span>
        </h1>

        {/* Subtitle */}
        <p style={{ fontFamily: "DM Sans, sans-serif", fontStyle: "normal", fontWeight: 500, fontSize: "clamp(1.125rem, 1.5vw, 1.375rem)", color: "rgba(30,24,48,0.75)", maxWidth: 520, margin: "24px auto 32px", lineHeight: 1.6, animation: "fadeUp 0.7s 0.15s ease both", textAlign: "center" }}>
          Lumia floats over any AI you use. Drop your intention — and it turns it into a prompt that ships.
        </p>

        {/* Hero Animation */}
        <div style={{ width: "100%", maxWidth: 480, margin: "48px auto 32px", animation: "fadeUp 0.8s 0.4s ease both" }}>
          <HeroAnimation />
        </div>

        {/* CTA — below animation */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 0, marginBottom: 50, animation: "fadeUp 0.7s 0.5s ease both" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <button onClick={() => scrollTo("pricing")}
              className="btn-spring"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#0F0A1E", color: "#fff", border: "none", borderRadius: 999, padding: "18px 40px", cursor: "pointer", fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 18, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
              Join the waitlist
              <ArrowRight size={18} />
            </button>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif", margin: 0 }}>
            Mac · Private beta Q3 2026 · Public launch Q4 2026
          </p>
          <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-2)", opacity: 0.7, fontFamily: "DM Sans, sans-serif", marginTop: 4, letterSpacing: "0.02em" }}>
            No extension. No copy-paste. One shortcut.
          </p>
        </div>
      </div>
    </section>

    </>
  );
}

// ─── Pain Section ─────────────────────────────────────────────────────────────
function PainSection() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="pain-section">
      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <p className="pain-reveal" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", background: "linear-gradient(90deg, #567EFC, #C2AED4, #FF7769)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 16, fontFamily: "DM Sans, sans-serif" }}>
          The Skill Gap
        </p>
        <h2 className="pain-reveal" style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(36px, 5vw, 56px)", letterSpacing: "-1px", color: "var(--text)", lineHeight: 1.1, maxWidth: 820, margin: "0 auto 20px" }}>
          The best model in the world<br />
          <span className="pain-gradient">is useless if you can&apos;t drive it.</span>
        </h2>
        <p className="pain-reveal" style={{ fontSize: 17, fontWeight: 300, fontStyle: "italic", color: "var(--text-2)", lineHeight: 1.75, maxWidth: 560, margin: "0 auto", fontFamily: "DM Sans, sans-serif" }}>
          Getting real results from AI isn&apos;t just about having access to the right model. It&apos;s about knowing exactly what to say, when to say it, and how to give it the context it needs — every single time. That&apos;s a skill most people never have time to learn.
        </p>
        <div className="pain-header-rule" />
      </div>

      {/* Main grid — 2 columns equal width */}
      <div className="pain-cards-grid">

        {/* Left: dark hero card with F1 merged inside */}
        <div className="pain-card-hero">
          {/* Zone A: Pain 01 */}
          <span className="pain-badge pain-badge-dark">01</span>
          <p className="pain-card-label-dark">No One Taught You This</p>
          <h3 className="pain-card-title pain-card-title-hero">
            Prompting well is a discipline. You never signed up to learn it.
          </h3>
          <p className="pain-card-desc pain-card-desc-hero">
            Structuring context, managing memory, defining roles, chaining prompts — these are real skills that take months to develop. You&apos;re trying to ship product, not get a PhD in prompt engineering.
          </p>
          <p className="pain-card-quote">
            &ldquo;Getting a useful answer from AI requires 20 minutes of setup. By the time it understands me, I&apos;ve lost the thread of what I was building.&rdquo;
          </p>

          {/* Divider */}
          <div className="pain-card-hero-divider" />

          {/* Zone B: F1 analogy moved inside card */}
          <p className="pain-f1-inner-tag">The F1 Analogy</p>
          <p className="pain-f1-inner-text">
            A Formula 1 car is the fastest vehicle ever built.<br />
            Put an average driver behind the wheel — it crashes in the first corner.<br />
            AI is the same. The model isn&apos;t the bottleneck. <span className="accent">You are. And that&apos;s not your fault — nobody taught you how to be a context engineer.</span>
          </p>
          <p className="pain-f1-inner-footer">
            The gap between what AI can do and what most people get out of it — is your real problem.
          </p>
        </div>

        {/* Right: 2 stacked cards */}
        <div className="pain-cards-right">
          {/* Card 02 */}
          <div className="pain-card-sm accented pain-reveal">
            <span className="pain-badge pain-badge-light">02</span>
            <p className="pain-card-label-light">Every Switch Resets Everything</p>
            <h3 className="pain-card-title pain-card-title-sm">Claude, ChatGPT, Cursor. Three tools, three blank slates.</h3>
            <p className="pain-card-desc">
              Every time you change tools, you start from zero. There&apos;s no shared memory, no persistent context. You are the integration layer — manually.
            </p>
            <p className="pain-card-quote-light">
              &ldquo;I keep a 2000-word brief I paste into every session. Every. Single. One.&rdquo;
            </p>
          </div>

          {/* Card 03 */}
          <div className="pain-card-sm subtle pain-reveal">
            <span className="pain-most-common">Most common pain</span>
            <span className="pain-badge pain-badge-light">03</span>
            <p className="pain-card-label-light">The Context Tax</p>
            <h3 className="pain-card-title pain-card-title-sm">You spend more time explaining than actually building.</h3>
            <p className="pain-card-desc">
              Before every real question, you re-explain your project, your tone, your constraints, your stack. The overhead is invisible — until you add it up.
            </p>
            <p className="pain-card-quote-light">
              &ldquo;New chat = re-explain everything. I&apos;m basically doing memory management manually at this point.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Bridge */}
      <div className="pain-bridge">
        <div className="pain-bridge-rule" />
        <p className="pain-bridge-title">This isn&apos;t an AI problem. It&apos;s a context gap problem.</p>
        <p className="pain-bridge-sub">Lumia closes that gap — automatically, silently, on every AI you already use.</p>
        <button className="pain-bridge-link" onClick={() => scrollTo("how")}>See how it works →</button>
      </div>
    </section>
  );
}


// ─── Dashboard Mockup ─────────────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "0.5px solid var(--border)", boxShadow: "var(--shadow-lg)", overflow: "hidden", maxWidth: 460, width: "100%" }}>
      {/* Title bar */}
      <div style={{ background: "#F5F5F7", borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />)}
        </div>
        <span style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 600, color: "#6E6E73", fontFamily: "DM Sans, sans-serif", marginLeft: -54 }}>Lumia AI</span>
      </div>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "0.5px solid var(--border-2)", padding: "0 16px", background: "#fff" }}>
        {["Dashboard", "Vault", "Templates"].map((tab, i) => (
          <div key={tab} style={{ padding: "10px 16px", fontSize: 13, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? "var(--violet)" : "var(--text-3)", borderBottom: i === 0 ? "2px solid var(--violet)" : "2px solid transparent", cursor: "default", fontFamily: "DM Sans, sans-serif" }}>{tab}</div>
        ))}
      </div>
      {/* Body */}
      <div style={{ padding: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 4, fontFamily: "DM Sans, sans-serif" }}>DASHBOARD</p>
        <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text)", marginBottom: 16, letterSpacing: "-0.5px" }}>Recent activity</h3>
        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { value: "50", label: "Prompts generated", color: "var(--violet)", bg: "var(--violet-soft)" },
            { value: "19,949", label: "Words saved", color: "#EF4444", bg: "#FEF2F2" },
            { value: "4h", label: "Hours saved", color: "#22C55E", bg: "#F0FDF4" },
          ].map(stat => (
            <div key={stat.label} style={{ background: stat.bg, borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 18, color: stat.color, letterSpacing: "-0.5px" }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.3, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
        {/* Prompt history */}
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 10, fontFamily: "DM Sans, sans-serif" }}>Prompt history</p>
        {[
          { text: "Roadmap to reach 1K MRR for a SaaS", gain: "+38%" },
          { text: "Content strategy for launch week", gain: "+35%" },
        ].map((row, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--bg)", borderRadius: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--text-2)", fontFamily: "DM Sans, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 10 }}>{row.text}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#22C55E", background: "#F0FDF4", padding: "2px 8px", borderRadius: 999, flexShrink: 0 }}>{row.gain}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Consultant Section ───────────────────────────────────────────────────────
const CONSULTANT_TABS = ["Dashboard", "Vault", "Templates"] as const;
type ConsultantTab = typeof CONSULTANT_TABS[number];

function ConsultantSection() {
  const [activeTab, setActiveTab] = useState<ConsultantTab>("Dashboard");
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveTab(t => {
        const idx = CONSULTANT_TABS.indexOf(t);
        return CONSULTANT_TABS[(idx + 1) % CONSULTANT_TABS.length];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const featureCards = [
    { icon: "📊", title: "Track your stats", desc: "Words Lumia added for you · Precision gained in your prompts · Prompts generated · Time saved", accent: "#FF7769" },
    { icon: "🗂️", title: "Knows your project", desc: "Your Vault stores docs, tone, past decisions. Lumia pulls the right context automatically — no briefing needed.", accent: "#567EFC" },
    { icon: "🔁", title: "Follows you across every AI", desc: "Claude, ChatGPT, Gemini, Perplexity — your consultant doesn\'t lose context on switch.", accent: "#C2AED4" },
    { icon: "👁️", title: "Full transparency, no black box", desc: "See exactly which context was used. Override anything before it fires.", accent: "#FF7769" },
    { icon: "❓", title: "Smart clarifying questions", desc: "Lumia asks the right questions before building — so the output actually fits your context.", accent: "#567EFC" },
    { 
      icon: "🎯", 
      title: "Precision context targeting", 
      desc: (
        <>
          Point to any saved prompt template with <span style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', padding: '1px 6px', color: 'var(--violet)' }}>#template</span> {/* #template = routes to a saved prompt template in the Vault */} or any doc with <span style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', padding: '1px 6px', color: 'var(--violet)' }}>@document</span> {/* @document = routes to a specific doc or folder in the Vault */}. Lumia routes exactly what the AI needs — the right structure, the right source. You decide. It executes.
        </>
      ), 
      accent: "#C2AED4" 
    },
  ];

  return (
    <section style={{ padding: "96px clamp(20px, 5vw, 80px)", background: "var(--bg)", borderTop: "0.5px solid var(--border-2)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))", gap: 64, alignItems: "center" }}>
          {/* Left */}
          <div>
            <p className="reveal" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--violet)", marginBottom: 12, fontFamily: "DM Sans, sans-serif" }}>The concept</p>
            <h2 className="reveal" style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(30px, 4.5vw, 50px)", letterSpacing: "-1.5px", color: "var(--text)", marginBottom: 16, lineHeight: 1.1 }}>Your prompt consultant,<br />always on call.</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {featureCards.map((f, i) => (
                <div key={f.title} className="reveal" style={{
                  background: "#fff",
                  border: "0.5px solid var(--border)",
                  borderRadius: 16,
                  padding: "22px 20px 20px 18px",
                  transitionDelay: `${i * 0.07}s`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  cursor: "pointer",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 12px 32px ${f.accent}30`;
                  e.currentTarget.style.borderColor = f.accent;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
                    <span style={{ fontSize: 20 }}>{f.icon}</span>
                    <span style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", letterSpacing: "-0.3px" }}>{f.title}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5, margin: 0, fontFamily: "DM Sans, sans-serif" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Right — interactive mockup */}
          <div className="reveal" style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: 20, border: "0.5px solid var(--border)", boxShadow: "var(--shadow-dark)", overflow: "hidden", width: "100%", maxWidth: 580 }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}>
              {/* Title bar */}
              <div style={{ background: "#F5F5F7", borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBC2E" }} />
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
                </div>
                <span style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 600, color: "#6E6E73", fontFamily: "DM Sans, sans-serif", marginLeft: -54 }}>Lumia AI</span>
              </div>
              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "0.5px solid var(--border-2)", padding: "0 20px", background: "#fff" }}>
                {CONSULTANT_TABS.map(tab => (
                  <div key={tab} onClick={() => { setActiveTab(tab); setIsPaused(true); }} style={{ padding: "12px 18px", fontSize: 13, fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? "var(--violet)" : "var(--text-3)", borderBottom: activeTab === tab ? "2px solid var(--violet)" : "2px solid transparent", cursor: "pointer", fontFamily: "DM Sans, sans-serif", transition: "color 0.2s, border-color 0.2s" }}>{tab}</div>
                ))}
              </div>
              {/* Tab body with fade */}
              <AnimatePresence mode="wait">
                {activeTab === "Dashboard" && (
                  <motion.div key="dashboard" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                    <div style={{ padding: 24 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 4, fontFamily: "DM Sans, sans-serif" }}>DASHBOARD</p>
                      <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 22, color: "var(--text)", marginBottom: 18, letterSpacing: "-0.5px" }}>Recent activity</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                        <div style={{ background: "var(--violet-soft)", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                          <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 22, color: "var(--violet)", letterSpacing: "-0.5px" }}>50</div>
                          <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.3, marginTop: 3 }}>Prompts generated</div>
                        </div>
                        <div style={{ background: "#FEF2F2", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                          <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 22, color: "#EF4444", letterSpacing: "-0.5px" }}>19,949</div>
                          <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.3, marginTop: 3 }}>Words saved</div>
                        </div>
                        <div style={{ background: "#F0FDF4", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                          <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 22, color: "#22C55E", letterSpacing: "-0.5px" }}>4h</div>
                          <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.3, marginTop: 3 }}>Hours saved</div>
                        </div>
                      </div>
                      <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 12, fontFamily: "DM Sans, sans-serif" }}>Prompt history</p>
                      {[
                        { text: "Roadmap to reach 1k MRR for a SaaS product", gain: "+40%" },
                        { text: "Write cold emails for Lumia beta launch", gain: "+35%" },
                        { text: "Code review: NextJS auth flow", gain: "+52%" },
                        { text: "Competitive analysis for B2B SaaS positioning", gain: "+44%" },
                      ].map((row, i, arr) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderBottom: i < arr.length - 1 ? "0.5px solid var(--border-2)" : "none" }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", fontFamily: "DM Sans, sans-serif", margin: 0 }}>{row.text}</p>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#22C55E", fontFamily: "DM Sans, sans-serif", background: "#F0FDF4", padding: "3px 10px", borderRadius: 999, flexShrink: 0 }}>{row.gain}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {activeTab === "Vault" && (
                  <motion.div key="vault" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                    <div style={{ padding: 24 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--violet)", marginBottom: 4, fontFamily: "DM Sans, sans-serif" }}>VAULT</p>
                      <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 22, color: "var(--text)", marginBottom: 4, letterSpacing: "-0.5px" }}>Your knowledge base</h3>
                      <p style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif", margin: "0 0 16px" }}>All your documents, notes and context — one place.</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg)", border: "0.5px solid var(--border)", borderRadius: 10, padding: "9px 14px", marginBottom: 20 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        <span style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif" }}>Search your Vault…</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "DM Sans, sans-serif" }}>Documents</span>
                        <span style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif" }}>24 items</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {[
                          { title: "Target Lumia", badge: "PDF", badgeColor: "#567EFC", tag: "Document", date: "3 April 2026" },
                          { title: "Lumia targetuser", badge: "FILE", badgeColor: "#FF7769", tag: "Document", date: "2 April 2026" },
                          { title: "Strategy GenZVirale", badge: "FILE", badgeColor: "#567EFC", tag: "Document", date: "2 April 2026" },
                          { title: "Lumia concurrence", badge: "FILE", badgeColor: "#FF7769", tag: "Document", date: "2 April 2026" },
                        ].map((doc, i) => (
                          <div key={i} style={{ background: "#fff", border: "0.5px solid var(--border)", borderRadius: 14, padding: "14px", cursor: "default", transition: "box-shadow 0.2s" }}
                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card)"}
                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "none"}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--violet-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--violet)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                              </div>
                              <span style={{ fontSize: 10, fontWeight: 700, color: doc.badgeColor, background: doc.badgeColor + "18", padding: "2px 7px", borderRadius: 4, fontFamily: "DM Sans, sans-serif" }}>{doc.badge}</span>
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", fontFamily: "DM Sans, sans-serif", margin: "0 0 8px" }}>{doc.title}</p>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--violet)", background: "var(--violet-soft)", padding: "2px 8px", borderRadius: 4, fontFamily: "DM Sans, sans-serif" }}>{doc.tag}</span>
                              <span style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif" }}>{doc.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--text)", color: "#fff", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, fontFamily: "DM Sans, sans-serif", cursor: "pointer" }}>
                          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add to Vault
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeTab === "Templates" && (
                  <motion.div key="templates" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                    <div style={{ padding: 24 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 4, fontFamily: "DM Sans, sans-serif" }}>TEMPLATES</p>
                      <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 22, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.5px" }}>Saved prompts</h3>
                      <p style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif", margin: "0 0 18px" }}>Reuse your best-performing prompt structures instantly.</p>
                      {[
                        { label: "Cold email sequence", tag: "Sales", uses: "12x" },
                        { label: "Weekly content calendar", tag: "Marketing", uses: "8x" },
                        { label: "Feature spec write-up", tag: "Product", uses: "5x" },
                        { label: "Investor update draft", tag: "Founders", uses: "3x" },
                      ].map((tpl, i, arr) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < arr.length - 1 ? "0.5px solid var(--border-2)" : "none" }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--violet-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--violet)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", fontFamily: "DM Sans, sans-serif", margin: 0 }}>{tpl.label}</p>
                            <span style={{ fontSize: 11, color: "var(--violet)", fontFamily: "DM Sans, sans-serif" }}>{tpl.tag}</span>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif", background: "var(--bg)", padding: "3px 9px", borderRadius: 999 }}>Used {tpl.uses}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  // Single shared frame drives both FakeChatInterface and LumiaAnimation in lockstep
  const frame = useCurrentFrame(30, 720);

  useEffect(() => {
    // Cycle every 8s to loosely match the 24s animation loop
    const interval = setInterval(() => setActiveStep(s => (s + 1) % 3), 8000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { num: "01", title: "Fire a raw thought", desc: "No structure. No context setup. No prompt engineering. One sentence — or one sentence spoken out loud.", tag: "🎙 Voice or text · No format required" },
    { num: "02", title: "Your Vault closes the context gap", desc: "Lumia reads your stored docs, decisions, and tone — then selects only what's relevant. No context dumping. No signal buried in noise.", tag: "📦 Vault injection · Precision retrieval" },
    { num: "03", title: "The prompt builds itself", desc: "Lumia reverse-engineers your intention into a structured, context-loaded prompt. You see exactly what went in. Then: ⌘V. Done.", tag: "✓ Prompt copied — ⌘V to paste" },
  ];

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="how" style={{ padding: "96px clamp(20px, 5vw, 80px)", background: "linear-gradient(160deg, #F8F6FF 0%, #EDE9FE 50%, #F0EEF8 100%)", position: "relative", overflow: "hidden" }}>
      {/* Glow */}
      <div style={{ position: "absolute", top: "20%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(86,126,252,0.08) 0%, transparent 70%)", pointerEvents: "none", animation: "glow-pulse 8s infinite" }} />

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <p className="reveal" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--violet)", marginBottom: 12, fontFamily: "DM Sans, sans-serif" }}>Zero prompt engineering</p>
          <h2 className="reveal" style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(30px, 4.5vw, 50px)", letterSpacing: "-1.5px", color: "var(--text)", marginBottom: 16, lineHeight: 1.1 }}>Drop the intent. Get the prompt.<br />Skip everything in between.</h2>
          <p className="reveal" style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.7, maxWidth: 440, fontFamily: "DM Sans, sans-serif" }}>Raw intention in. Structured prompt out. Your Vault handles the context gap — automatically, on every AI you already use.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: 64, alignItems: "center" }}>
          {/* Steps */}
          <div style={{ position: "relative" }}>
            {/* Connecting line */}
            <div style={{ position: "absolute", left: 19, top: 28, bottom: 28, width: "0.5px", background: "linear-gradient(to bottom, var(--violet), transparent)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {steps.map((step, i) => (
                <div key={step.num} className="reveal" style={{ display: "flex", gap: 20, padding: "20px 0", transitionDelay: `${i * 0.1}s`, cursor: "pointer" }} onClick={() => setActiveStep(i)}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: activeStep === i ? "var(--gradient)" : "#fff", border: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 13, color: activeStep === i ? "#fff" : "var(--text-3)", flexShrink: 0, boxShadow: activeStep === i ? "0 4px 16px rgba(86,126,252,0.3)" : "none", transition: "all 0.3s ease", zIndex: 1, position: "relative" }}>
                    {step.num}
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 17, color: activeStep === i ? "var(--violet)" : "var(--text)", marginBottom: 6, transition: "color 0.3s" }}>{step.title}</h3>
                    <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 10, fontFamily: "DM Sans, sans-serif" }}>{step.desc}</p>
                    <span style={{ display: "inline-block", fontSize: 12, fontWeight: 600, background: activeStep === i ? "var(--violet-soft)" : "rgba(0,0,0,0.05)", color: activeStep === i ? "var(--violet)" : "var(--text-3)", padding: "4px 10px", borderRadius: 999, transition: "all 0.3s" }}>{step.tag}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Step dots */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24, paddingLeft: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} onClick={() => setActiveStep(i)} style={{ height: 6, borderRadius: 999, background: activeStep === i ? "var(--gradient)" : "var(--border)", width: activeStep === i ? 28 : 6, transition: "all 0.3s ease", cursor: "pointer" }} />
              ))}
            </div>
          </div>

          {/* Animation — chat interface sits behind Lumia overlay */}
          <div className="reveal" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 460, position: "relative" }}>
              {/* Layer 0 — Claude interface: desktop shifts up+right; mobile stays in flow */}
              <div className="claude-chat-layer">
                <FakeChatInterface frame={frame} />
              </div>
              {/* Layer 1 — Lumia overlay (sets container height via paddingBottom, transparent bg) */}
              <div style={{ position: "relative", zIndex: 1 }}>
                <LumiaAnimation frame={frame} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Comparison Section ───────────────────────────────────────────────────────
function ComparisonSection() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const tableData = [

    {
      feature: "Works on top of any AI",
      memory: { type: "cross", text: "API only" },
      screen: { type: "cross", text: "" },
      overlay: { type: "cross", text: "Locked to one LLM" },
      lumia: { type: "check", text: "Claude, GPT, Gemini..." }
    },
    {
      feature: "Persistent vault (docs, tone, decisions)",
      memory: { type: "warning", text: "Dev setup required" },
      screen: { type: "warning", text: "Passive only" },
      overlay: { type: "cross", text: "" },
      lumia: { type: "check", text: "No setup" }
    },
    {
      feature: "Injects into existing AI UIs",
      memory: { type: "cross", text: "" },
      screen: { type: "cross", text: "" },
      overlay: { type: "cross", text: "" },
      lumia: { type: "check", text: "Full integration", highlight: true }
    },
    {
      feature: "Zero developer setup",
      memory: { type: "cross", text: "" },
      screen: { type: "check", text: "Passive", muted: true },
      overlay: { type: "check", text: "" },
      lumia: { type: "check", text: "Instant" }
    },
    {
      feature: "Model-agnostic",
      memory: { type: "check", text: "" },
      screen: { type: "na", text: "N/A" },
      overlay: { type: "cross", text: "" },
      lumia: { type: "check", text: "Any LLM" }
    },
    {
      feature: "Reverse prompt engineering",
      memory: { type: "cross", text: "" },
      screen: { type: "cross", text: "" },
      overlay: { type: "cross", text: "" },
      lumia: { type: "check", text: "Automated" }
    }
  ];

  const mobileData = [

    { feature: "Works on top of any AI", competitor: { icon: "cross", text: "" }, lumia: { icon: "check", text: "Claude, GPT, Gemini\u2026" } },
    { feature: "Persistent vault (docs, tone, decisions)", competitor: { icon: "warning", text: "Dev setup or passive only" }, lumia: { icon: "check", text: "No setup" } },
    { feature: "Injects into existing AI UIs", competitor: { icon: "cross", text: "" }, lumia: { icon: "check", text: "" } },
    { feature: "Zero developer setup", competitor: { icon: "warning", text: "Partial" }, lumia: { icon: "check", text: "" } },
    { feature: "Model-agnostic", competitor: { icon: "cross", text: "" }, lumia: { icon: "check", text: "" } },
    { feature: "Reverse prompt engineering", competitor: { icon: "cross", text: "" }, lumia: { icon: "check", text: "Automated" } },
  ];

  const renderIcon = (type: string, isLumia: boolean, size = 16) => {
    switch (type) {
      case "check": return <CheckCircle2 size={size} color={isLumia ? "#567EFC" : "#22C55E"} />;
      case "cross": return <XCircle size={size} color="#EF4444" style={{ opacity: 0.4 }} />;
      case "warning": return <AlertCircle size={size} color="#FBBF24" />;
      default: return null;
    }
  };

  return (
    <section id="compare" style={{ padding: "100px clamp(20px, 5vw, 64px)", background: "#0D0B18", position: "relative", overflow: "hidden" }}>
      {/* Dynamic background glow */}
      <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 1200, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(86,126,252,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64, maxWidth: 800 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(86,126,252,0.1)", border: "0.5px solid rgba(86,126,252,0.2)", padding: "4px 12px", borderRadius: 999, marginBottom: 16 }}>
            <Sparkles size={12} color="#567EFC" />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#567EFC", fontFamily: "DM Sans, sans-serif" }}>Competitive Edge</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(32px, 4.5vw, 48px)", letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.1, marginBottom: 20 }}>Built different. Not just better.</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.6 }}>
            Every tool solves one piece. Lumia is the only layer that connects them all — sitting directly on top of the AI you already use.
          </p>
        </div>

        {/* ─── DESKTOP VIEW (≥768px) ─── */}
        <div className="reveal comp-desktop-wrapper" style={{ 
          width: "100%", 
          maxWidth: 960, 
          marginInline: "auto",
          background: "rgba(255,255,255,0.02)", 
          borderRadius: 20, 
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 40px 100px -20px rgba(0,0,0,0.8)",
          overflow: "hidden"
        }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={{ padding: "12px 10px", paddingLeft: 24, textAlign: "left", color: "rgba(255,255,255,0.4)", fontWeight: 500, fontSize: "0.875rem", borderBottom: "1px solid rgba(255,255,255,0.05)", width: "28%" }}>Capability</th>
                {["Memory Tools", "Screen Recorders", "Overlay Tools"].map((label, idx) => (
                  <th key={idx} style={{ padding: "12px 10px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", width: "16%" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "rgba(255,255,255,0.9)" }}>{label}</div>
                    <div style={{ fontWeight: 400, fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{idx === 0 ? "Mem0, ContextMD" : idx === 1 ? "Recall, Rewind" : "Sentient, Phantom"}</div>
                  </th>
                ))}
                <th style={{ padding: "12px 10px", textAlign: "center", width: "24%", position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(86,126,252,0.05)", zIndex: -1 }} />
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#567EFC" }} />
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#567EFC", color: "#fff", padding: "2px 8px", borderRadius: 999, fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>
                      <Sparkles size={8} fill="#fff" /> You are here
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>Lumia</div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i} className="hover-row">
                  <td style={{ padding: "10px 10px", paddingLeft: 24, fontSize: "0.875rem", fontWeight: 500, color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {row.feature}
                  </td>
                  {[row.memory, row.screen, row.overlay].map((cell, cIdx) => (
                    <td key={cIdx} style={{ padding: "10px 10px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        {renderIcon(cell.type, false, 16)}
                        {cell.text && <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.4)" }}>{cell.text}</span>}
                      </div>
                    </td>
                  ))}
                  <td style={{ padding: "10px 10px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(86,126,252,0.03)", zIndex: -1 }} />
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      {renderIcon(row.lumia.type, true, 16)}
                      {row.lumia.text && <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#fff" }}>{row.lumia.text}</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ─── MOBILE VIEW (<768px) ─── */}
        <div className="reveal comp-mobile-wrapper" style={{ width: "100%", paddingInline: 12 }}>
          {mobileData.map((item, idx) => (
            <div key={idx} style={{ 
              background: "rgba(255,255,255,0.02)", 
              borderRadius: 20, 
              border: "1px solid rgba(255,255,255,0.05)",
              overflow: "hidden",
              backdropFilter: "blur(10px)",
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)"
            }}>
              {/* Feature Title */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ 
                  fontSize: 14, 
                  fontWeight: 700, 
                  color: "#fff", 
                  fontFamily: "var(--font-bricolage), sans-serif",
                  letterSpacing: "-0.01em"
                }}>
                  {item.feature}
                </span>
              </div>

              {/* Comparison Split */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                {/* Competitor */}
                <div style={{ 
                  padding: "20px 16px", 
                  background: "rgba(0,0,0,0.2)", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  gap: 8,
                  borderRight: "1px solid rgba(255,255,255,0.05)"
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em", marginBottom: 2 }}>Other Tools</div>
                  {renderIcon(item.competitor.icon, false, 20)}
                  {item.competitor.text && (
                    <span style={{ 
                      fontSize: 11, 
                      color: item.competitor.icon === "warning" ? "#FBBF24" : "rgba(255,255,255,0.4)", 
                      textAlign: "center",
                      lineHeight: 1.3,
                      fontWeight: 500
                    }}>
                      {item.competitor.text}
                    </span>
                  )}
                </div>

                {/* Lumia */}
                <div style={{ 
                  padding: "20px 16px", 
                  background: "rgba(86,126,252,0.12)", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  gap: 8,
                  position: "relative"
                }}>
                  {/* Subtle Inner Glow */}
                  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, rgba(86,126,252,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
                  
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#8BA8FD", letterSpacing: "0.05em", marginBottom: 2, display: "flex", alignItems: "center", gap: 3 }}>
                    Lumia <Sparkles size={8} fill="#8BA8FD" />
                  </div>
                  {renderIcon(item.lumia.icon, true, 20)}
                  {item.lumia.text && (
                    <span style={{ 
                      fontSize: 12, 
                      fontWeight: 700, 
                      color: "#fff", 
                      textAlign: "center",
                      lineHeight: 1.3
                    }}>
                      {item.lumia.text}
                    </span>
                  )}
                  {!item.lumia.text && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Unlimited</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .comp-desktop-wrapper { display: block; }
          .comp-mobile-wrapper { display: none; }
          .hover-row:hover { background: rgba(255,255,255,0.03); }
          
          @media (max-width: 767px) {
            .comp-desktop-wrapper { display: none; }
            .comp-mobile-wrapper { display: flex; flex-direction: column; gap: 16px; }
          }
        `}} />

        {/* Bottom CTA */}
        <div className="reveal" style={{ textAlign: "center", marginTop: 80, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, #567EFC, transparent)", marginBottom: 32 }} />
          <h3 style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 12, fontFamily: "var(--font-bricolage), sans-serif", letterSpacing: "-0.02em" }}>The only tool that does all of it.</h3>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 40, maxWidth: 400, lineHeight: 1.6 }}>And it sits seamlessly on top of the workflow you&apos;ve already built.</p>
          <button onClick={() => scrollTo("pricing")} style={{ 
            background: "var(--gradient)", 
            color: "#fff", 
            border: "none", 
            borderRadius: 999, 
            padding: "16px 40px", 
            fontSize: 16, 
            fontWeight: 700, 
            cursor: "pointer", 
            boxShadow: "0 10px 30px -5px rgba(86,126,252,0.4)",
            transition: "transform 0.2s, box-shadow 0.2s",
            fontFamily: "DM Sans, sans-serif"
          }} 
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 15px 40px -5px rgba(86,126,252,0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 30px -5px rgba(86,126,252,0.4)";
          }}>
            Get early access {"\u2192"}
          </button>
        </div>
      </div>
    </section>
  );
}




// ─── Friction Calculator ──────────────────────────────────────────────────────
const QUALITY_CONFIG: Record<QualityKey, { frictionMin: number }> = {
  short:  { frictionMin: 4 },
  mid:    { frictionMin: 5 },
  struct: { frictionMin: 6 },
};

function fmtTime(totalMins: number): string {
  const h = Math.floor(totalMins / 60);
  const m = Math.round(totalMins % 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function useCountUp(target: number, duration = 400) {
  const [value, setValue] = useState(target);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef({ from: target, to: target, startTime: 0 });

  useEffect(() => {
    const from = value;
    const to = target;
    startRef.current = { from, to, startTime: performance.now() };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const tick = (now: number) => {
      const progress = Math.min((now - startRef.current.startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(startRef.current.from + (startRef.current.to - startRef.current.from) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

function FrictionCalculator() {
  const [mode, setMode] = useState<"time" | "money">("time");
  const [quality, setQuality] = useState<QualityKey>("mid");
  const [prompts, setPrompts] = useState(50);
  const [hourlyRate, setHourlyRate] = useState(75);

  const cfg = QUALITY_CONFIG[quality];
  const minsPerDay = prompts * cfg.frictionMin;
  const minsPerMonth = minsPerDay * 22;
  const hoursPerYear = (minsPerDay * 365) / 60;
  const daysLostYear = Math.round(hoursPerYear / 8);

  const moneyPerMonth = Math.round((minsPerMonth / 60) * hourlyRate);
  const moneyPerYear = Math.round(hoursPerYear * hourlyRate);
  const roiMultiple = Math.round(moneyPerMonth / 39);

  const animMinsDay = useCountUp(minsPerDay);
  const animMinsMonth = useCountUp(minsPerMonth);
  const animMoneyMonth = useCountUp(moneyPerMonth);
  const animMoneyYear = useCountUp(moneyPerYear);
  const animRoi = useCountUp(roiMultiple);
  const animHoursYear = useCountUp(hoursPerYear);

  const qualityWarnings: Record<QualityKey, string> = {
    short:  "Short prompts = overly generic responses. You reprompt 2–3× before getting something usable. Lumia injects the missing context automatically.",
    mid:    "Partial context = the AI has to guess. Result: approximate answers, 1–2 systematic reprompts. Lumia fills the missing context on every prompt.",
    struct: "You know how to structure — but you rewrite the context every session. That's where you lose the most time. Lumia injects it automatically: zero rewriting.",
  };

  const qualityLabels: Record<QualityKey, { title: string; sub: string }> = {
    short:  { title: "Short and direct", sub: "~4 min per usable response" },
    mid:    { title: "Medium, sometimes vague", sub: "~5 min per usable response" },
    struct: { title: "Structured with context", sub: "~6 min per usable response" },
  };

  const insightText = mode === "money"
    ? `At $${hourlyRate}/h, friction costs you $${moneyPerMonth}/month. Lumia Pro costs $39. ROI: ${roiMultiple}×.`
    : `${prompts} prompts/day × ${cfg.frictionMin} min = ${fmtTime(minsPerDay)} lost daily. Over a year: ${daysLostYear} full work days.`;

  return (
    <section style={{ padding: "96px clamp(20px, 5vw, 80px)", background: "#fff" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p className="reveal" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", background: "var(--gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 12, fontFamily: "DM Sans, sans-serif" }}>Calculator</p>
          <h2 className="reveal" style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4.5vw, 46px)", letterSpacing: "-1.5px", color: "var(--text)", marginBottom: 12, lineHeight: 1.1 }}>How much are you losing each week?</h2>
          <p className="reveal" style={{ fontSize: 16, color: "var(--text-2)", fontFamily: "DM Sans, sans-serif" }}>Slide to see your real-time friction cost.</p>
        </div>

        <div className="reveal" style={{ background: "#F8F7FF", borderRadius: 24, padding: "clamp(24px, 4vw, 40px)", boxShadow: "var(--shadow-card)" }}>
          {/* Mode Toggle */}
          <div style={{ display: "flex", background: "#F3F4F6", borderRadius: 999, padding: 4, marginBottom: 32, width: "fit-content" }}>
            {[["time", "Time lost"], ["money", "Money value"]].map(([m, label]) => (
              <button key={m} onClick={() => setMode(m as "time" | "money")}
                style={{ padding: "8px 20px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "DM Sans, sans-serif", background: mode === m ? "#fff" : "transparent", color: mode === m ? "var(--text)" : "var(--text-3)", boxShadow: mode === m ? "0 1px 6px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}>
                {label}
              </button>
            ))}
          </div>

          {/* Two-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: 40 }}>
            {/* Left: Controls */}
            <div>
              {/* Quality Selector */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 12, fontFamily: "DM Sans, sans-serif" }}>How do you usually send your prompts?</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(Object.keys(qualityLabels) as QualityKey[]).map(key => (
                    <button key={key} onClick={() => setQuality(key)}
                      style={{ padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${quality === key ? "var(--violet)" : "var(--border)"}`, background: quality === key ? "var(--violet-soft)" : "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: quality === key ? "var(--violet)" : "var(--text)", fontFamily: "DM Sans, sans-serif" }}>{qualityLabels[key].title}</span>
                      <span style={{ fontSize: 11, color: quality === key ? "var(--violet)" : "var(--text-3)", fontFamily: "DM Sans, sans-serif", textAlign: "right", maxWidth: 180, lineHeight: 1.3 }}>{qualityLabels[key].sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div style={{ background: "var(--violet-soft)", borderRadius: 12, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, fontFamily: "DM Sans, sans-serif" }}>
                {qualityWarnings[quality]}
              </div>

              {/* Slider: prompts/day */}
              <div style={{ marginBottom: mode === "money" ? 24 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", fontFamily: "DM Sans, sans-serif" }}>Prompts per day</label>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--violet)", fontFamily: "var(--font-bricolage), sans-serif" }}>{prompts}/day</span>
                </div>
                <input type="range" min={5} max={150} step={5} value={prompts} onChange={e => setPrompts(+e.target.value)}
                  style={{ width: "100%", accentColor: "var(--violet)", cursor: "pointer" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif", marginTop: 4 }}>
                  <span>5</span><span>150</span>
                </div>
              </div>

              {/* Hourly rate (money mode) */}
              {mode === "money" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", fontFamily: "DM Sans, sans-serif" }}>Your hourly rate</label>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--violet)", fontFamily: "var(--font-bricolage), sans-serif" }}>${hourlyRate}/h</span>
                  </div>
                  <input type="range" min={25} max={400} step={25} value={hourlyRate} onChange={e => setHourlyRate(+e.target.value)}
                    style={{ width: "100%", accentColor: "var(--violet)", cursor: "pointer" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif", marginTop: 4 }}>
                    <span>$25</span><span>$400</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Results */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Lost/day */}
                <div style={{ background: "var(--bg)", borderRadius: 14, padding: "20px 16px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text)", letterSpacing: "-0.5px" }}>
                    {mode === "time" ? fmtTime(animMinsDay) : `$${Math.round(animMinsDay / 60 * hourlyRate)}`}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif", marginTop: 4 }}>Lost/day</div>
                </div>
                {/* Lost/month */}
                <div style={{ background: "var(--bg)", borderRadius: 14, padding: "20px 16px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text)", letterSpacing: "-0.5px" }}>
                    {mode === "time" ? fmtTime(animMinsMonth) : `$${Math.round(animMoneyMonth)}`}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif", marginTop: 4 }}>Lost/month</div>
                </div>
                {/* Saved/year */}
                <div style={{ background: "var(--bg)", borderRadius: 14, padding: "20px 16px", textAlign: "center", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, borderRadius: 14, background: "var(--gradient)", opacity: 0.08 }} />
                  <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 26, background: "var(--gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.5px" }}>
                    {mode === "time" ? fmtTime(animHoursYear * 60) : `$${Math.round(animMoneyYear).toLocaleString()}`}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text)", fontWeight: 700, fontFamily: "DM Sans, sans-serif", marginTop: 4 }}>Saved with Lumia</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif" }}>per year</div>
                </div>
                {/* Work days / ROI */}
                {mode === "money" ? (
                  <div style={{ background: "var(--bg)", borderRadius: 14, padding: "20px 16px", textAlign: "center", position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, borderRadius: 14, background: "var(--gradient)", opacity: 0.08 }} />
                    <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 26, background: "var(--gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.5px" }}>
                      {Math.round(animRoi)}×
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text)", fontWeight: 700, fontFamily: "DM Sans, sans-serif", marginTop: 4 }}>Lumia ROI</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif" }}>at $39/month</div>
                  </div>
                ) : (
                  <div style={{ background: "var(--bg)", borderRadius: 14, padding: "20px 16px", textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text)", letterSpacing: "-0.5px" }}>
                      {daysLostYear}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif", marginTop: 4 }}>Work days</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif" }}>lost per year</div>
                  </div>
                )}
              </div>

              {/* Insight */}
              <div style={{ background: "var(--violet-soft)", borderRadius: 14, padding: "14px 18px", fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, fontFamily: "DM Sans, sans-serif" }}>
                💡 {insightText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Founder Section ──────────────────────────────────────────────────────────
function FounderSection() {
  return (
    <section style={{
      padding: "96px clamp(20px, 5vw, 80px)",
      background: "#0D0B18",
    }}>
      <style>{`
        .founder-link {
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          font-size: 0.875rem;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s ease;
        }
        .founder-link:hover { color: #567EFC; }
        @media (max-width: 640px) {
          .founder-layout { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .founder-photo-wrap { margin-bottom: 28px !important; margin-right: 0 !important; }
        }
      `}</style>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div className="founder-layout" style={{ display: "flex", alignItems: "flex-start", gap: 36 }}>

          {/* Photo */}
          <div className="founder-photo-wrap" style={{ flexShrink: 0 }}>
            <img
              src="/founder.jpg"
              alt="Rosly, founder of Lumia"
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid rgba(86,126,252,0.30)",
                display: "block",
              }}
            />
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Eyebrow */}
            <p style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.30)",
              marginBottom: 10,
              fontFamily: "DM Sans, sans-serif",
            }}>The Founder</p>

            {/* Name line */}
            <p style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "rgba(255,255,255,0.92)",
              marginBottom: 20,
              fontFamily: "var(--font-bricolage), sans-serif",
              letterSpacing: "-0.3px",
            }}>Rosly, 19 — Industrial Engineering student at Polytechnique Montréal.</p>

            {/* Origin story */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.7, color: "rgba(255,255,255,0.45)", margin: 0, fontFamily: "DM Sans, sans-serif" }}>
                I built Lumia because I kept breaking my own workflow trying to fix it. I connected NotebookLM to Gemini — too much context, the model choked. I tried a vector database on Supabase with Telegram bots — it worked, but I lost Claude&apos;s canvas, ChatGPT&apos;s artifacts, every native UI feature I actually rely on.
              </p>
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.7, color: "rgba(255,255,255,0.45)", margin: 0, fontFamily: "DM Sans, sans-serif" }}>
                Every fix forced a tradeoff. So I stopped replacing tools and built a layer on top instead.
              </p>
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.7, color: "rgba(255,255,255,0.45)", margin: 0, fontFamily: "DM Sans, sans-serif" }}>
                I send 50+ prompts a day. I don&apos;t want to learn prompt engineering — I want quality, fast. Lumia is what I built for myself first.
              </p>
            </div>

            {/* Closing line */}
            <p style={{
              fontSize: "0.875rem",
              color: "#567EFC",
              fontStyle: "italic",
              marginTop: 20,
              marginBottom: 20,
              fontFamily: "DM Sans, sans-serif",
            }}>Built in Montréal. Vibe-coded into existence.</p>

            {/* Social links */}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <a href="https://x.com/_r0sly_" target="_blank" rel="noopener noreferrer" className="founder-link">
                → Twitter / X
              </a>
              <a href="https://www.linkedin.com/in/maurel-rosly-mvondo-10862a324/" target="_blank" rel="noopener noreferrer" className="founder-link">
                → LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing Section ──────────────────────────────────────────────────────────
function PricingSection() {
  const founderExtras = [
    "20 pre-built optimized prompt templates — exclusive to founders",
    "Feature vote — your top 3 picks ship first",
    "Direct email access to the founder",
  ];

  return (
    <section id="pricing" style={{ padding: "96px clamp(20px, 5vw, 80px)", background: "var(--bg)", borderTop: "0.5px solid var(--border)" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p className="reveal" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--violet)", marginBottom: 12, fontFamily: "DM Sans, sans-serif" }}>Founding access</p>
          <h2 className="reveal" style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(30px, 5vw, 52px)", letterSpacing: "-1.5px", color: "var(--text)", marginBottom: 8, lineHeight: 1.1 }}>Lock in before it&apos;s gone.</h2>
          <p className="reveal" style={{ fontSize: 16, color: "var(--text-2)", fontFamily: "DM Sans, sans-serif" }}>One-time payment. Locked forever.</p>
        </div>

        {/* Timeline block */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--text-2)", fontFamily: "DM Sans, sans-serif", marginBottom: 6 }}>
            Private beta: Q3 2026{" "}
            <span style={{ color: "var(--text-3)" }}>·</span>
            {" "}Public launch: Q4 2026
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-3)", fontFamily: "DM Sans, sans-serif", margin: 0 }}>
            Follow live updates →{" "}
            <a href="https://x.com/_r0sly_" target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--text-3)", textDecoration: "underline" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#567EFC")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}>
              x.com/_r0sly_
            </a>
          </p>
        </div>

        {/* Side-by-side cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: 20, alignItems: "start" }}>

          {/* Paid card — dark */}
          <div className="reveal" style={{ background: "#0F0A1E", borderRadius: 22, padding: "clamp(28px, 4vw, 40px)", textAlign: "left", color: "#fff" }}>
            <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#A78BFA", marginBottom: 16, fontFamily: "DM Sans, sans-serif" }}>⚡ Founding member</div>
            <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 22, color: "#fff", marginBottom: 12 }}>Lumia — Life access</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 56, color: "#fff", letterSpacing: "-2px", lineHeight: 1 }}>$99</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "DM Sans, sans-serif" }}>once</span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "#F59E0B", fontWeight: 500, fontFamily: "DM Sans, sans-serif", marginBottom: 20 }}>
              Price increases at public launch.
            </p>
            <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)", paddingTop: 14, marginBottom: 16 }}>
              <p style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#A78BFA", fontFamily: "DM Sans, sans-serif", marginBottom: 12 }}>Founder-only extras</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {founderExtras.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "linear-gradient(135deg, #567EFC, #EB5E5E)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontFamily: "DM Sans, sans-serif" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderLeft: "2px solid #567EFC", background: "rgba(86,126,252,0.05)", borderRadius: "0 var(--radius-sm, 6px) var(--radius-sm, 6px) 0", padding: "8px 12px", marginBottom: 12 }}>
              <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.55)", fontFamily: "DM Sans, sans-serif", margin: 0, lineHeight: 1.5 }}>
                We personally onboard every founding member — reviewing your Vault setup and prompt templates with you in a 1:1 session.
              </p>
            </div>
            <div style={{ borderLeft: "2px solid #22C55E", background: "rgba(34,197,94,0.08)", borderRadius: "0 var(--radius-sm, 6px) var(--radius-sm, 6px) 0", padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 8 }}>
              <ShieldCheck size={16} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.55)", fontFamily: "DM Sans, sans-serif", margin: 0, lineHeight: 1.5 }}>
                If Lumia doesn&apos;t ship by Q4 2026, we refund your founding fee in full.{" "}
                <span style={{ fontWeight: 600, color: "#22C55E" }}>No questions asked.</span>
              </p>
            </div>
            <PricingPaidForm />
          </div>

          {/* Free waitlist card — light */}
          <div className="reveal" style={{ background: "#fff", border: "0.5px solid var(--border)", borderRadius: 22, padding: "clamp(28px, 4vw, 40px)", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", fontFamily: "DM Sans, sans-serif" }}>Free option</span>
              <span style={{ fontSize: 11, fontWeight: 700, background: "var(--violet-soft)", color: "var(--violet)", borderRadius: 999, padding: "2px 8px", fontFamily: "DM Sans, sans-serif" }}>$0</span>
            </div>
            <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 22, color: "var(--text)", marginBottom: 12 }}>Free waitlist</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 56, color: "var(--text)", letterSpacing: "-2px", lineHeight: 1 }}>$0</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif", marginBottom: 28 }}>
              No payment needed · Access when we open
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {([
                { text: "Access when public beta opens", type: "clock" },
                { text: "Price may increase at launch — not locked", type: "alert" },
              ] as { text: string; type: "clock" | "alert" }[]).map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {item.type === "clock" ? (
                    <Clock size={18} color="var(--text-3)" style={{ flexShrink: 0 }} />
                  ) : (
                    <AlertTriangle size={18} color="#F59E0B" style={{ flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: 14, color: item.type === "alert" ? "#92400E" : "var(--text-3)", fontFamily: "DM Sans, sans-serif" }}>{item.text}</span>
                </div>
              ))}
            </div>
            <WaitlistForm variant="pricing" />
          </div>

        </div>
        <p style={{ fontSize: "0.875rem", color: "var(--text-3)", textAlign: "center", marginTop: 24, fontFamily: "DM Sans, sans-serif" }}>
          Free users get access — founders shape what ships next.
        </p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: "0.5px solid var(--border)", padding: "28px clamp(20px, 5vw, 64px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, background: "#fff" }}>
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <img src="/logo.png" alt="Lumia" style={{ width: 24, height: 24, objectFit: "contain" }} />
        <span style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>Lumia</span>
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif" }}>Building in public</span>
        <a href="https://x.com/_r0sly_" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--violet)", fontWeight: 600, textDecoration: "none", fontFamily: "DM Sans, sans-serif" }}>@_r0sly_ on X ↗</a>
        <span style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif" }}>© 2026 Lumia</span>
        <span style={{ fontSize: "0.75rem", color: "var(--text-3)", fontFamily: "DM Sans, sans-serif" }}>
          Questions about your purchase?{" "}
          <a href="mailto:hello@getlumia.ca" style={{ color: "var(--text-3)", textDecoration: "underline" }}>hello@getlumia.ca</a>
        </span>
      </div>
    </footer>
  );
}

// ─── Works On Top Of Section ──────────────────────────────────────────────────
function WorksOnTopOfSection() {
  return (
    <section style={{ borderTop: "0.5px solid var(--border)", borderBottom: "0.5px solid var(--border)", background: "#fff", padding: "40px 0" }}>
      <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-3)", marginBottom: 14, fontFamily: "DM Sans, sans-serif", textAlign: "center" }}>Works on top of</p>
      <div style={{ overflow: "hidden" }} className="marquee-mask">
        <div className="ai-marquee" style={{ display: "flex", alignItems: "center", width: "max-content" }}>
          {[0, 1, 2, 3, 4, 5].map(copyIdx => (
            <div key={copyIdx} style={{ display: "flex", gap: 48, paddingRight: 48, alignItems: "center" }}>
              {AI_LOGOS.map(({ src, name }, i) => (
                <img key={i} src={src} alt={name} title={name}
                  style={{ width: 40, height: 40, objectFit: "contain", flexShrink: 0, opacity: 0.75, filter: "grayscale(20%)", transition: "opacity 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "0.75")} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Made For You Section ─────────────────────────────────────────────────────
const PERSONAS = [
  {
    label: "Solo Entrepreneurs",
    emoji: "🚀",
    title: "Lumia for Solo Entrepreneurs",
    desc: "You open ChatGPT for copy, Perplexity for research, Claude for strategy — and re-explain your whole business every single time. Lumia injects your brand positioning, pricing structure, and founder voice into every session, on every AI, the instant you hit the shortcut. One vault. Every tool. Zero re-intro.",
  },
  {
    label: "Content Creators",
    emoji: "✍️",
    title: "Lumia for Content Creators",
    desc: "You brief Claude on your YouTube persona, then switch to ChatGPT for the newsletter hook, then Perplexity for the research angle — and rebuild context three times. Lumia carries your content pillars, audience persona, and posting cadence across every session. Type the topic. Get the output. Already in your voice.",
  },
  {
    label: "Freelancers",
    emoji: "💼",
    title: "Lumia for Freelancers",
    desc: "Client A is on Shopify, requires FR/EN copy, hates Oxford commas. Client B is a SaaS, wants punchy B2B tone, Notion-first deliverables. You switch AI tools mid-morning and start over every time. Lumia vaults each client separately — brand guide, stack, constraints, past decisions. Hit the shortcut, load the client, ship.",
  },
  {
    label: "Vibe Coders",
    emoji: "⚡",
    title: "Lumia for Vibe Coders",
    desc: "You describe a feature in Cursor, debug in Claude Code, prototype in Bolt.new — and paste your stack context manually each time. Lumia injects your tech stack, repo structure, and architectural constraints into every Cursor session automatically. Say what you want to build. Skip the setup prompt.",
  },
  {
    label: "E-commerce",
    emoji: "🛒",
    title: "Lumia for E-commerce Operators",
    desc: "New product drop: you need 40 Shopify descriptions, 8 email sequences, and a Meta ad set — all in your brand tone, with your size guide, return policy, and seasonal promo injected. Lumia loads your full catalog context into Claude or ChatGPT instantly. Batch output your entire launch in one session, not eight.",
  },
  {
    label: "Marketers",
    emoji: "📈",
    title: "Lumia for Marketers",
    desc: "You're running 4 brand accounts, each with its own tone guide, target ICP, and creative brief. Every new Claude or ChatGPT session starts blank. Lumia injects the right brand context per project — audience segments, messaging pillars, campaign constraints — before you type your first word. On-brand output, from prompt one.",
  },
  {
    label: "Power Users",
    emoji: "⚙️",
    title: "Lumia for Power Users",
    desc: "Your stack: Claude for deep work, Perplexity for research, Cursor for code, ChatGPT for quick tasks. Every session starts with a fresh context window and ends with you having pasted the same project brief for the 11th time today. Lumia is the persistent layer between all of them. One shortcut. Full context. Everywhere.",
  },
];

function MadeForYouSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIdx(i => (i + 1) % PERSONAS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const active = PERSONAS[activeIdx];

  return (
    <section style={{ background: "#0F0A1E", padding: "96px clamp(20px, 5vw, 80px)", position: "relative", overflow: "hidden" }}>
      {/* Background glows */}
      <div style={{ position: "absolute", top: "10%", left: "5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(86,126,252,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(235,94,94,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: 64, alignItems: "center" }}>
          {/* Left */}
          <div>
            <p className="reveal" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(86,126,252,0.7)", marginBottom: 16, fontFamily: "DM Sans, sans-serif" }}>Who it&apos;s for</p>
            <h2 className="reveal" style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(36px, 5vw, 56px)", color: "#fff", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 40 }}>
              Lumia is made<br /><span style={{ background: "linear-gradient(90deg, #567EFC, #C2AED4, #FF7769)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>for you</span>
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PERSONAS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => { setActiveIdx(i); setIsPaused(true); }}
                  className="btn-spring"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: activeIdx === i ? "1.5px solid rgba(255,255,255,0.6)" : "1px solid rgba(255,255,255,0.15)",
                    background: activeIdx === i ? "rgba(255,255,255,0.1)" : "transparent",
                    color: activeIdx === i ? "#fff" : "rgba(255,255,255,0.4)",
                    fontSize: 13,
                    fontWeight: activeIdx === i ? 600 : 400,
                    fontFamily: "DM Sans, sans-serif",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right — dynamic content */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{ minHeight: 260 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <span style={{ fontSize: 48, display: "block", marginBottom: 20 }}>{active.emoji}</span>
                <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: "clamp(22px, 3vw, 28px)", color: "#fff", letterSpacing: "-0.5px", marginBottom: 16, lineHeight: 1.2 }}>
                  {active.title}
                </h3>
                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, fontFamily: "DM Sans, sans-serif", maxWidth: 460 }}>
                  {active.desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div style={{ display: "flex", gap: 6, marginTop: 32 }}>
              {PERSONAS.map((_, i) => (
                <div
                  key={i}
                  onClick={() => { setActiveIdx(i); setIsPaused(true); }}
                  style={{
                    width: activeIdx === i ? 28 : 6,
                    height: 6,
                    borderRadius: 999,
                    background: activeIdx === i ? "linear-gradient(90deg, #567EFC, #FF7769)" : "rgba(255,255,255,0.15)",
                    cursor: "pointer",
                    transition: "all 0.4s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [isSuccess, setIsSuccess] = useState(false);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal, .pain-reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Success state
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("success=true")) {
      setIsSuccess(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (isSuccess) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{ maxWidth: 420, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
          <div style={{ width: 72, height: 72, background: "#F0FDF4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={36} color="#22C55E" />
          </div>
          <h1 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 32, color: "var(--text)", letterSpacing: "-1px" }}>Welcome, Founding Member!</h1>
          <p style={{ color: "var(--text-2)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.6 }}>Your payment was successful. You are now officially a Founding Member of Lumia. We'll be in touch shortly.</p>
          <button onClick={() => setIsSuccess(false)} style={{ padding: "12px 28px", background: "#0F0A1E", color: "#fff", border: "none", borderRadius: 999, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "var(--font-bricolage), sans-serif" }}>Back to Home</button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      <div style={{ minHeight: "100vh", background: "#fff", overflowX: "hidden" }}>
        <Navbar />
        <HeroSection />
        <HowItWorksSection />
        <ConsultantSection />
        <WorksOnTopOfSection />
        <ComparisonSection />
        <FrictionCalculator />
        <MadeForYouSection />
        <FounderSection />
        <PricingSection />
        <Footer />
      </div>
    </>
  );
}
