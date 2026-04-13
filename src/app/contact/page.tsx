"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";

const TOPICS = [
  "General question",
  "Billing & subscription",
  "Bug report",
  "Feature request",
  "Privacy / data deletion",
  "Partnership",
  "Other",
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), topic, message: message.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try emailing us directly at oria.agency.ai@gmail.com");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-5 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#567EFC" }}>
            Support
          </p>
          <h1
            className="text-4xl font-bold tracking-tight mb-4"
            style={{ color: "#0F0A1E", letterSpacing: "-0.5px" }}
          >
            Contact us
          </h1>
          <p className="text-base text-[#6B6480]">
            We usually reply within one business day.
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-10 text-center"
            style={{ background: "linear-gradient(135deg, #567EFC10, #EB5E5E08)", border: "0.5px solid rgba(86,126,252,0.15)" }}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#F0FDF4" }}>
                <CheckCircle2 size={28} color="#22C55E" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-[#0F0A1E] mb-2">Message sent!</h2>
            <p className="text-sm text-[#6B6480]">
              We received your message and will get back to you at <strong>{email}</strong> within one business day.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name + Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#A89FC0" }}>
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
                  style={{ borderColor: "rgba(86,126,252,0.15)", background: "#fff", color: "#0F0A1E", fontFamily: "DM Sans, sans-serif" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#A89FC0" }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
                  style={{ borderColor: "rgba(86,126,252,0.15)", background: "#fff", color: "#0F0A1E", fontFamily: "DM Sans, sans-serif" }}
                />
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#A89FC0" }}>
                Topic
              </label>
              <select
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: "rgba(86,126,252,0.15)", background: "#fff", color: "#0F0A1E", fontFamily: "DM Sans, sans-serif" }}
              >
                {TOPICS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#A89FC0" }}>
                Message
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="How can we help you?"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none"
                style={{ borderColor: "rgba(86,126,252,0.15)", background: "#fff", color: "#0F0A1E", fontFamily: "DM Sans, sans-serif" }}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "#0F0A1E", fontFamily: "var(--font-bricolage), sans-serif" }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {submitting ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </div>
    </PageShell>
  );
}
