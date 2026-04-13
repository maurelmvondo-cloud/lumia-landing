"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bug,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Loader2,
  ChevronDown,
  Lock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { PageShell } from "@/components/PageShell";

type Severity = "low" | "medium" | "high" | "critical";
type BugStatus = "open" | "in_progress" | "fixed" | "wont_fix";
type ReportStatus = "pending" | "acknowledged" | "in_progress" | "fixed" | "wont_fix";

interface KnownBug {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: BugStatus;
  category: string | null;
  created_at: string;
}

interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: ReportStatus;
  category: string | null;
  created_at: string;
}

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "#DC2626", bg: "#FEF2F2" },
  high:     { label: "High",     color: "#EA580C", bg: "#FFF7ED" },
  medium:   { label: "Medium",   color: "#D97706", bg: "#FFFBEB" },
  low:      { label: "Low",      color: "#2563EB", bg: "#EFF6FF" },
};

const BUG_STATUS_CONFIG: Record<BugStatus, { label: string; icon: React.ReactNode; color: string }> = {
  open:        { label: "Open",        icon: <AlertCircle size={13} />, color: "#EA580C" },
  in_progress: { label: "In progress", icon: <Clock size={13} />,       color: "#2563EB" },
  fixed:       { label: "Fixed",       icon: <CheckCircle2 size={13} />, color: "#16A34A" },
  wont_fix:    { label: "Won't fix",   icon: <XCircle size={13} />,     color: "#6B6480" },
};

const REPORT_STATUS_CONFIG: Record<ReportStatus, { label: string; color: string }> = {
  pending:     { label: "Pending",     color: "#A89FC0" },
  acknowledged:{ label: "Acknowledged",color: "#2563EB" },
  in_progress: { label: "In progress", color: "#D97706" },
  fixed:       { label: "Fixed",       color: "#16A34A" },
  wont_fix:    { label: "Won't fix",   color: "#6B6480" },
};

const CATEGORIES = ["App crash", "UI/UX", "Chat", "Vault", "Onboarding", "Payments", "Performance", "Other"];

