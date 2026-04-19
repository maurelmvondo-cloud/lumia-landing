"use client";

/**
 * LiquidGlassNavbar — Apple visionOS / macOS Tahoe faithful reproduction
 *
 * Architecture en couches (bottom → top) :
 *  1. Backdrop blur base         → le matériau verre brut
 *  2. Noise texture              → grain physique du verre (feBlend overlay)
 *  3. Specular gradient          → chemin de lumière principal (diagonal)
 *  4. Top-edge streak            → highlight spéculaire au bord supérieur
 *  5. Bottom inner shadow        → épaisseur du verre (lumière qui traverse)
 *  6. Mouse-tracking spotlight   → reflet vivant qui suit le curseur
 *  7. Border inset               → contour semi-transparent + outer glow
 *  8. Content                    → logo / liens / CTA (z-index le plus haut)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Download } from "lucide-react";

// ─── SVG Filter Definitions ──────────────────────────────────────────────────
// Montés en dehors du DOM visible, référencés par CSS filter: url(#id)
function GlassFilters() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: -1,
      }}
    >
      <defs>
        {/*
         * NOISE TEXTURE FILTER
         * fractalNoise + feBlend(overlay) = grain de verre dépoli.
         * baseFrequency élevée → grain fin, micro-texture.
         * stitchTiles="stitch" évite les coutures sur les tiles.
         * Résultat : surface qui paraît physique, pas plastique.
         */}
        <filter
          id="lg-noise"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.70 0.80"
            numOctaves="4"
            seed="3"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix type="saturate" values="0" in="noise" result="grey" />
          <feBlend in="SourceGraphic" in2="grey" mode="overlay" result="blend" />
          <feComposite in="blend" in2="SourceGraphic" operator="in" />
        </filter>

        {/*
         * EDGE REFRACTION FILTER
         * turbulence basse fréquence → grandes ondes = distorsion de lentille.
         * feDisplacementMap : chaque pixel est déplacé selon R/G du turbulence.
         * scale=5 → déplacement max 5px. Appliqué seulement à la couche bord.
         * Simule le "lensing" optique des bords courbes du verre.
         */}
        <filter
          id="lg-refract"
          x="-8%"
          y="-8%"
          width="116%"
          height="116%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="turbulence"
            baseFrequency="0.006 0.009"
            numOctaves="2"
            seed="15"
            result="wave"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="wave"
            scale="5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/*
         * SPECULAR BLOOM FILTER
         * Gaussian blur léger + color matrix qui amplifie les blancs.
         * Crée un halo doux autour des highlights spéculaires.
         * Sans ce filtre les reflets paraissent plats (SVG 2D).
         */}
        <filter
          id="lg-bloom"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0.05
                    0 1 0 0 0.05
                    0 0 1 0 0.08
                    0 0 0 14 -6"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavChild {
  label: string;
  href: string;
  desc: string;
}
interface NavLink {
  label: string;
  href: string;
  children?: NavChild[];
}

const NAV_LINKS: NavLink[] = [
  { label: "How it works", href: "#how" },
  { label: "Compare", href: "#compare" },
  { label: "Pricing", href: "#pricing" },
  {
    label: "Resources",
    href: "/faq",
    children: [
      { label: "FAQ", href: "/faq", desc: "Answers to common questions" },
      { label: "Documentation", href: "/docs", desc: "Integration guides & API" },
      { label: "Changelog", href: "/changelog", desc: "What shipped this week" },
      { label: "Blog", href: "/blog", desc: "Deep dives & product stories" },
      { label: "Support", href: "/support", desc: "Get help from the team" },
    ],
  },
];

