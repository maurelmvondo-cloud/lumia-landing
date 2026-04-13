"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Mail, Lock, User } from "lucide-react";
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
    else setSuccess("Check your inbox — reset link sent.");
    setLoading(false);
  }

  return (
    <AnimatePresence>
      <motion.div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(15, 10, 30, 0.6)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 440,
            borderRadius: 24,
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 32px 80px rgba(0,0,0,0.28), 0 0 0 0.5px rgba(86,126,252,0.12)",
          }}
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
        >
          {/* Dark header */}
          <div style={{
            background: "#0F0A1E",
            padding: "28px 28px 24px",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Decorative glow */}
            <div style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(86,126,252,0.25) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute",
              bottom: -30,
              left: -20,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(235,94,94,0.18) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "rgba(255,255,255,0.08)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.5)",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.14)";
                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
              }}
            >
              <X size={15} />
            </button>

            {/* Logo + wordmark */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <img src="/logo.png" alt="Lumia" style={{ width: 26, height: 26, objectFit: "contain" }} />
              <span style={{
                fontFamily: "var(--font-bricolage), sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: "#fff",
                letterSpacing: "-0.3px",
              }}>Lumia</span>
            </div>

            {/* Headline */}
            <AnimatePresence mode="wait">
              {tab === "reset" ? (
                <motion.div key="reset-header"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}>
                  <p style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 22, color: "#fff", letterSpacing: "-0.4px", lineHeight: 1.2 }}>
                    Reset your password
                  </p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                    We'll email you a secure link.
                  </p>
                </motion.div>
              ) : tab === "signin" ? (
                <motion.div key="signin-header"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}>
                  <p style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 22, color: "#fff", letterSpacing: "-0.4px", lineHeight: 1.2 }}>
                    Welcome back.
                  </p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                    Sign in to your Lumia account.
                  </p>
                </motion.div>
              ) : (
                <motion.div key="signup-header"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}>
                  <p style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 22, color: "#fff", letterSpacing: "-0.4px", lineHeight: 1.2 }}>
                    Create your account.
                  </p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                    Join Lumia and get started today.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form body */}
          <div style={{ padding: "24px 28px 28px" }}>

            {/* Tab switcher */}
            {tab !== "reset" && (
              <div style={{
                display: "flex",
                gap: 4,
                padding: 4,
                background: "#F3F4FF",
                borderRadius: 12,
                marginBottom: 24,
              }}>
                {(["signin", "signup"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => switchTab(t)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: "DM Sans, sans-serif",
                      borderRadius: 9,
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                      background: tab === t ? "#fff" : "transparent",
                      color: tab === t ? "#0F0A1E" : "#6B6480",
                      boxShadow: tab === t ? "0 1px 6px rgba(0,0,0,0.09)" : "none",
                    }}
                  >
                    {t === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>
            )}

            {/* Sign In form */}
            {tab === "signin" && (
              <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <FieldGroup icon={<Mail size={15} color="#567EFC" />} label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </FieldGroup>
                <FieldGroup icon={<Lock size={15} color="#567EFC" />} label="Password">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </FieldGroup>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -8 }}>
                  <button
                    type="button"
                    onClick={() => switchTab("reset")}
                    style={{ fontSize: 12, color: "#567EFC", background: "none", border: "none", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontWeight: 500 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <StatusMessage error={error} success={success} />
                <SubmitButton loading={loading} label="Sign in" gradient={false} />
              </form>
            )}

            {/* Sign Up form */}
            {tab === "signup" && (
              <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <FieldGroup icon={<User size={15} color="#567EFC" />} label="Username">
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    placeholder="yourname"
                    maxLength={30}
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </FieldGroup>
                <FieldGroup icon={<Mail size={15} color="#567EFC" />} label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </FieldGroup>
                <FieldGroup icon={<Lock size={15} color="#567EFC" />} label="Password">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </FieldGroup>
                <StatusMessage error={error} success={success} />
                <SubmitButton loading={loading} label="Create account" gradient={true} />
              </form>
            )}

            {/* Reset form */}
            {tab === "reset" && (
              <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <FieldGroup icon={<Mail size={15} color="#567EFC" />} label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </FieldGroup>
                <StatusMessage error={error} success={success} />
                <SubmitButton loading={loading} label="Send reset link" gradient={false} />
                <button
                  type="button"
                  onClick={() => switchTab("signin")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    width: "100%",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontFamily: "DM Sans, sans-serif",
                    color: "#6B6480",
                    fontWeight: 500,
                    marginTop: -4,
                  }}
                >
                  <ArrowLeft size={13} />
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

// ─── Shared input style ───────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: "1.5px solid #E5E5EA",
  fontSize: 14,
  fontFamily: "DM Sans, sans-serif",
  color: "#0F0A1E",
  outline: "none",
  background: "#FAFAFA",
  transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
  boxSizing: "border-box",
};

function onFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "#567EFC";
  e.currentTarget.style.background = "#fff";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(86,126,252,0.12)";
}
function onBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "#E5E5EA";
  e.currentTarget.style.background = "#FAFAFA";
  e.currentTarget.style.boxShadow = "none";
}

// ─── FieldGroup ───────────────────────────────────────────────────────────────
function FieldGroup({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {icon}
        <label style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#6B6480",
          fontFamily: "DM Sans, sans-serif",
        }}>
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}

// ─── SubmitButton ─────────────────────────────────────────────────────────────
function SubmitButton({ loading, label, gradient }: { loading: boolean; label: string; gradient: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: "100%",
        padding: "13px 0",
        borderRadius: 12,
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        fontSize: 14,
        fontWeight: 700,
        fontFamily: "DM Sans, sans-serif",
        color: "#fff",
        background: gradient
          ? "linear-gradient(135deg, #567EFC 0%, #EB5E5E 100%)"
          : "#0F0A1E",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        opacity: loading ? 0.7 : 1,
        transition: "opacity 0.15s, transform 0.15s",
        boxShadow: gradient
          ? "0 4px 20px rgba(86,126,252,0.30)"
          : "0 4px 16px rgba(0,0,0,0.18)",
      }}
      onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
    >
      {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
      {label}
    </button>
  );
}

// ─── StatusMessage ────────────────────────────────────────────────────────────
function StatusMessage({ error, success }: { error: string | null; success: string | null }) {
  if (!error && !success) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 10,
        fontSize: 13,
        fontFamily: "DM Sans, sans-serif",
        background: error ? "#FFF1F2" : "#F0FDF4",
        color: error ? "#DC2626" : "#16A34A",
        border: `1px solid ${error ? "rgba(220,38,38,0.12)" : "rgba(22,163,74,0.12)"}`,
      }}
    >
      {error
        ? <AlertCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
        : <CheckCircle2 size={14} style={{ marginTop: 1, flexShrink: 0 }} />
      }
      <span>{error ?? success}</span>
    </motion.div>
  );
}