function SeverityBadge({ severity }: { severity: Severity }) {
  const cfg = SEVERITY_CONFIG[severity];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: BugStatus }) {
  const cfg = BUG_STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: cfg.color, background: cfg.color + "18" }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export default function BugsPage() {
  const { user, username } = useAuth();
  const [knownBugs, setKnownBugs] = useState<KnownBug[]>([]);
  const [myReports, setMyReports] = useState<BugReport[]>([]);
  const [loadingBugs, setLoadingBugs] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<"known" | "mine">("known");

  // Submit form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [severity, setSeverity] = useState<Severity>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    loadKnownBugs();
  }, []);

  useEffect(() => {
    if (user) loadMyReports();
    else setMyReports([]);
  }, [user]);

  async function loadKnownBugs() {
    setLoadingBugs(true);
    const { data } = await supabase
      .from("known_bugs")
      .select("*")
      .order("severity", { ascending: false })
      .order("created_at", { ascending: false });
    setKnownBugs(data ?? []);
    setLoadingBugs(false);
  }

  async function loadMyReports() {
    const { data } = await supabase
      .from("bug_reports")
      .select("*")
      .order("created_at", { ascending: false });
    setMyReports(data ?? []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from("bug_reports").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      steps_to_reproduce: steps.trim() || null,
      category,
      severity,
    });

    if (error) {
      setSubmitError("Something went wrong. Please try again.");
    } else {
      // Fire-and-forget email notification to owner
      fetch("/api/notify-bug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), category, severity, username }),
      }).catch(() => {});

      setSubmitSuccess(true);
      setTitle("");
      setDescription("");
      setSteps("");
      setCategory(CATEGORIES[0]);
      setSeverity("medium");
      setFormOpen(false);
      setTimeout(() => setSubmitSuccess(false), 6000);
      await loadMyReports();
      setActiveTab("mine");
    }
    setSubmitting(false);
  }

  const openCount = knownBugs.filter((b) => b.status === "open" || b.status === "in_progress").length;
  const fixedCount = knownBugs.filter((b) => b.status === "fixed").length;

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-5 py-16">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#567EFC" }}>
            Transparency
          </p>
          <h1
            className="text-4xl font-bold tracking-tight mb-3"
            style={{ color: "#0F0A1E", letterSpacing: "-0.5px" }}
          >
            Bug Tracker
          </h1>
          <p className="text-base text-[#6B6480]">
            Known issues we're aware of and working on. No smoke and mirrors — just transparency.
          </p>

          {/* Stats */}
          <div className="flex gap-4 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border" style={{ borderColor: "rgba(86,126,252,0.12)" }}>
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-sm font-semibold text-[#0F0A1E]">{openCount}</span>
              <span className="text-sm text-[#6B6480]">open / in progress</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border" style={{ borderColor: "rgba(86,126,252,0.12)" }}>
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-[#0F0A1E]">{fixedCount}</span>
              <span className="text-sm text-[#6B6480]">fixed</span>
            </div>
          </div>
        </div>

        {/* Tabs (only if logged in) */}
        {user && (
          <div className="flex gap-1 p-1 bg-[#F3F4FF] rounded-xl mb-6">
            {(["known", "mine"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
                style={{
                  background: activeTab === t ? "#fff" : "transparent",
                  color: activeTab === t ? "#0F0A1E" : "#6B6480",
                  boxShadow: activeTab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {t === "known" ? "Known Issues" : `My Reports (${myReports.length})`}
              </button>
            ))}
          </div>
        )}

        {/* Known Bugs list */}
        {(!user || activeTab === "known") && (
          <div className="space-y-3 mb-10">
            {loadingBugs ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-[#567EFC]" />
              </div>
            ) : knownBugs.length === 0 ? (
              <div className="text-center py-16 text-[#A89FC0] text-sm">
                No known bugs right now 🎉
              </div>
            ) : (
              knownBugs.map((bug) => (
                <motion.div
                  key={bug.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-white border p-5"
                  style={{ borderColor: "rgba(86,126,252,0.12)", boxShadow: "0 2px 12px rgba(86,126,252,0.06)" }}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="mt-0.5 shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: "#F3F4FF" }}
                      >
                        <Bug size={15} style={{ color: "#567EFC" }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0F0A1E] leading-snug">{bug.title}</p>
                        <p className="text-sm text-[#6B6480] mt-1 leading-relaxed">{bug.description}</p>
                        {bug.category && (
                          <p className="text-xs text-[#A89FC0] mt-2">{bug.category}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <SeverityBadge severity={bug.severity} />
                      <StatusBadge status={bug.status} />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* My Reports list */}
        {user && activeTab === "mine" && (
          <div className="space-y-3 mb-10">
            {myReports.length === 0 ? (
              <div className="text-center py-12 text-[#A89FC0] text-sm">
                You haven't submitted any reports yet.
              </div>
            ) : (
              myReports.map((report) => {
                const sc = REPORT_STATUS_CONFIG[report.status];
                return (
                  <div
                    key={report.id}
                    className="rounded-2xl bg-white border p-5"
                    style={{ borderColor: "rgba(86,126,252,0.12)", boxShadow: "0 2px 12px rgba(86,126,252,0.06)" }}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0F0A1E]">{report.title}</p>
                        <p className="text-sm text-[#6B6480] mt-1 leading-relaxed line-clamp-2">{report.description}</p>
                        <p className="text-xs text-[#A89FC0] mt-2">
                          {report.category} · {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <SeverityBadge severity={report.severity} />
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ color: sc.color, background: sc.color + "18" }}
                        >
                          {sc.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Submit section */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: "rgba(86,126,252,0.15)", background: "#fff" }}
        >
          {user ? (
            <>
              {/* Success toast */}
              <AnimatePresence>
                {submitSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 px-5 py-3 text-sm font-medium"
                    style={{ background: "#F0FDF4", color: "#16A34A" }}
                  >
                    <CheckCircle2 size={15} />
                    Report received — pending review. We&apos;ll add it to the public tracker once validated.
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Toggle */}
              <button
                onClick={() => setFormOpen(!formOpen)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <div>
                  <p className="text-sm font-bold text-[#0F0A1E]">Submit a bug report</p>
                  <p className="text-xs text-[#6B6480] mt-0.5">
                    Signed in as @{username ?? user.email?.split("@")[0]}
                  </p>
                </div>
                <motion.div animate={{ rotate: formOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={18} style={{ color: "#567EFC" }} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {formOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: "hidden" }}
                  >
                    <form
                      onSubmit={handleSubmit}
                      className="px-6 pb-6 space-y-4"
                      style={{ borderTop: "1px solid rgba(86,126,252,0.08)" }}
                    >
                      <div className="pt-4 grid sm:grid-cols-2 gap-4">
                        {/* Category */}
                        <div>
                          <label className="block text-xs font-semibold text-[#6B6480] mb-1.5 uppercase tracking-wide">
                            Category
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5EA] text-sm outline-none focus:border-[#567EFC] focus:ring-2 focus:ring-[#567EFC]/20 transition-all bg-white"
                            style={{ color: "#0F0A1E" }}
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        {/* Severity */}
                        <div>
                          <label className="block text-xs font-semibold text-[#6B6480] mb-1.5 uppercase tracking-wide">
                            Severity
                          </label>
                          <select
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value as Severity)}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5EA] text-sm outline-none focus:border-[#567EFC] focus:ring-2 focus:ring-[#567EFC]/20 transition-all bg-white"
                            style={{ color: "#0F0A1E" }}
                          >
                            <option value="low">Low — minor cosmetic issue</option>
                            <option value="medium">Medium — feature broken</option>
                            <option value="high">High — major workflow blocked</option>
                            <option value="critical">Critical — data loss / crash</option>
                          </select>
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-xs font-semibold text-[#6B6480] mb-1.5 uppercase tracking-wide">
                          Title
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                          maxLength={120}
                          placeholder="Short, clear summary of the bug"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5EA] text-sm outline-none focus:border-[#567EFC] focus:ring-2 focus:ring-[#567EFC]/20 transition-all"
                          style={{ color: "#0F0A1E" }}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-semibold text-[#6B6480] mb-1.5 uppercase tracking-wide">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                          rows={3}
                          placeholder="What happened? What did you expect to happen?"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5EA] text-sm outline-none focus:border-[#567EFC] focus:ring-2 focus:ring-[#567EFC]/20 transition-all resize-none"
                          style={{ color: "#0F0A1E" }}
                        />
                      </div>

                      {/* Steps */}
                      <div>
                        <label className="block text-xs font-semibold text-[#6B6480] mb-1.5 uppercase tracking-wide">
                          Steps to reproduce <span className="normal-case font-normal">(optional)</span>
                        </label>
                        <textarea
                          value={steps}
                          onChange={(e) => setSteps(e.target.value)}
                          rows={2}
                          placeholder="1. Open the app&#10;2. Click on...&#10;3. See error"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5EA] text-sm outline-none focus:border-[#567EFC] focus:ring-2 focus:ring-[#567EFC]/20 transition-all resize-none"
                          style={{ color: "#0F0A1E" }}
                        />
                      </div>

                      {submitError && (
                        <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: "#FFF1F1", color: "#DC2626" }}>
                          <AlertCircle size={14} />
                          {submitError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity disabled:opacity-70"
                        style={{ background: "linear-gradient(135deg, #567EFC, #EB5E5E)" }}
                      >
                        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Bug size={14} />}
                        Submit report
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            /* Not logged in */
            <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
                style={{ background: "#F3F4FF" }}
              >
                <Lock size={20} style={{ color: "#567EFC" }} />
              </div>
              <p className="text-sm font-bold text-[#0F0A1E]">Sign in to submit a bug report</p>
              <p className="text-xs text-[#6B6480] max-w-xs">
                Creating a free account lets us follow up with you and track your report's status.
              </p>
              <button
                onClick={() => setShowAuth(true)}
                className="mt-1 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#0F0A1E" }}
              >
                Sign in / Sign up
              </button>
            </div>
          )}
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </PageShell>
  );
}
