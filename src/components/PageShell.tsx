"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/faq", label: "FAQ" },
  { href: "/bugs", label: "Bug Tracker" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function PageShell({ children }: { children: React.ReactNode }) {
  const { user, username, signOut, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="min-h-screen flex flex-col" style={{ background: "transparent" }}>
        {/* Nav */}
        <header
          className="sticky top-0 z-40 border-b"
          style={{
            background: "rgba(248,247,255,0.80)",
            backdropFilter: "blur(32px) saturate(180%)",
            WebkitBackdropFilter: "blur(32px) saturate(180%)",
            borderColor: "rgba(86,126,252,0.10)",
            boxShadow: "0 1px 0 rgba(86,126,252,0.06), 0 4px 24px rgba(15,10,30,0.04)",
          }}
        >
          <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span
                className="text-xl font-bold tracking-tight"
                style={{ color: "#0F0A1E" }}
              >
                Lumia
              </span>
              <span
                className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-widest"
                style={{ background: "#EEF2FF", color: "#567EFC" }}
              >
                beta
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{
                    color: pathname === link.href ? "#567EFC" : "#6B6480",
                    background: pathname === link.href ? "rgba(86,126,252,0.08)" : "transparent",
                    border: pathname === link.href ? "0.5px solid rgba(86,126,252,0.18)" : "0.5px solid transparent",
                    transition: "color 0.18s ease, background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
                    boxShadow: pathname === link.href ? "0 1px 4px rgba(86,126,252,0.10)" : "none",
                  }}
                  onMouseEnter={e => {
                    if (pathname !== link.href) {
                      (e.currentTarget as HTMLAnchorElement).style.color = "#0F0A1E";
                      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(86,126,252,0.05)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (pathname !== link.href) {
                      (e.currentTarget as HTMLAnchorElement).style.color = "#6B6480";
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth area */}
            <div className="flex items-center gap-2">
              {!loading && (
                <>
                  {user ? (
                    <div className="relative">
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors hover:bg-[#EEF2FF]"
                        style={{ color: "#0F0A1E" }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: "linear-gradient(135deg, #567EFC, #EB5E5E)" }}
                        >
                          {(username ?? user.email ?? "?")[0].toUpperCase()}
                        </div>
                        <span className="hidden sm:block">{username ?? user.email?.split("@")[0]}</span>
                        <ChevronDown size={14} />
                      </button>

                      <AnimatePresence>
                        {showUserMenu && (
                          <motion.div
                            className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white border shadow-lg py-1 overflow-hidden"
                            style={{ borderColor: "rgba(86,126,252,0.12)" }}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                          >
                            <div className="px-4 py-2 border-b" style={{ borderColor: "rgba(86,126,252,0.08)" }}>
                              <p className="text-xs text-[#A89FC0]">Signed in as</p>
                              <p className="text-sm font-semibold text-[#0F0A1E] truncate">
                                @{username ?? user.email?.split("@")[0]}
                              </p>
                            </div>
                            <button
                              onClick={() => { signOut(); setShowUserMenu(false); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#6B6480] hover:bg-[#F3F4FF] hover:text-[#0F0A1E] transition-colors"
                            >
                              <LogOut size={14} />
                              Sign out
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAuth(true)}
                      className="btn-premium px-4 py-1.5 rounded-full text-sm font-semibold text-white"
                      style={{
                        background: "linear-gradient(135deg, #1a1040 0%, #0F0A1E 100%)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.08)",
                      }}
                    >
                      Sign in
                    </button>
                  )}
                </>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg text-[#6B6480] hover:bg-[#F3F4FF] transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                className="md:hidden border-t px-5 py-3 flex flex-col gap-1"
                style={{ borderColor: "rgba(86,126,252,0.10)", background: "rgba(248,247,255,0.95)" }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      color: pathname === link.href ? "#567EFC" : "#6B6480",
                      background: pathname === link.href ? "#EEF2FF" : "transparent",
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Page content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer
          className="py-10 px-5"
          style={{
            borderTop: "0.5px solid rgba(86,126,252,0.10)",
            background: "linear-gradient(180deg, rgba(248,247,255,0) 0%, rgba(238,242,255,0.35) 100%)",
          }}
        >
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xl font-bold tracking-tight" style={{ color: "#0F0A1E", letterSpacing: "-0.5px" }}>
              Lumia
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#6B6480]">
              <Link href="/privacy" className="hover:text-[#567EFC] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#567EFC] transition-colors">Terms</Link>
              <Link href="/faq" className="hover:text-[#567EFC] transition-colors">FAQ</Link>
              <Link href="/bugs" className="hover:text-[#567EFC] transition-colors">Bug Tracker</Link>
              <Link href="/contact" className="hover:text-[#567EFC] transition-colors">Contact</Link>
            </div>
            <p className="text-xs text-[#A89FC0]">© {new Date().getFullYear()} Lumia. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Auth modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Close user menu on outside click */}
      {showUserMenu && (
        <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
      )}
    </>
  );
}