// ─── Nav item with optional hover dropdown ───────────────────────────────────
function NavItem({ link }: { link: NavLink }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const updatePos = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ left: r.left + r.width / 2, top: r.bottom + 12 });
  };

  const onEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    updatePos();
    setOpen(true);
  };
  const onLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "8px 14px",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    color: "rgba(255,255,255,0.84)",
    textDecoration: "none",
    fontFamily: "DM Sans, sans-serif",
    letterSpacing: "-0.2px",
    transition: "color 0.15s, background 0.15s",
    whiteSpace: "nowrap",
    background: open ? "rgba(255,255,255,0.10)" : "transparent",
    border: "none",
    cursor: "pointer",
  };

  const handleHover = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.color = "#fff";
    el.style.background = "rgba(255,255,255,0.10)";
  };
  const handleUnhover = (e: React.MouseEvent) => {
    if (open) return;
    const el = e.currentTarget as HTMLElement;
    el.style.color = "rgba(255,255,255,0.84)";
    el.style.background = "transparent";
  };

  return (
    <div
      ref={triggerRef}
      style={{ position: "relative" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {link.children ? (
        <button
          type="button"
          onMouseEnter={handleHover}
          onMouseLeave={handleUnhover}
          onClick={() => {
            updatePos();
            setOpen((o) => !o);
          }}
          style={triggerStyle}
        >
          {link.label}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.6, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.18s" }}>
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <a
          href={link.href}
          onMouseEnter={handleHover}
          onMouseLeave={handleUnhover}
          style={triggerStyle}
        >
          {link.label}
        </a>
      )}

      {link.children && mounted && pos && open && createPortal(
        (
          <div
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              transform: "translateX(-50%)",
              minWidth: 320,
              padding: 8,
              borderRadius: 18,
              background: "rgba(18,18,22,0.88)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.25)",
              zIndex: 99999,
              animation: "fadeDown 0.18s ease both",
            }}
          >
              {/* Invisible hover bridge so cursor can cross the gap */}
              <div aria-hidden style={{ position: "absolute", top: -12, left: 0, right: 0, height: 12 }} />
              {link.children.map((child) => (
                <a
                  key={child.href}
                  href={child.href}
                  style={{
                    display: "block",
                    padding: "10px 14px",
                    borderRadius: 12,
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: "DM Sans, sans-serif", letterSpacing: "-0.2px" }}>
                    {child.label}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2, fontFamily: "DM Sans, sans-serif" }}>
                    {child.desc}
                  </div>
                </a>
              ))}
          </div>
        ),
        document.body
      )}
    </div>
  );
}

// ─── Liquid Glass Pill (shared glass material) ────────────────────────────────
// Composant réutilisable pour le verre liquide (nav + menu mobile)
function GlassPill({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* COUCHE 1 — Backdrop blur base */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(255,255,255,0.09)",
          backdropFilter: "blur(52px) saturate(220%) brightness(1.12)",
          WebkitBackdropFilter: "blur(52px) saturate(220%) brightness(1.12)",
          pointerEvents: "none",
        }}
      />

      {/* COUCHE 2 — Grain noise (texture physique) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.055,
          filter: "url(#lg-noise)",
          background: "rgba(255,255,255,1)",
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />

      {/* COUCHE 3 — Gradient spéculaire principal (lumière diagonale) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.10) 22%, transparent 48%, transparent 62%, rgba(255,255,255,0.06) 82%, rgba(255,255,255,0.12) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* COUCHE 4 — Bottom inner shadow (épaisseur du verre) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "35%",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.08) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* COUCHE 5 — Border inset + outer glow (appliqué via box-shadow) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          boxShadow: `
            inset 0 0 0 1px rgba(255,255,255,0.24),
            inset 0 0 0 0.5px rgba(255,255,255,0.10),
            0 8px 40px rgba(0,0,0,0.20),
            0 2px 8px rgba(0,0,0,0.12),
            0 0 0 0.5px rgba(0,0,0,0.08)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Contenu */}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ─── Menu Mobile ──────────────────────────────────────────────────────────────
