"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Tag,
  Clock,
  Layout,
  Crown,
  Timer,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function WaitlistForm({ variant = "hero" }: { variant?: "hero" | "footer" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setErrorMessage("");

    if (variant === "footer") {
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
        setErrorMessage(err.message || "Something went wrong. Please try again.");
      }
      return;
    }

    if (!isSupabaseConfigured) {
      setStatus("error");
      setErrorMessage("Supabase configuration is missing or invalid.");
      return;
    }

    try {
      const { error } = await supabase.from("waitlist").insert([{ email }]);
      if (error) {
        if (error.code === "23505") throw new Error("This email is already registered.");
        throw new Error(error.message || "An error occurred while signing up.");
      }
      setStatus("success");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-emerald-600 font-medium py-3">
        <CheckCircle2 className="w-5 h-5" /><span>You are on the list.</span>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}
        className={`w-full flex flex-col sm:flex-row items-center gap-2 sm:gap-3 p-2 sm:p-1.5 bg-white/80 backdrop-blur-md border border-gray-100 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.12)] ${variant === "hero" ? "rounded-[2rem] sm:rounded-full shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)]" : "rounded-2xl sm:rounded-full bg-gray-50/50"}`}>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email..."
          className="flex-1 bg-transparent border-none outline-none px-5 py-3 text-[#1C1C1E] placeholder:text-[#A1A1A6] font-medium w-full" />
        <button disabled={status === "loading"}
          className={`flex items-center justify-center gap-2 px-8 py-3.5 bg-[#1C1C1E] text-white text-sm font-medium hover:bg-[#333333] hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] transition-all group whitespace-nowrap w-full sm:w-auto shadow-sm shrink-0 disabled:opacity-70 ${variant === "hero" ? "rounded-2xl sm:rounded-full" : "rounded-xl sm:rounded-full"}`}>
          {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> :
            <>{variant === "hero" ? "Join the Private Waitlist" : "Become a Founding Member – $99 lifetime (200 spots only)"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
        </button>
      </form>
      {status === "error" && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-rose-500 text-sm font-medium mt-3 px-4">
          <AlertCircle className="w-4 h-4" /><span>{errorMessage}</span>
        </motion.div>)}
    </div>
  );
}

function Counter({ from = 0, to, duration = 2, decimals = 1, suffix = "", prefix = "" }: { from?: number; to: number; duration?: number; decimals?: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } }, { threshold: 0, rootMargin: "-100px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (inView && ref.current) {
      const durationMs = duration * 1000;
      const startTime = performance.now();
      const update = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = from + (to - from) * eased;
        if (ref.current) ref.current.textContent = prefix + value.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    }
  }, [inView, from, to, duration, decimals, prefix, suffix]);
  return <span ref={ref}>{prefix}{from.toFixed(decimals)}{suffix}</span>;
}

const FEATURE_EXPLAINERS: Record<string, { title: string; text: string; benefit: string }> = {
  "Zero Black-Box": { title: "Grounded Intelligence", text: "View exactly which data points powered this specific response. Trace the logic path and eliminate any form of uncertainty.", benefit: "Total Trust • Surgical Transparency" },
  "Instant Context Access": { title: "Automatic Context Mapping", text: "No more re-uploads. Use '@' to target files or let the engine pull perfect real-time context from your Vault.", benefit: "Time Saved • Uninterrupted Workflow" },
  "Kill 'Doom Asking'": { title: "Persistent Semantic Memory", text: "Never lose a brilliant insight. Save this high-value response to your Vault. It becomes an infinitely reusable semantic asset for future queries.", benefit: "Knowledge Capitalization • Instant Search" },
  "Living Semantic Memory": { title: "Memory Capitalization", text: "Every conversation is automatically stored and evolves your personal knowledge base in real time.", benefit: "AUTO-EVOLVING • KNOWLEDGE BASE" },
  "Instant Context Retrieval": { title: "Zero Friction Search", text: "Lumia pulls the exact documents and insights you need — no manual search, no lost context.", benefit: "SEMANTIC SEARCH • ZERO FRICTION" },
  "One-Click Persistence": { title: "Knowledge Vault", text: "Save any AI output permanently with one tap. It becomes a reusable semantic asset forever.", benefit: "INSTANT SAVE • ASSET CREATION" },
  "Reverse Strategic Prompting": { title: "Instant Clarity", text: "Lumia detects your vague request and instantly turns it into a smart, structured form with the exact questions you need.", benefit: "ZERO PROMPT • INSTANT CLARITY" },
  "Interactive Decision Engine": { title: "Smart Output", text: "Click once. Choose your market, timeline, and direction — Lumia builds the full actionable checklist automatically.", benefit: "ONE-CLICK INPUT • SMART OUTPUT" },
  "Actionable Execution": { title: "Idea → Plan → Vault", text: "Turn any idea into a live, trackable plan in seconds. Save it directly to your Vault with one tap.", benefit: "IDEA → PLAN → VAULT • INSTANT" },
};

