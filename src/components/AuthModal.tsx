"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

type Tab = "signin" | "signup" | "reset";

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { refreshProfile } = useAuth();

  function resetForm() {
    setEmail("");
    setPassword("");
    setUsername("");
    setError(null);
    setSuccess(null);
  }

  function switchTab(t: Tab) {
    setTab(t);
    resetForm();
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else onClose();
    setLoading(false);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      setLoading(false);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores.");
      setLoading(false);
      return;
    }

    // Check username availability
    const { data: existing } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("username", username.toLowerCase())
      .maybeSingle();

    if (existing) {
      setError("This username is already taken.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase
        .from("user_profiles")
        .upsert({ id: data.user.id, username: username.toLowerCase(), display_name: username });
      await refreshProfile();
    }

    setSuccess("Account created! Check your email to confirm, then sign in.");
    setLoading(false);
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setSuccess("Password reset email sent — check your inbox.");
    setLoading(false);
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 12 }}
          transition={{ type: "spring", damping: 28, stiffness: 380 }}
        >
          {/* Header gradient */}
          <div
            className="h-1 w-full"
            style={{ background: "linear-gradient(90deg, #567EFC, #EB5E5E)" }}
          />

          <div className="p-7">
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-[#6B6480] hover:bg-[#F3F4FF] transition-colors"
            >
              <X size={18} />
            </button>

            {/* Logo */}
            <div className="mb-6">
              <span
                className="text-xl font-bold tracking-tight"
                style={{ color: "#0F0A1E" }}
              >
                lumia
              </span>
            </div>

            {/* Tabs */}
            {tab !== "reset" && (
              <div className="flex gap-1 p-1 bg-[#F3F4FF] rounded-xl mb-6">
                {(["signin", "signup"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => switchTab(t)}
                    className="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
                    style={{
                      background: tab === t ? "#fff" : "transparent",
                      color: tab === t ? "#0F0A1E" : "#6B6480",
                      boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    {t === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>
            )}

            {/* Sign In */}
            {tab === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B6480] mb-1.5 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E5EA] text-sm outline-none focus:border-[#567EFC] focus:ring-2 focus:ring-[#567EFC]/20 transition-all"
                    style={{ color: "#0F0A1E" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B6480] mb-1.5 uppercase tracking-wide">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E5EA] text-sm outline-none focus:border-[#567EFC] focus:ring-2 focus:ring-[#567EFC]/20 transition-all"
                    style={{ color: "#0F0A1E" }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => switchTab("reset")}
                  className="text-xs text-[#567EFC] hover:underline"
                >
                  Forgot password?
                </button>
                <StatusMessage error={error} success={success} />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-70"
                  style={{ background: "#0F0A1E" }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Sign in
                </button>
              </form>
            )}

            {/* Sign Up */}
            {tab === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B6480] mb-1.5 uppercase tracking-wide">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="cooluser42"
                    maxLength={30}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E5EA] text-sm outline-none focus:border-[#567EFC] focus:ring-2 focus:ring-[#567EFC]/20 transition-all"
                    style={{ color: "#0F0A1E" }}
                  />
                  <p className="mt-1 text-xs text-[#A89FC0]">Letters, numbers, underscores only.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B6480] mb-1.5 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E5EA] text-sm outline-none focus:border-[#567EFC] focus:ring-2 focus:ring-[#567EFC]/20 transition-all"
                    style={{ color: "#0F0A1E" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B6480] mb-1.5 uppercase tracking-wide">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E5EA] text-sm outline-none focus:border-[#567EFC] focus:ring-2 focus:ring-[#567EFC]/20 transition-all"
                    style={{ color: "#0F0A1E" }}
                  />
                </div>
                <StatusMessage error={error} success={success} />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-70"
                  style={{ background: "linear-gradient(135deg, #567EFC, #EB5E5E)" }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Create account
                </button>
              </form>
            )}

            {/* Reset */}
            {tab === "reset" && (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="mb-2">
                  <h2 className="text-lg font-bold text-[#0F0A1E]">Reset password</h2>
                  <p className="text-sm text-[#6B6480] mt-1">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B6480] mb-1.5 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E5EA] text-sm outline-none focus:border-[#567EFC] focus:ring-2 focus:ring-[#567EFC]/20 transition-all"
                    style={{ color: "#0F0A1E" }}
                  />
                </div>
                <StatusMessage error={error} success={success} />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-70"
                  style={{ background: "#0F0A1E" }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Send reset link
                </button>
                <button
                  type="button"
                  onClick={() => switchTab("signin")}
                  className="w-full text-sm text-[#6B6480] hover:text-[#0F0A1E] transition-colors"
                >
                  Back to sign in
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatusMessage({ error, success }: { error: string | null; success: string | null }) {
  if (!error && !success) return null;
  return (
    <div
      className="flex items-start gap-2 p-3 rounded-xl text-sm"
      style={{
        background: error ? "#FFF1F1" : "#F0FDF4",
        color: error ? "#DC2626" : "#16A34A",
      }}
    >
      {error ? <AlertCircle size={15} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={15} className="mt-0.5 shrink-0" />}
      <span>{error ?? success}</span>
    </div>
  );
}