function MobileMenu({
  isOpen,
  onClose,
  onSignIn,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            left: 0,
            right: 0,
            zIndex: 200,
          }}
        >
          <GlassPill style={{ borderRadius: 24 }}>
            {/* Top specular streak */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                left: "8%",
                right: "8%",
                height: 1.5,
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.60) 30%, rgba(255,255,255,0.72) 50%, rgba(255,255,255,0.60) 70%, transparent)",
                filter: "url(#lg-bloom)",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />

            <div style={{ padding: "8px 0" }}>
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  style={{
                    display: "block",
                    padding: "14px 24px",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.88)",
                    textDecoration: "none",
                    letterSpacing: "-0.2px",
                    fontFamily: "DM Sans, sans-serif",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                  }}
                >
                  {link.label}
                </motion.a>
              ))}

              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.10)",
                  margin: "4px 20px",
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "12px 16px",
                }}
              >
                <button
                  onClick={() => {
                    onClose();
                    onSignIn();
                  }}
                  style={{
                    flex: 1,
                    padding: "13px 0",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    color: "rgba(255,255,255,0.88)",
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: "DM Sans, sans-serif",
                    cursor: "pointer",
                    letterSpacing: "-0.2px",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.16)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.10)";
                  }}
                >
                  Sign in
                </button>
                <a
                  href="/api/download"
                  style={{
                    flex: 1,
                    padding: "13px 0",
                    borderRadius: 16,
                    background: "#0A0A0F",
                    border: "none",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: "var(--font-bricolage), sans-serif",
                    cursor: "pointer",
                    letterSpacing: "-0.2px",
                    boxShadow:
                      "0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Download size={14} />
                  Get Lumia
                </a>
              </div>
            </div>
          </GlassPill>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function LiquidGlassNavbar({
  onSignIn,
}: {
  onSignIn?: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  // ── Mouse tracking pour le spotlight spéculaire ──────────────────────────
  // useMotionValue évite les re-renders React à chaque mousemove (60fps+)
  const rawX = useMotionValue(-400);
  const rawY = useMotionValue(-400);

  // Spring physics : le reflet "glisse" avec inertie, pas de saut brusque
  const springX = useSpring(rawX, { stiffness: 150, damping: 24, mass: 0.4 });
  const springY = useSpring(rawY, { stiffness: 150, damping: 24, mass: 0.4 });

  // Transforme la position en offset CSS pour centrer le radial gradient
  const spotX = useTransform(springX, (v) => v - 120);
  const spotY = useTransform(springY, (v) => v - 120);

  // ── Scroll detection ─────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ferme le menu mobile au scroll
  useEffect(() => {
    if (!mobileOpen) return;
    const close = () => setMobileOpen(false);
    window.addEventListener("scroll", close, { passive: true, once: true });
    return () => window.removeEventListener("scroll", close);
  }, [mobileOpen]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = pillRef.current?.getBoundingClientRect();
      if (!rect) return;
      rawX.set(e.clientX - rect.left);
      rawY.set(e.clientY - rect.top);
    },
    [rawX, rawY]
  );

  const handleMouseLeave = useCallback(() => {
    rawX.set(-400);
    rawY.set(-400);
  }, [rawX, rawY]);

  return (
    <>
      {/* SVG filters — injectés une seule fois dans le DOM */}
      <GlassFilters />

      {/* Nav wrapper — fixed, full-width, no background */}
      <nav
        aria-label="Main navigation"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
          // padding réduit au scroll pour coller à la page
          padding: scrolled ? "8px 20px" : "14px 20px",
          transition: "padding 0.45s cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: "none", // laisse passer les clics hors pill
        }}
      >
        {/* Wrapper relatif pour positionner le menu mobile */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 1040,
            pointerEvents: "all",
          }}
        >
          {/* ── PILL PRINCIPALE ── */}
          <div
            ref={pillRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              position: "relative",
              width: "100%",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            {/* COUCHE 1 — Backdrop blur + tint */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: scrolled
                  ? "rgba(255,255,255,0.13)"
                  : "rgba(255,255,255,0.08)",
                backdropFilter: "blur(52px) saturate(220%) brightness(1.12)",
                WebkitBackdropFilter:
                  "blur(52px) saturate(220%) brightness(1.12)",
                transition: "background 0.45s ease",
                pointerEvents: "none",
              }}
            />

            {/* COUCHE 2 — Grain noise */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.05,
                filter: "url(#lg-noise)",
                background: "rgba(255,255,255,1)",
                mixBlendMode: "overlay",
                pointerEvents: "none",
              }}
            />

            {/* COUCHE 3 — Specular gradient (lumière diagonale) */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.11) 20%, transparent 46%, transparent 60%, rgba(255,255,255,0.07) 80%, rgba(255,255,255,0.13) 100%)",
                pointerEvents: "none",
              }}
            />

            {/* COUCHE 4 — Top edge specular streak */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                left: "4%",
                right: "4%",
                height: 1.5,
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.58) 28%, rgba(255,255,255,0.72) 50%, rgba(255,255,255,0.58) 72%, transparent 100%)",
                filter: "url(#lg-bloom)",
                pointerEvents: "none",
              }}
            />

            {/* COUCHE 5 — Bottom inner shadow (épaisseur) */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "38%",
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.07) 100%)",
                pointerEvents: "none",
              }}
            />

            {/* COUCHE 6 — Mouse spotlight (reflet vivant) */}
            <motion.div
              aria-hidden
              style={{
                position: "absolute",
                width: 240,
                height: 240,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)",
                x: spotX,
                y: spotY,
                pointerEvents: "none",
                filter: "url(#lg-bloom)",
              }}
            />

            {/* COUCHE 7 — Border inset + outer glow */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "inherit",
                boxShadow: `
                  inset 0 0 0 1px rgba(255,255,255,0.26),
                  inset 0 0 0 0.5px rgba(255,255,255,0.10),
                  0 8px 40px rgba(0,0,0,0.22),
                  0 2px 8px rgba(0,0,0,0.12),
                  0 0 0 0.5px rgba(0,0,0,0.06)
                `,
                pointerEvents: "none",
              }}
            />

            {/* COUCHE 8 — Contenu */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 26px",
              }}
            >
              {/* Logo */}
              <a
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  textDecoration: "none",
                  flexShrink: 0,
                }}
              >
                <img
                  src="/lumia-logo-white.png"
                  alt="Lumia"
                  style={{ width: 30, height: 30, objectFit: "contain" }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-bricolage), sans-serif",
                    fontWeight: 800,
                    fontSize: 22,
                    color: "#fff",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Lumia
                </span>
              </a>

              {/* Desktop links — centré absolument */}
              <div
                className="lg-nav-desktop"
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                {NAV_LINKS.map((link) => (
                  <NavItem key={link.href} link={link} />
                ))}
              </div>

              {/* Right side */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                {/* Sign in — desktop only */}
                <button
                  className="lg-nav-desktop"
                  onClick={onSignIn}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.26)",
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.88)",
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: "DM Sans, sans-serif",
                    cursor: "pointer",
                    letterSpacing: "-0.2px",
                    transition: "background 0.18s, color 0.18s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.15)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.88)";
                  }}
                >
                  Sign in
                </button>

                {/* Get Lumia CTA */}
                <a
                  href="/api/download"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "11px 20px",
                    borderRadius: 999,
                    background: "#0A0A0F",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "var(--font-bricolage), sans-serif",
                    textDecoration: "none",
                    letterSpacing: "-0.2px",
                    whiteSpace: "nowrap",
                    boxShadow:
                      "0 4px 16px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.08)",
                    transition: "box-shadow 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow =
                      "0 8px 28px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.10)";
                    el.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow =
                      "0 4px 16px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.08)";
                    el.style.transform = "";
                  }}
                >
                  <Download size={14} />
                  Get Lumia
                </a>

                {/* Hamburger mobile */}
                <button
                  className="lg-nav-mobile"
                  onClick={() => setMobileOpen((o) => !o)}
                  aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
                  aria-expanded={mobileOpen}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.22)",
                    background: "rgba(255,255,255,0.09)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 5.5,
                    padding: 0,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.09)";
                  }}
                >
                  <motion.span
                    animate={
                      mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }
                    }
                    transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                    style={{
                      display: "block",
                      width: 18,
                      height: 1.5,
                      background: "#fff",
                      borderRadius: 2,
                    }}
                  />
                  <motion.span
                    animate={
                      mobileOpen
                        ? { opacity: 0, scaleX: 0 }
                        : { opacity: 1, scaleX: 1 }
                    }
                    transition={{ duration: 0.16 }}
                    style={{
                      display: "block",
                      width: 18,
                      height: 1.5,
                      background: "#fff",
                      borderRadius: 2,
                    }}
                  />
                  <motion.span
                    animate={
                      mobileOpen
                        ? { rotate: -45, y: -7 }
                        : { rotate: 0, y: 0 }
                    }
                    transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                    style={{
                      display: "block",
                      width: 18,
                      height: 1.5,
                      background: "#fff",
                      borderRadius: 2,
                    }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Menu mobile — positionné sous la pill, hors du overflow:hidden */}
          <MobileMenu
            isOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
            onSignIn={onSignIn ?? (() => {})}
          />
        </div>
      </nav>

      {/* CSS responsive — injecté inline pour éviter dépendance externe */}
      <style>{`
        /* Desktop : afficher liens + sign in, cacher burger */
        .lg-nav-desktop { display: flex !important; }
        .lg-nav-mobile  { display: none  !important; }

        @media (max-width: 768px) {
          .lg-nav-desktop { display: none  !important; }
          .lg-nav-mobile  { display: flex !important; }
        }

        /* Reduce Transparency — fallback accessibilité */
        @media (prefers-reduced-transparency: reduce) {
          .lg-glass-base {
            background: rgba(20, 20, 30, 0.92) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
        }
      `}</style>
    </>
  );
}