function MobileFeatureAccordion({ slideIndex }: { slideIndex: number }) {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const featuresToShow = slideIndex === 0 ? ["Zero Black-Box", "Instant Context Access", "Kill 'Doom Asking'"] : slideIndex === 1 ? ["Reverse Strategic Prompting", "Interactive Decision Engine", "Actionable Execution"] : ["Living Semantic Memory", "Instant Context Retrieval", "One-Click Persistence"];
  const colorMap: Record<string, string> = { "Zero Black-Box": "bg-brand-purple", "Living Semantic Memory": "bg-brand-purple", "Reverse Strategic Prompting": "bg-brand-purple", "Instant Context Access": "bg-brand-blue", "Instant Context Retrieval": "bg-brand-blue", "Interactive Decision Engine": "bg-brand-blue", "Kill 'Doom Asking'": "bg-brand-orange", "One-Click Persistence": "bg-brand-orange", "Actionable Execution": "bg-brand-orange" };
  return (
    <div className="md:hidden mt-8 space-y-3">
      {featuresToShow.map((label) => {
        const explainer = FEATURE_EXPLAINERS[label];
        const isOpen = openIndex === label;
        return (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button onClick={() => setOpenIndex(isOpen ? null : label)} className="w-full flex items-center justify-between p-4 text-left">
              <div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${colorMap[label]} animate-pulse`} /><span className="text-sm font-semibold text-[#1C1C1E]">{label}</span></div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>{isOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <div className="px-4 pb-5 pt-0">
                  <h4 className="text-sm font-bold text-[#1C1C1E] mb-2">{explainer.title}</h4>
                  <p className="text-xs leading-relaxed text-[#6E6E73] font-normal mb-4">{explainer.text}</p>
                  <div className="inline-block px-2.5 py-1 bg-gray-50 rounded-md border border-gray-100"><span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase leading-none">{explainer.benefit}</span></div>
                </div>
              </motion.div>
            )}</AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function FeatureTag({ label, color, className, initial, whileInView, delay }: { label: string; color: string; className: string; initial: any; whileInView: any; delay: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const explainer = FEATURE_EXPLAINERS[label];
  return (
    <motion.div initial={initial} whileInView={whileInView} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className={`${className} ${isHovered ? "z-[100]" : "z-20"}`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="relative group cursor-help">
        <div className="relative z-[70] flex items-center gap-3 px-4 py-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-100/50 transition-all duration-300 group-hover:shadow-xl group-hover:bg-white">
          <div className={`w-2 h-2 rounded-full ${color} animate-pulse`} /><span className="text-xs md:text-sm font-semibold text-[#1C1C1E] whitespace-nowrap">{label}</span>
        </div>
        <AnimatePresence>{isHovered && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-[110] w-80 p-5 bg-white rounded-2xl shadow-2xl border border-gray-100 backdrop-blur-md pointer-events-none">
            <h4 className="text-sm font-bold text-[#1C1C1E] mb-2">{explainer.title}</h4>
            <p className="text-xs leading-relaxed text-[#6E6E73] font-normal mb-4">{explainer.text}</p>
            <div className="inline-block px-2.5 py-1 bg-gray-50 rounded-md border border-gray-100"><span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase leading-none">{explainer.benefit}</span></div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-white" />
          </motion.div>
        )}</AnimatePresence>
      </div>
    </motion.div>
  );
}

function ExperienceSlider({ onSlideChange }: { onSlideChange?: (index: number) => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { image: "/mvp-screenshot.png", alt: "Lumia MVP Interface", hasTags: true },
    { image: "/social-proof-screenshot.png", alt: "Lumia Social Proof", hasTags: true, tags: [{ label: "Reverse Strategic Prompting", color: "bg-brand-purple", pos: "top-[10%] left-[10%] md:left-[15%]" }, { label: "Interactive Decision Engine", color: "bg-brand-blue", pos: "top-[45%] left-[30%] md:left-[35%]" }, { label: "Actionable Execution", color: "bg-brand-orange", pos: "bottom-[15%] right-[10%] md:right-[15%]" }] },
    { image: "/third-screenshot.png", alt: "Lumia Dashboard Preview", hasTags: true, tags: [{ label: "Living Semantic Memory", color: "bg-brand-purple", pos: "top-[15%] left-[32%] md:left-[35%]" }, { label: "Instant Context Retrieval", color: "bg-brand-blue", pos: "top-[40%] left-[5%] md:left-[8%]" }, { label: "One-Click Persistence", color: "bg-brand-orange", pos: "bottom-[15%] left-[35%] md:left-[38%]" }] },
  ];
  const nextSlide = () => { const next = (currentSlide + 1) % slides.length; setCurrentSlide(next); onSlideChange?.(next); };
  const prevSlide = () => { const prev = (currentSlide - 1 + slides.length) % slides.length; setCurrentSlide(prev); onSlideChange?.(prev); };
  const goToSlide = (idx: number) => { setCurrentSlide(idx); onSlideChange?.(idx); };
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-gray-100">
      <div className="h-10 md:h-12 bg-gray-50/50 border-b border-gray-100 flex items-center px-6 gap-2 rounded-t-[2rem] md:rounded-t-[3rem]">
        <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-[#FF5F57]" /><div className="w-3 h-3 rounded-full bg-[#FFBD2E]" /><div className="w-3 h-3 rounded-full bg-[#28C840]" /></div>
        <div className="flex-1 flex justify-center"><div className="bg-white/50 px-4 py-1 rounded-full text-[10px] text-gray-400 font-mono">lumia.app/experience/{currentSlide === 0 ? "interface" : currentSlide === 1 ? "social" : "preview"}</div></div>
      </div>
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div key={currentSlide} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            <div className="rounded-b-[2rem] md:rounded-b-[3rem] overflow-hidden"><img src={slides[currentSlide].image} alt={slides[currentSlide].alt} className="w-full h-auto object-cover" referrerPolicy="no-referrer" /></div>
            {slides[currentSlide].hasTags && (
              <>{currentSlide === 0 ? (<><FeatureTag label="Zero Black-Box" color="bg-brand-purple" className="absolute top-[20%] left-[5%] md:left-[8%] hidden md:block" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} delay={0.5} /><FeatureTag label="Instant Context Access" color="bg-brand-blue" className="absolute bottom-[6.5%] right-[12%] md:right-[14%] scale-90 origin-right -translate-y-[30px] hidden md:block" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} delay={0.7} /><FeatureTag label="Kill 'Doom Asking'" color="bg-brand-orange" className="absolute bottom-[35%] right-[15%] md:right-[20%] -translate-x-[200px] translate-y-[20px] hidden md:block" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} delay={0.9} /></>) : "tags" in slides[currentSlide] && slides[currentSlide].tags ? (slides[currentSlide].tags as Array<{label:string;color:string;pos:string}>).map((tag, idx) => (<FeatureTag key={tag.label} label={tag.label} color={tag.color} className={`absolute ${tag.pos} hidden md:block`} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} delay={0.5 + idx * 0.2} />)) : null}</>
            )}
          </motion.div>
        </AnimatePresence>
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1C1C1E] transition-all opacity-0 group-hover/slider:opacity-100 z-30"><ChevronLeft className="w-5 h-5 md:w-6 md:h-6" /></button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1C1C1E] transition-all opacity-0 group-hover/slider:opacity-100 z-30"><ChevronRight className="w-5 h-5 md:w-6 md:h-6" /></button>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">{slides.map((_, idx) => (<button key={idx} onClick={() => goToSlide(idx)} className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? "bg-[#1C1C1E] w-6" : "bg-gray-300"}`} />))}</div>
    </motion.div>
  );
}

