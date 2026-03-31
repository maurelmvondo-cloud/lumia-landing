"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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
        setErrorMessage(err.message || "Something went wrong.");
      }
      return;
    }

    if (!isSupabaseConfigured) {
      setStatus("error");
      setErrorMessage("Supabase configuration is missing.");
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
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-2 text-emerald-600 font-medium py-3 ${variant === "hero" ? "justify-center text-center w-full" : ""}`}>
        <CheckCircle2 className="w-5 h-5 shrink-0" /><span>You are on the list.</span>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}
        className={`w-full flex flex-col sm:flex-row items-center gap-2 sm:gap-3 p-2 bg-white/80 backdrop-blur-md border border-gray-100 transition-shadow ${variant === "hero" ? "rounded-[2rem] sm:rounded-full shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)]" : "rounded-2xl sm:rounded-full bg-gray-50/50"}`}>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 bg-transparent border-none outline-none px-5 py-3 text-[#1C1C1E] placeholder:text-[#A1A1A6] font-medium w-full" />
        <button disabled={status === "loading"}
          className={`flex items-center justify-center gap-2 px-6 py-3.5 text-white text-sm font-bold rounded-full transition-all whitespace-nowrap w-full sm:w-auto ${variant === "hero" ? "bg-[#1C1C1E] hover:opacity-90" : "bg-[#1C1C1E] hover:opacity-90"}`}
          style={variant === "footer" ? { background: "linear-gradient(135deg, #567EFC 0%, #C2AED4 50%, #FF7769 100%)" } : {}}>
          {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> :
            <>{variant === "hero" ? "Join for free →" : "Become a founding member →"}<ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
      {status === "error" && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-rose-500 text-sm font-medium mt-3 px-4">
          <AlertCircle className="w-4 h-4" /><span>{errorMessage}</span>
        </motion.div>
      )}
    </div>
  );
}

function PricingPaidForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
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

  if (status === "success") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center gap-2 text-emerald-600 font-medium py-3">
        <CheckCircle2 className="w-5 h-5 shrink-0" /><span>Redirecting...</span>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full bg-white border-2 border-gray-200 rounded-full px-4 py-3 text-sm text-[#1C1C1E] placeholder:text-[#A1A1A6] font-medium outline-none transition-all focus:border-[#567EFC]"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full py-3.5 rounded-full text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #567EFC 0%, #C2AED4 50%, #FF7769 100%)" }}
        >
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>Become a founding member → <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>
      {status === "error" && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-rose-500 text-sm font-medium mt-3 px-4">
          <AlertCircle className="w-4 h-4" /><span>{errorMessage}</span>
        </motion.div>
      )}
    </div>
  );
}

export default function Home() {
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("success=true")) {
      setIsSuccess(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-10 h-10 text-emerald-600" /></div>
          <h1 className="text-3xl font-bold text-[#1C1C1E]">Welcome, Founding Member!</h1>
          <p className="text-[#6E6E73]">Your payment was successful. You are now officially a Founding Member of Lumia. We&apos;ll be in touch shortly.</p>
          <button onClick={() => setIsSuccess(false)} className="px-8 py-3 bg-[#1C1C1E] text-white rounded-full font-medium hover:bg-[#333333] transition-all">Back to Home</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-12 py-4 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <a href="/" className="flex items-center gap-2.5 no-underline">
          <img src="/logo.png" alt="Lumia" className="w-7 h-7 object-contain" />
          <span className="font-bold text-xl tracking-tight text-[#1C1C1E]">Lumia</span>
        </a>
        <div className="flex items-center gap-8">
          <button onClick={() => scrollTo("how")} className="text-sm font-medium text-[#6E6E73] hover:text-[#1C1C1E] transition-colors hidden sm:block">How it works</button>
          <button onClick={() => scrollTo("features")} className="text-sm font-medium text-[#6E6E73] hover:text-[#1C1C1E] transition-colors hidden sm:block">Features</button>
          <button onClick={() => scrollTo("pricing")} className="text-sm font-medium text-[#6E6E73] hover:text-[#1C1C1E] transition-colors hidden sm:block">Pricing</button>
          <a href="https://x.com/_r0sly_" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#567EFC] hover:text-[#1C1C1E] transition-colors no-underline">@_r0sly_ ↗</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#567EFC] blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#FF7769] blur-[100px] animate-pulse" style={{animationDelay:"2s"}} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.6}}
            className="inline-flex items-center gap-2.5 bg-white border border-gray-200 rounded-full px-4 py-2 mb-6 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#567EFC] via-[#C2AED4] to-[#FF7769] flex items-center justify-center text-white text-xs font-bold">R</div>
            <span className="text-sm font-medium text-[#6E6E73]">Built by</span>
            <a href="https://x.com/_r0sly_" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#567EFC] no-underline hover:text-[#1C1C1E] transition-colors">@_r0sly_ on X</a>
            <span className="text-gray-300">·</span>
            <span className="text-sm font-medium text-[#6E6E73]">follow the build ↗</span>
          </motion.div>

          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.05}}
            className="inline-flex items-center gap-2 bg-[rgba(86,126,252,0.06)] border border-[rgba(86,126,252,0.18)] rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#567EFC] to-[#FF7769] animate-pulse" />
            <span className="text-xs font-bold text-[#567EFC]">Only 50 founding spots — very few left</span>
          </motion.div>

          <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.1}}
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-[#1C1C1E] leading-tight mb-6">
            Stop crafting prompts.<br/>
            <span className="bg-gradient-to-r from-[#567EFC] via-[#C2AED4] to-[#FF7769] bg-clip-text text-transparent">Just say what you need.</span>
          </motion.h1>

          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.15}}
            className="text-base md:text-lg text-[#6E6E73] max-w-md mx-auto mb-10 leading-relaxed">
            Lumia overlays on top of <strong className="text-[#1C1C1E]">any AI</strong> you already use.
            Share a rough idea by voice or text — it pulls your context and writes the perfect prompt for you.
          </motion.p>

          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.2}} className="max-w-sm sm:max-w-md mx-auto mb-4">
            <WaitlistForm variant="hero" />
          </motion.div>
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.6,delay:0.3}} className="text-xs text-[#A1A1A6]">
            Free waitlist · or <button onClick={() => scrollTo("pricing")} className="text-[#567EFC] font-semibold no-underline">get founding access for $99</button> · Mac at launch
          </motion.p>
        </div>
      </section>

      {/* WORKS WITH */}
      <div className="bg-[#F6F7FB] border-t border-b border-gray-100 py-5 px-8 flex items-center justify-center flex-wrap gap-3">
        <span className="text-xs font-bold text-[#A1A1A6] uppercase tracking-widest">Works on top of</span>
        <span className="text-gray-300">·</span>
        {["Claude","ChatGPT","Gemini","Perplexity","Any AI interface"].map((item) => (
          <span key={item} className="text-sm font-medium text-[#6E6E73] bg-white border border-gray-200 rounded-full px-4 py-1.5">{item}</span>
        ))}
      </div>

      {/* SOCIAL PROOF */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[#567EFC] via-[#C2AED4] to-[#FF7769] bg-clip-text text-transparent mb-3 block">People feel this pain</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1C1C1E] leading-tight mb-4">You&apos;re not the only one<br/>re-explaining everything.</h2>
            <p className="text-[#6E6E73] text-base md:text-lg leading-relaxed max-w-md mx-auto">Every day, thousands of people lose time to the same problem. Lumia fixes it.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { avatar:"KeepItFLOSSY.jpg", name:"KeepItFLOSSY", handle:"@KeepItFLOSSY", text:"The AI just <strong>drops all the important details mid-project</strong>. Context compaction killing your whole thread is genuinely one of the most frustrating things right now." },
              { avatar:"sharaff.jpg", name:"sharaff", handle:"@sharaff", text:"The fact we even have to <strong>save entire chats to git</strong> just so the AI doesn&apos;t forget is exhausting. We&apos;re basically doing memory management manually." },
              { avatar:"VVoluspa.jpg", name:"VÖLUSPÁ", handle:"@VVoluspa", text:"About halfway in the AI <strong>forgets the whole setup</strong> and starts making zero sense. I spend more time correcting it than actually working." },
            ].map((t) => (
              <div key={t.handle} className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:-translate-y-0.5 hover:shadow-lg hover:border-[rgba(86,126,252,0.2)] transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                  <div><div className="text-sm font-bold text-[#1C1C1E]">{t.name}</div><div className="text-xs text-[#A1A1A6]">{t.handle}</div></div>
                  <span className="ml-auto text-lg opacity-30">𝕏</span>
                </div>
                <p className="text-sm text-[#6E6E73] leading-relaxed" dangerouslySetInnerHTML={{__html:t.text}}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* URGENCY BAR */}
      <div className="bg-gradient-to-r from-[rgba(86,126,252,0.04)] to-[rgba(255,119,105,0.04)] border-t border-b border-gray-100 py-5 px-6 text-center">
        <p className="text-sm font-semibold text-[#6E6E73]">⚡ <strong className="text-[#1C1C1E]">Founding spots are limited.</strong> Only a handful remain — once they&apos;re gone, the price goes up.</p>
      </div>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-6 bg-white scroll-mt-24">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[#567EFC] via-[#C2AED4] to-[#FF7769] bg-clip-text text-transparent mb-3 block">How it works</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1C1C1E] leading-tight mb-4">Three steps.<br/>Zero prompt engineering.</h2>
            <p className="text-[#6E6E73] text-base md:text-lg leading-relaxed max-w-md mx-auto">You give the rough idea. Lumia handles the rest — context, structure, and a prompt that actually works.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {num:"01",title:"Share your intent",desc:"Voice or text — say what you&apos;re trying to do in plain language. No structure needed, no format to remember."},
              {num:"02",title:"Lumia pulls your context",desc:"It grabs the right templates, documents, and past decisions from your vault — and asks one clarifying question if something&apos;s missing."},
              {num:"03",title:"Perfect prompt, instantly",desc:"A clean structured prompt lands in whatever AI you&apos;re using. You see exactly what context was used — full transparency, no black box."},
            ].map((s) => (
              <div key={s.num} className="bg-white border-2 border-gray-100 rounded-2xl p-8 hover:-translate-y-1 hover:shadow-xl hover:border-[rgba(86,126,252,0.3)] transition-all">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#567EFC] via-[#C2AED4] to-[#FF7769] flex items-center justify-center text-white text-sm font-bold mb-5">{s.num}</div>
                <h3 className="text-lg font-bold text-[#1C1C1E] mb-3 tracking-tight">{s.title}</h3>
                <p className="text-sm text-[#6E6E73] leading-relaxed" dangerouslySetInnerHTML={{__html:s.desc}}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="py-24 px-6 bg-[#F6F7FB] border-t border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[#567EFC] via-[#C2AED4] to-[#FF7769] bg-clip-text text-transparent mb-3 block">The real problem</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1C1C1E] leading-tight mb-4">AI is powerful.<br/>Using it well is exhausting.</h2>
            <p className="text-[#6E6E73] text-base md:text-lg leading-relaxed max-w-md mx-auto">You spend more time managing the AI than actually working. Lumia fixes that layer.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {tag:"without",label:"Without Lumia",title:"Re-explaining everything from scratch, every session",desc:"New chat = blank slate. You paste your context, re-describe your tone, re-explain your project — before you&apos;ve asked the real question."},
              {tag:"with",label:"With Lumia",title:"Your context is always ready and loaded",desc:"Your vault remembers what matters. Every prompt is pre-loaded with the right documents and templates — automatically, silently, correctly."},
              {tag:"without",label:"Without Lumia",title:"20 minutes crafting a prompt to get a useful answer",desc:"Chain three prompts, tweak the structure, re-run because it drifted. The cognitive load of prompting has become a full-time job."},
              {tag:"with",label:"With Lumia",title:"Rough idea in — sharp, usable answer out",desc:"Say what you need in plain language. Lumia turns it into a precision prompt and fires it at your AI of choice. Done in seconds."},
            ].map((c) => (
              <div key={c.title} className="bg-white border-2 border-gray-100 rounded-2xl p-7 hover:shadow-md transition-all">
                <div className={`inline-block text-xs font-bold uppercase tracking-wide rounded-lg px-3 py-1 mb-4 ${c.tag==="without"?"bg-gray-100 text-[#A1A1A6] border border-gray-200":"bg-[rgba(86,126,252,0.08)] text-[#567EFC] border border-[rgba(86,126,252,0.2)]"}`}>{c.label}</div>
                <h3 className="text-base font-bold text-[#1C1C1E] mb-3 leading-snug tracking-tight">{c.title}</h3>
                <p className="text-sm text-[#6E6E73] leading-relaxed" dangerouslySetInnerHTML={{__html:c.desc}}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 bg-white scroll-mt-24">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[#567EFC] via-[#C2AED4] to-[#FF7769] bg-clip-text text-transparent mb-3 block">Features</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1C1C1E] leading-tight mb-4">Built to live above<br/>every AI tool you already use.</h2>
            <p className="text-[#6E6E73] text-base md:text-lg leading-relaxed max-w-md mx-auto">A desktop overlay that plugs into your workflow without replacing anything.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {icon:"🔗",title:"Works on any AI interface",desc:"Claude, ChatGPT, Perplexity — Lumia overlays on top. No switching tools, no new tab to manage."},
              {icon:"🎙️",title:"Voice or text intent",desc:"Talk your rough idea out loud or type it. Lumia cleans, structures, and builds the prompt — you just share the intent."},
              {icon:"🗂️",title:"Persistent context vault",desc:"Store your templates, documents, and tone once. Tell Lumia when to use each — it pulls the right context automatically."},
              {icon:"👁️",title:"Full transparency",desc:"See exactly which context chunks were used to build your prompt. Override anything before it sends. No black box ever."},
              {icon:"❓",title:"Smart clarifying questions",desc:"When your intent is ambiguous, Lumia asks before firing — not after wasting your time with a bad answer."},
              {icon:"🔁",title:"Learns from your feedback",desc:"Give a quick correction after a prompt — Lumia adapts to how you work and gets sharper over time."},
            ].map((f) => (
              <div key={f.title} className="bg-white border-2 border-gray-100 rounded-2xl p-6 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg hover:border-[rgba(86,126,252,0.25)] transition-all group">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#567EFC] via-[#C2AED4] to-[#FF7769] opacity-0 group-hover:opacity-100 transition-opacity"/>
                <div className="w-10 h-10 rounded-xl bg-[#F6F7FB] border border-gray-200 flex items-center justify-center text-xl mb-4">{f.icon}</div>
                <h3 className="text-base font-bold text-[#1C1C1E] mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-[#6E6E73] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="py-24 px-6 bg-[#F6F7FB] border-t border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[#567EFC] via-[#C2AED4] to-[#FF7769] bg-clip-text text-transparent mb-3 block">Who it&apos;s for</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1C1C1E] leading-tight mb-4">If you use AI daily and it<br/>still feels like hard work —</h2>
            <p className="text-[#6E6E73] text-base md:text-lg leading-relaxed max-w-md mx-auto">Doesn&apos;t matter what field. If you&apos;re tired of bad prompts getting bad answers, Lumia fixes that.</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {["💼 Solopreneurs","🛍️ E-commerce operators","🎓 Students","✍️ Content creators","📊 Freelancers","📣 Marketers","🏗️ Builders & makers","🤔 Anyone tired of bad AI answers"].map((c) => (
              <div key={c} className="bg-white border-2 border-gray-200 rounded-full px-5 py-2.5 text-sm font-medium text-[#6E6E73] cursor-default hover:border-[rgba(86,126,252,0.4)] hover:text-[#567EFC] hover:shadow-md transition-all">{c}</div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6 bg-white scroll-mt-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16 text-center">
            <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[#567EFC] via-[#C2AED4] to-[#FF7769] bg-clip-text text-transparent mb-3 block">Pricing</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1C1C1E] leading-tight mb-4">Two ways to get in.</h2>
            <p className="text-[#6E6E73] text-base md:text-lg leading-relaxed max-w-md mx-auto">Join the free waitlist and wait for your invite — or lock in founding access now before the price goes up.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Free */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="inline-block text-xs font-bold uppercase tracking-wide bg-gray-100 text-[#A1A1A6] border border-gray-200 rounded-lg px-3 py-1 mb-5">Free waitlist</div>
              <h3 className="text-2xl font-bold text-[#1C1C1E] mb-2 tracking-tight">Join the queue</h3>
              <div className="text-5xl font-bold text-[#1C1C1E] mb-1">$0</div>
              <p className="text-sm text-[#A1A1A6] mb-6">Free · get your invite when ready</p>
              <p className="text-sm text-[#6E6E73] leading-relaxed mb-6">Get on the list, follow the build, and receive your beta invite when your spot opens up. No credit card, no commitment.</p>
              <ul className="space-y-2.5 mb-8 list-none">
                {["Beta access when available","Build-in-public updates","No credit card required"].map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-sm text-[#6E6E73]">
                    <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-[#A1A1A6] shrink-0">✓</div>
                    {p}
                  </li>
                ))}
              </ul>
              <button onClick={() => window.scrollTo({top:0,behavior:"smooth"})} className="w-full py-3.5 bg-[#F6F7FB] text-[#6E6E73] border-2 border-gray-200 rounded-full font-bold text-sm hover:bg-gray-100 hover:text-[#1C1C1E] transition-all">Join free waitlist</button>
            </div>

            {/* Paid */}
            <div className="relative rounded-2xl p-8" style={{border:"2px solid transparent",boxShadow:"0 8px 40px rgba(86,126,252,0.15)"}}>
              <div style={{position:"absolute",inset:"-2px",borderRadius:"1rem",background:"linear-gradient(135deg, #567EFC 0%, #C2AED4 50%, #FF7769 100%)",zIndex:-1}}/>
              <div style={{borderRadius:"0.875rem"}} className="bg-white h-full">
                <div className="inline-block text-xs font-bold uppercase tracking-wide rounded-lg px-3 py-1 mb-5 bg-gradient-to-r from-[#567EFC] to-[#FF7769] text-white">⚡ Founding member</div>
                <h3 className="text-2xl font-bold text-[#1C1C1E] mb-2 tracking-tight">Lock in your spot</h3>
                <div className="text-5xl font-bold bg-gradient-to-r from-[#567EFC] via-[#C2AED4] to-[#FF7769] bg-clip-text text-transparent mb-1">$99</div>
                <p className="text-sm text-[#A1A1A6] mb-6"><s>then $19/mo</s> · save $130+/year forever</p>
                <p className="text-sm text-[#6E6E73] leading-relaxed mb-6">Skip the queue. Get priority beta access, help shape the product, and lock in lifetime pricing before it&apos;s gone. Only 50 spots total — very few remaining.</p>
                <ul className="space-y-2.5 mb-6 list-none">
                  {[
                    {text:<><strong>Priority beta access</strong> — skip the queue</>},
                    {text:<><strong>Lifetime price</strong> — never pay monthly</>},
                    {text:<><strong>Shape the product</strong> — direct founder access</>},
                    {text:<>All features, forever</>},
                    {text:<>⚡ Limited spots — filling up fast</>},
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-sm text-[#6E6E73]">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#567EFC] to-[#FF7769] flex items-center justify-center text-[10px] text-white shrink-0 mt-0.5">✓</div>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
                <PricingPaidForm />
              </div>
            </div>
          </div>
          <p className="text-center mt-8 text-xs text-[#A1A1A6]">Price increases to $19/mo after beta. Founding price is locked for life. Spots are limited.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#F6F7FB] border-t border-gray-100 py-8 px-12 flex items-center justify-between flex-wrap gap-4">
        <a href="/" className="flex items-center gap-2.5 no-underline">
          <img src="/logo.png" alt="Lumia" className="w-7 h-7 object-contain" />
          <span className="font-bold text-xl tracking-tight text-[#1C1C1E]">Lumia</span>
        </a>
        <div className="flex items-center gap-6 flex-wrap">
          <a href="https://x.com/_r0sly_" target="_blank" rel="noopener noreferrer" className="text-sm text-[#A1A1A6] hover:text-[#1C1C1E] transition-colors no-underline">Building in public on X ↗</a>
          <a href="mailto:maurel.mvondo@icloud.com" className="text-sm text-[#A1A1A6] hover:text-[#1C1C1E] transition-colors no-underline">maurel.mvondo@icloud.com</a>
          <p className="text-sm text-[#A1A1A6]">© 2026 Lumia</p>
        </div>
      </footer>

    </div>
  );
}
