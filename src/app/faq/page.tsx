"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { PageShell } from "@/components/PageShell";

const CATEGORIES = [
  {
    label: "General",
    items: [
      {
        q: "What is Lumia?",
        a: "Lumia is an AI-powered productivity assistant for macOS that lets you work across multiple AI models (Claude, GPT-4, Gemini) from a single interface. You express your intent once — Lumia routes it to the right model, executes workflows, and stores everything in a personal Vault.",
      },
      {
        q: "Is Lumia available on iPhone / Windows?",
        a: "Lumia is currently macOS-only. An iOS version is planned. Windows is not on the roadmap yet, but we'll announce it if that changes.",
      },
      {
        q: "How is Lumia different from just using ChatGPT or Claude directly?",
        a: "Lumia sits on top of all the models at once. Instead of switching tabs and re-explaining context every time, Lumia maintains your context, picks the best model for each task, and connects to your documents and workflows automatically.",
      },
      {
        q: "Do I need API keys to use Lumia?",
        a: "No. Lumia's AI is powered by our infrastructure — you don't need your own OpenAI or Anthropic keys to get started. Advanced users can optionally connect their own keys for higher rate limits.",
      },
    ],
  },
  {
    label: "Account & Billing",
    items: [
      {
        q: "What's included in the free plan?",
        a: "The free plan gives you 30 lifetime AI prompts to explore Lumia — enough to get a real feel for the product. There's no time limit, but once you hit 30 prompts, you'll need to upgrade to continue.",
      },
      {
        q: "What's the difference between Early Access Monthly and Founding Member?",
        a: "Early Access Monthly is $10/month and gives unlimited access as long as you're subscribed. Founding Member is a one-time $99 payment for permanent, unlimited access — no recurring charges, ever. Founding Member pricing will increase as Lumia exits beta.",
      },
      {
        q: "Can I cancel my monthly subscription at any time?",
        a: "Yes, cancel any time from your account settings. You keep access until the end of the billing period — no prorated refunds for partial months.",
      },
      {
        q: "Do you offer refunds?",
        a: "Monthly subscriptions are not refunded for partial billing periods. Founding Member (lifetime) purchases can be refunded within 14 days of purchase — email oria.agency.ai@gmail.com.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. Payments are processed entirely by Stripe — we never see or store your raw card number. Stripe is PCI DSS Level 1 certified.",
      },
    ],
  },
  {
    label: "Vault & Privacy",
    items: [
      {
        q: "What is the Vault?",
        a: "The Vault is a private, encrypted document store inside Lumia. You can upload PDFs, images, notes, and other files. Lumia indexes them so the AI can reference your documents in conversations — like having your own private knowledge base.",
      },
      {
        q: "Is my data used to train AI models?",
        a: "No. Your documents, vault contents, and conversations are never used to train any AI model — ours or our providers'. Your data is yours.",
      },
      {
        q: "Who can see my vault documents and conversations?",
        a: "Only you. We use row-level security (RLS) in our database — your data is cryptographically scoped to your user ID. Even Lumia staff cannot access your vault contents in normal operations.",
      },
      {
        q: "Can I delete all my data?",
        a: "Yes. Email oria.agency.ai@gmail.com to request account deletion. We'll permanently delete all your data within 30 days, except billing records required by law.",
      },
    ],
  },
  {
    label: "Technical",
    items: [
      {
        q: "Which AI models does Lumia use?",
        a: "Lumia routes between Claude (Anthropic), GPT-4o (OpenAI), and Gemini (Google) depending on the task. The routing is handled automatically, but power users can pin specific models.",
      },
      {
        q: "I found a bug — where do I report it?",
        a: "Head to the Bug Tracker page. If you're signed in, you can submit a detailed report there. We review all reports and update the known bugs list regularly.",
      },
      {
        q: "Does Lumia work offline?",
        a: "Most AI features require an internet connection. You can browse your vault and read previously loaded documents offline, but generating responses requires connectivity.",
      },
      {
        q: "What macOS version is required?",
        a: "Lumia requires macOS 14 (Sonoma) or later.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-xl border overflow-hidden transition-colors"
      style={{
        borderColor: open ? "rgba(86,126,252,0.25)" : "rgba(86,126,252,0.10)",
        background: open ? "#fff" : "rgba(255,255,255,0.6)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span
          className="text-sm font-semibold leading-snug"
          style={{ color: "#0F0A1E" }}
        >
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown size={16} style={{ color: open ? "#567EFC" : "#A89FC0" }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-5 pb-5 text-sm leading-relaxed"
              style={{ color: "#6B6480", borderTop: "1px solid rgba(86,126,252,0.08)" }}
            >
              <div className="pt-3">{a}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].label);

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-5 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#567EFC" }}
          >
            Support
          </p>
          <h1
            className="text-4xl font-bold tracking-tight mb-4"
            style={{ color: "#0F0A1E", letterSpacing: "-0.5px" }}
          >
            Frequently Asked Questions
          </h1>
          <p className="text-base text-[#6B6480]">
            Can't find what you're looking for?{" "}
            <a href="/contact" className="text-[#567EFC] hover:underline">
              Contact us
            </a>
            .
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: activeCategory === cat.label ? "#567EFC" : "#fff",
                color: activeCategory === cat.label ? "#fff" : "#6B6480",
                border: `1.5px solid ${activeCategory === cat.label ? "#567EFC" : "rgba(86,126,252,0.15)"}`,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Items */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-3"
          >
            {CATEGORIES.find((c) => c.label === activeCategory)?.items.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Still need help */}
        <div
          className="mt-12 rounded-2xl p-8 text-center"
          style={{ background: "linear-gradient(135deg, #567EFC15, #EB5E5E10)" }}
        >
          <p className="text-lg font-bold text-[#0F0A1E] mb-2">Still have questions?</p>
          <p className="text-sm text-[#6B6480] mb-5">
            Our team usually replies within one business day.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#0F0A1E" }}
          >
            Contact support
          </a>
        </div>
      </div>
    </PageShell>
  );
}