function Marquee({ children, className }: { children: React.ReactNode; className?: string }) {
  return (<div className={`overflow-hidden whitespace-nowrap flex w-full ${className}`}><motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="flex shrink-0"><div className="flex shrink-0 items-center">{children}<span className="mx-8 opacity-20">•</span></div><div className="flex shrink-0 items-center">{children}<span className="mx-8 opacity-20">•</span></div></motion.div></div>);
}

export default function Home() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("success=true")) {
      setIsSuccess(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-10 h-10 text-emerald-600" /></div>
          <h1 className="text-3xl font-bold text-[#1C1C1E]">Welcome, Founding Member!</h1>
          <p className="text-[#6E6E73]">Your payment was successful. You are now officially a Founding Member of Lumia. We&apos;ll be in touch shortly with your priority beta access.</p>
          <button onClick={() => setIsSuccess(false)} className="px-8 py-3 bg-[#1C1C1E] text-white rounded-full font-medium hover:bg-[#333333] transition-all">Back to Home</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#EADAFF] selection:text-[#1C1C1E] overflow-x-hidden">

      {/* Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between px-6 py-3 bg-white/70 backdrop-blur-xl rounded-full shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] border border-gray-100">
          <div className="flex items-center cursor-pointer h-24 md:h-40 -my-8 md:-my-14"><img src="/logo.png" alt="Lumia Logo" className="h-full w-auto object-contain" /></div>
          <div className="flex items-center gap-3 md:gap-6">
            <button className="hidden sm:block text-sm font-medium text-[#6E6E73] hover:text-[#1C1C1E] transition-colors">Sign In</button>
            <button className="text-xs md:text-sm font-medium px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-[#1C1C1E]/10 text-[#1C1C1E] hover:bg-[#1C1C1E]/5 transition-all">Join Waitlist</button>
          </div>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-24 md:pt-48 md:pb-32 flex flex-col items-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-purple blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-blue blur-[120px] animate-pulse [animation-delay:2s]" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-brand-orange blur-[120px] animate-pulse [animation-delay:4s]" />
        </div>
        <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[900px] md:h-[900px] bg-brand-gradient opacity-20 blur-[120px] rounded-full pointer-events-none" />
        <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[11px] font-bold tracking-[0.2em] text-[#A1A1A6] uppercase mb-3 z-10">BETA PHASE — EARLY ACCESS</motion.span>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg mx-auto mb-8 z-10 md:hidden"><Marquee className="text-sm font-bold text-[#1C1C1E]">Only 200 Founding Members – Lifetime price + priority beta access</Marquee></motion.div>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:block text-sm md:text-base font-bold text-[#1C1C1E] mb-8 z-10">Only 200 Founding Members – Lifetime price + priority beta access</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-[#1C1C1E] max-w-5xl z-10 leading-[1.15] md:leading-[1.1]">
          Don&apos;t prompt, <br className="hidden md:block" /><span className="text-brand-gradient">just pilot.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:block mt-8 text-lg md:text-xl text-[#6E6E73] max-w-2xl z-10 font-light leading-relaxed px-4 md:px-0">
          Current AI demands perfect orders. Lumia extracts your raw intent and turns it into real action — no prompts needed.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 w-full max-w-lg relative z-10 flex flex-col items-center gap-6">
          <WaitlistForm variant="hero" />
          <p className="text-[#A1A1A6] text-xs text-center">Mac version available at beta launch – Windows and Linux versions coming in 3-6 months (priority for Founding Members)</p>
          <a href="https://x.com/_r0sly_" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm font-medium text-[#A1A1A6] hover:text-[#1C1C1E] transition-colors flex items-center gap-2">Follow the Build in Public on X</a>
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16 md:mb-24 text-center">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#1C1C1E]">The Solopreneur AI Trap.</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {[{ title: "The Coordination Overhead.", desc: "AI was supposed to do the work, but now you're just managing 5 different agents. The mental fatigue of orchestrating disconnected tools is worse than doing the work yourself." }, { title: "The Work That Lives Nowhere.", desc: "Rewriting the client name, tone, and goals into every new chat window. Losing 2 hours a day just re-explaining your business context because traditional AI suffers from total amnesia." }, { title: "The Prompt Engineering Tax.", desc: "Getting a reliable strategic answer today requires chaining three separate prompts (extract, analyze, format), managing context windows, and tweaking temperatures. The entire cognitive load is pushed onto you. It's a technical chore, not a fluid conversation." }].map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-5 border-t border-gray-200 pt-6">
                <h3 className="text-xl font-semibold text-[#1C1C1E] tracking-tight">{card.title}</h3>
                <p className="text-[#6E6E73] leading-relaxed text-[15px]">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 bg-[#F9FAFB] px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20"><h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#1C1C1E]">The Cognitive Cockpit.</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[{ icon: Tag, color: "bg-brand-purple", title: "Persistent Vault + Smart Tagging", desc: "Organize your projects into tagged folders. Lumia automatically pulls the right documents." }, { icon: Clock, color: "bg-brand-blue", title: "Save & Track Timelines", desc: "Automatically save your roadmaps and checklists. Ask Lumia \"Where are we?\" and it always knows your progress." }, { icon: Layout, color: "bg-brand-orange", title: "Interactive GenUI", desc: "Checkboxes, sliders, and forms directly in the chat. Turn answers into real actions." }].map((feat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-[24px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-start">
                <div className={`w-14 h-14 rounded-full ${feat.color}/10 flex items-center justify-center mb-8`}><feat.icon className="w-6 h-6 text-brand-purple" /></div>
                <h3 className="text-xl font-semibold text-[#1C1C1E] mb-3">{feat.title}</h3>
                <p className="text-[#6E6E73] leading-relaxed text-[15px]">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16"><h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#1C1C1E]">The Zero-Prompt Experience.</h2></div>
          <div className="relative group/slider">
            <ExperienceSlider onSlideChange={setActiveSlide} />
            <AnimatePresence mode="wait">
              <motion.div key={activeSlide} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                <MobileFeatureAccordion slideIndex={activeSlide} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Performance Dashboard */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#1C1C1E] mb-6">The Executor vs. The Strategist.</h2>
            <p className="text-lg md:text-xl text-[#6E6E73] max-w-3xl mx-auto font-light leading-relaxed">Data is clear. Traditional AI excels at raw code. But for complex decisions, life organization, and deep context, dynamic memory changes the game.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-2 bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100 relative overflow-hidden flex flex-col justify-between group hover:shadow-[0_20px_40px_-12px_rgba(110,107,255,0.15)] transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gradient opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity duration-500" />
              <div><h3 className="text-lg font-medium text-gray-500 mb-8">POC Failure Rate</h3><div className="flex items-baseline gap-4 mb-8"><div className="text-7xl md:text-8xl font-semibold tracking-tight text-[#1C1C1E]"><Counter to={95} decimals={0} suffix="%" /></div></div></div>
              <p className="text-[#6E6E73] leading-relaxed text-lg max-w-md">Of generative AI projects fail for solopreneurs due to context fragmentation and &apos;the work that lives nowhere&apos;.</p>
            </motion.div>
            {/* Card 2 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 flex flex-col justify-between group hover:shadow-[0_20px_40px_-12px_rgba(110,107,255,0.15)] transition-all duration-500">
              <div><h3 className="text-lg font-medium text-gray-500 mb-4">Coordination Overhead Eliminated</h3><div className="text-5xl font-semibold tracking-tight text-[#1C1C1E] mb-8"><Counter to={-2} decimals={0} suffix=" Hours/Day" /></div></div>
              <p className="text-[#6E6E73] leading-relaxed text-sm">Load your business DNA once into Lumia&apos;s persistent memory, and never type a repetitive context prompt again.</p>
            </motion.div>
            {/* Card 3 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 flex flex-col justify-between group hover:shadow-[0_20px40px_-12px_rgba(110,107,255,0.15)] transition-all duration-500">
              <div><h3 className="text-lg font-medium text-gray-500 mb-4">AI Noise Reduction</h3><div className="text-5xl font-semibold tracking-tight text-[#1C1C1E] mb-8"><Counter to={-91.7} decimals={1} suffix="%" /></div></div>
              <p className="text-[#6E6E73] leading-relaxed text-sm">Lumia filters out generic AI introductions, hallucinations, and conversational fluff. You get pure, executable strategy without the robotic small talk.</p>
            </motion.div>
            {/* Card 4 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 flex flex-col justify-between group hover:shadow-[0_20px40px_-12px_rgba(110,107,255,0.15)] transition-all duration-500">
              <div><h3 className="text-lg font-medium text-gray-500 mb-4">Strategy &amp; Decision Making</h3><div className="text-4xl font-semibold tracking-tight text-[#1C1C1E] mb-6"><Counter prefix="+" to={39.5} decimals={1} suffix=" pts" /></div>
                <div className="space-y-4 mb-8">
                  <div><div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5"><span>Lumia</span></div><div className="h-2.5 w-full bg-gray-50 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} whileInView={{ width: "85%" }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }} className="h-full bg-brand-purple rounded-full" /></div></div>
                  <div><div className="flex justify-between text-xs font-medium text-gray-400 mb-1.5"><span>Traditional AI</span></div><div className="h-2.5 w-full bg-gray-50 rounded-full overflow-hidden"><div className="h-full bg-gray-200 rounded-full w-[40%]" /></div></div>
                </div>
              </div>
              <p className="text-[#6E6E73] leading-relaxed text-sm">Lumia excels where traditional AI fails: maintaining context for high-stakes business decisions.</p>
            </motion.div>
            {/* Card 5 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 flex flex-col justify-between group hover:shadow-[0_20px40px_-12px_rgba(110,107,255,0.15)] transition-all duration-500">
              <h3 className="text-lg font-medium text-gray-500 mb-8">Active Memory Efficiency</h3>
              <div className="flex justify-center mb-8">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-50" />
                    <motion.circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" initial={{ strokeDashoffset: 251.2 }} whileInView={{ strokeDashoffset: 251.2 - (251.2 * 0.49) }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }} strokeLinecap="round" className="text-brand-purple" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col"><span className="text-3xl font-semibold text-[#1C1C1E]"><Counter prefix="+" to={49} decimals={0} suffix="%" /></span></div>
                </div>
              </div>
              <p className="text-[#6E6E73] leading-relaxed text-sm">Surpasses traditional AI by <strong className="text-[#1C1C1E] font-medium">+49%</strong> when executing complex tasks within your pre-existing ecosystem.</p>
            </motion.div>
            {/* Card 6 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-3 bg-gray-50/50 rounded-[2rem] p-8 md:p-10 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 opacity-80 grayscale-[0.5] hover:grayscale-0 transition-all duration-500">
              <div className="md:w-1/3"><h3 className="text-lg font-medium text-gray-500 mb-4">The Technical Executor</h3><div className="text-5xl font-semibold tracking-tight text-gray-400"><Counter prefix="+" to={178} decimals={0} suffix="%" /></div></div>
              <div className="md:w-2/3"><p className="text-[#6E6E73] leading-relaxed text-base md:text-lg">Traditional AI retains a <strong className="text-gray-500 font-medium">+178% advantage</strong> in raw code generation. Lumia is the Strategic Brain: it defines the architecture, while traditional AI types the code.</p></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <div className="py-12 px-4 bg-white text-center">
        <p className="text-sm font-medium text-[#A1A1A6]">Follow the Build in Public on X <a href="https://x.com/_r0sly_" target="_blank" rel="noopener noreferrer" className="text-[#1C1C1E] hover:underline">@_r0sly_</a></p>
      </div>

      {/* Final CTA */}
      <section className="py-40 px-4 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1C1C1E] mb-8">Let&apos;s build the infrastructure together.</h2>
            <p className="text-[#6E6E73] text-lg leading-relaxed mb-24 max-w-2xl mx-auto">Lumia is currently in MVP phase. Join the waitlist as a Founding Member to secure your place in the cockpit.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
              {[{ icon: Crown, color: "bg-brand-purple", tag: "Priority Beta Access", desc: "Be the first to pilot Lumia. Shape the final infrastructure and experience." }, { icon: Tag, color: "bg-brand-orange", tag: "$99 Lifetime Deal", desc: "Secure exclusive founding pricing. (instead of $19/month, save >$200/year)." }, { icon: Timer, color: "bg-brand-blue", tag: "Only 200 Spots", desc: "Act fast. Claim your place among the founding architects." }].map((card, i) => (
                <motion.div key={i} whileHover={{ y: -8 }}
                  className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-xl border border-gray-50 text-left flex flex-col gap-6 transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl ${card.color}/10 flex items-center justify-center`}><card.icon className="w-7 h-7 text-brand-purple" /></div>
                  <div><h3 className="text-xs font-bold tracking-[0.2em] text-[#1C1C1E] uppercase mb-3">{card.tag}</h3><p className="text-[#6E6E73] text-[15px] leading-relaxed">{card.desc}</p></div>
                </motion.div>
              ))}
            </div>
            <div className="max-w-3xl mx-auto">
              <WaitlistForm variant="footer" />
              <p className="text-[#A1A1A6] text-xs mt-12">Price increases after beta. Mac version available at beta launch – Windows and Linux versions coming in 3-6 months (priority for Founding Members)</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
