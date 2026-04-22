"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, AlertCircle, XCircle, Sparkles, Loader2, Menu, X, ShieldCheck, Clock, AlertTriangle, Apple, Zap, FolderOpen, Repeat, Eye, Lightbulb, Target } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import LumiaAnimation, { HeroAnimation, useCurrentFrame } from "@/components/LumiaAnimation";
import { FakeChatInterface } from "@/components/FakeChatInterface";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import LiquidGlassNavbar from "@/components/LiquidGlassNavbar";


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
    --bg: transparent;
    --surface: rgba(255, 255, 255, 0.65);
    --surface-2: rgba(243, 244, 255, 0.55);
    --text: #0F0A1E;
    --text-1: #0F0A1E;
    --text-2: #6B6480;
    --text-3: #A89FC0;
    --border: rgba(255,255,255,0.12);
    --border-2: rgba(255,255,255,0.06);
    --gradient: linear-gradient(135deg, #567EFC 0%, #C2AED4 50%, #EB5E5E 100%);

    /* Multi-layer depth shadows */
    --shadow-card:
      0 1px 2px rgba(0,0,0,0.08),
      0 4px 16px rgba(0,0,0,0.10),
      0 0 0 0.5px rgba(255,255,255,0.06);
    --shadow-lg:
      0 2px 4px rgba(0,0,0,0.12),
      0 8px 24px rgba(0,0,0,0.18),
      0 24px 64px rgba(0,0,0,0.14),
      0 0 0 0.5px rgba(255,255,255,0.08);
    --shadow-dark:
      0 2px 8px rgba(0,0,0,0.20),
      0 8px 32px rgba(0,0,0,0.28),
      0 24px 72px rgba(0,0,0,0.36),
      inset 0 1px 0 rgba(255,255,255,0.06);
    --shadow-glow:
      0 0 0 0.5px rgba(255,255,255,0.15),
      0 4px 24px rgba(0,0,0,0.20),
      0 16px 56px rgba(0,0,0,0.12);
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
  @keyframes shimmer-sweep {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes aurora-local {
    0%,  100% { transform: translate(0,0)       scale(1)    rotate(0deg);   opacity: 0.55; }
    20%        { transform: translate(50px,-70px) scale(1.12) rotate(4deg);  opacity: 0.80; }
    40%        { transform: translate(-25px,35px) scale(0.93) rotate(-3deg); opacity: 0.60; }
    60%        { transform: translate(35px,15px)  scale(1.07) rotate(2deg);  opacity: 0.75; }
    80%        { transform: translate(-40px,-30px) scale(1.04) rotate(-1deg); opacity: 0.65; }
  }
  @keyframes aurora-local-b {
    0%,  100% { transform: translate(0,0)        scale(1)    rotate(0deg);  opacity: 0.50; }
    25%        { transform: translate(-55px,45px) scale(1.08) rotate(-5deg); opacity: 0.72; }
    50%        { transform: translate(40px,-40px) scale(0.96) rotate(3deg);  opacity: 0.58; }
    75%        { transform: translate(-20px,20px) scale(1.05) rotate(-2deg); opacity: 0.68; }
  }

  .reveal {
    opacity: 0;
    transform: translateY(22px);
    transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1);
  }
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .hover-lift {
    transition:
      transform 0.35s cubic-bezier(0.16,1,0.3,1),
      box-shadow 0.35s cubic-bezier(0.16,1,0.3,1);
  }
  .hover-lift:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }

  /* Premium button — spring + shimmer sweep */
  .btn-spring {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    transition:
      transform 0.28s cubic-bezier(0.34,1.56,0.64,1),
      box-shadow 0.28s cubic-bezier(0.16,1,0.3,1),
      background 0.2s ease;
  }
  .btn-spring::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 20%,
      rgba(255,255,255,0.18) 50%,
      transparent 80%
    );
    background-size: 200% 100%;
    background-position: -200% center;
    pointer-events: none;
  }
  .btn-spring:hover::after {
    animation: shimmer-sweep 0.55s ease forwards;
  }
  .btn-spring:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow:
      0 6px 20px rgba(0,0,0,0.18),
      0 2px 8px rgba(0,0,0,0.10);
  }
  .btn-spring:active {
    transform: translateY(0px) scale(0.97);
    transition-duration: 0.09s;
  }
  .blink { animation: blink-cursor 1s infinite; }

  /* ── Hero asymmetric 2-col layout ────────────────────────────────── */
  .hero-orbital-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  .hero-sticker { display: block; }
  @media (max-width: 767px) {
    .hero-sticker { display: none !important; }
    section:has(.hero-sticker) { cursor: auto !important; }
  }

  .hero-orbital-text {
    text-align: center;
    width: 100%;
    max-width: 880px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .hero-orbital-text > * { margin-left: auto; margin-right: auto; }
  .hero-cta-row { justify-content: center; }
  .hero-orbital-cards {
    position: relative;
    width: 100%;
    height: 520px;
  }

  /* Accent word — solid white */
  .accent-word {
    color: #fff;
  }

  /* Badge pulse dot */
  .hero-badge-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #3DCAB1;
    animation: pulse-dot 2s infinite;
    flex-shrink: 0;
  }

  @media (max-width: 900px) {
    .hero-orbital-grid {
      grid-template-columns: 1fr;
      gap: 48px;
    }
    .hero-orbital-text { text-align: center; }
    .hero-cta-row { justify-content: center; }
    .hero-orbital-cards { height: 380px; }
  }
  @media (max-width: 520px) {
    .hero-orbital-cards { height: 300px; }
  }

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
    background: transparent;
    border-top: 0.5px solid rgba(86,126,252,0.06);
    border-bottom: 0.5px solid rgba(86,126,252,0.06);
    padding: 80px 48px;
  }
  .pain-header-rule {
    width: 40px;
    height: 0.5px;
    background: rgba(255,255,255,0.25);
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
    transform: translateY(-6px);
    box-shadow:
      0 2px 8px rgba(0,0,0,0.25),
      0 12px 48px rgba(86,126,252,0.30),
      0 32px 80px rgba(86,126,252,0.14),
      inset 0 1px 0 rgba(86,126,252,0.20);
    border-color: rgba(86,126,252,0.30);
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
    transform: translateY(-4px);
    box-shadow:
      0 8px 32px rgba(86,126,252,0.14),
      0 2px 8px rgba(86,126,252,0.08),
      0 0 0 0.5px rgba(86,126,252,0.18);
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

  /* ── Dark Zone — noise gradient background ─────────────────────────── */
  .dark-zone {
    position: relative;
    background: #fff;
    background-attachment: scroll;

    --text-1: #0A0A0F;
    --text-2: rgba(10,10,15,0.60);
    --text-3: rgba(10,10,15,0.35);
    --border: rgba(0,0,0,0.07);
    --border-hover: rgba(0,0,0,0.12);
    --bg-card: rgba(0,0,0,0.03);
    --bg-elevated: rgba(0,0,0,0.05);
  }

  .noise-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    opacity: 0;
    mix-blend-mode: soft-light;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='1.8' intercept='-0.3'/%3E%3CfeFuncG type='linear' slope='1.8' intercept='-0.3'/%3E%3CfeFuncB type='linear' slope='1.8' intercept='-0.3'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 256px 256px;
    -webkit-mask-image: linear-gradient(180deg, transparent 0, rgba(0,0,0,0.15) 120px, rgba(0,0,0,0.55) 300px, #000 520px, #000 calc(100% - 520px), rgba(0,0,0,0.55) calc(100% - 300px), rgba(0,0,0,0.15) calc(100% - 120px), transparent 100%);
    mask-image: linear-gradient(180deg, transparent 0, rgba(0,0,0,0.15) 120px, rgba(0,0,0,0.55) 300px, #000 520px, #000 calc(100% - 520px), rgba(0,0,0,0.55) calc(100% - 300px), rgba(0,0,0,0.15) calc(100% - 120px), transparent 100%);
  }

  .dark-zone > section,
  .dark-zone > footer,
  .dark-zone > .trust-strip,
  .dark-zone > .container {
    position: relative;
    z-index: 1;
  }

  .dark-zone .section-title,
  .dark-zone .stat-number,
  .dark-zone h2,
  .dark-zone h3 {
    color: #0A0A0F;
  }

  .dark-zone .section-subtitle,
  .dark-zone .bento-card p,
  .dark-zone .step-card p,
  .dark-zone .testimonial-quote,
  .dark-zone .footer-copy,
  .dark-zone .footer-links a,
  .dark-zone .trust-logo-item {
    color: rgba(10,10,15,0.55);
  }

  .dark-zone .section-overline {
    color: #FF7769;
  }

  .dark-zone .bento-card,
  .dark-zone .testimonial-card,
  .dark-zone .spec-card {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.07);
  }

  .dark-zone .bento-card:hover,
  .dark-zone .testimonial-card:hover {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.13);
  }

  .dark-zone .step-num {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.12);
  }

  .dark-zone .steps-grid::before {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), rgba(255,255,255,0.1), transparent);
  }

  .dark-zone .stat-item {
    border-right-color: rgba(255,255,255,0.07);
  }

  .dark-zone .footer {
    border-top-color: rgba(255,255,255,0.07);
  }

  .dark-zone .stats-bar {
    border-top: 1px solid rgba(255,255,255,0.07);
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .dark-zone #how {
    background: rgba(255,255,255,0.03);
    border-top-color: rgba(255,255,255,0.06);
    border-bottom-color: rgba(255,255,255,0.06);
  }

  .dark-zone .cta-glow {
    background: radial-gradient(circle, rgba(139,123,244,0.15) 0%, transparent 70%);
  }

  /* ── Persona cards — hover reveal ─────────────────────────────────── */
  .persona-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.22) !important;
  }
  .persona-card:hover .persona-emoji {
    transform: translate(-50%, -80%) scale(0.7);
    opacity: 0;
  }
  .persona-card:hover .persona-label {
    opacity: 0;
    transform: translateY(8px);
  }
  .persona-card:hover .persona-hover {
    opacity: 1;
  }

  @media (max-width: 960px) {
    .persona-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
  @media (max-width: 520px) {
    .persona-grid {
      grid-template-columns: 1fr !important;
    }
  }

  /* ── Navbar responsive ────────────────────────────────────────────── */
  @media (max-width: 767px) {
    .nav-desktop-links { display: none !important; }
    .nav-desktop-right { display: none !important; }
    .nav-mobile-burger { display: flex !important; align-items: center; justify-content: center; }
  }

  /* ── Hero mockup responsive — declutter on mobile ─────────────────── */
  @media (max-width: 767px) {
    .hero-status-badge { display: none !important; }
    .hero-vault-card { display: none !important; }
    .hero-claude-card { display: none !important; }
  }

  /* ── How it works — flip animation & steps order on mobile ────────── */
  @media (max-width: 767px) {
    .hiw-animation { order: 1; }
    .hiw-steps { order: 2; }
  }

  /* ── Showcase app mockup — compact tabs + single col grids on mobile ─ */
  @media (max-width: 767px) {
    .showcase-tabs { gap: 2px !important; padding: 2px !important; }
    .showcase-tabs button { padding: 6px 10px !important; font-size: 11px !important; }
    .showcase-grid-2col { grid-template-columns: 1fr !important; }
  }

  /* ── Skills feature rows — stack with mockup first on mobile ──────── */
  @media (max-width: 767px) {
    .skills-row {
      grid-template-columns: 1fr !important;
      gap: 28px !important;
    }
    /* Rows where text was first in DOM — mockup goes on top on mobile */
    .skills-row-reversed > div:first-child { order: 2; }
    .skills-row-reversed > div:last-child { order: 1; }
  }

  /* ── Works-on-top-of responsive ───────────────────────────────────── */
  @media (max-width: 860px) {
    .works-grid {
      grid-template-columns: 1fr !important;
      text-align: center;
      gap: 36px !important;
    }
    .works-grid h2 {
      text-align: center;
    }
    .works-row-2 {
      margin-left: 52px !important;
    }
  }

  /* ── Pillar cards ─────────────────────────────────────────────────── */
  @media (max-width: 880px) {
    .pillars-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
  }

  /* ── Persona cards ────────────────────────────────────────────────── */
  .persona-card {
    transition: transform 0.45s cubic-bezier(0.16,1,0.3,1), box-shadow 0.45s ease, border-color 0.45s ease !important;
  }
  .persona-card:hover {
    transform: translateY(-6px);
    border-color: rgba(255,255,255,0.32) !important;
    box-shadow: 0 40px 80px -20px rgba(10,10,15,0.55), 0 16px 36px -14px rgba(10,10,15,0.35), 0 2px 6px rgba(10,10,15,0.12) !important;
  }
  .persona-desc {
    max-height: 0;
    opacity: 0;
    transform: translateY(6px);
    overflow: hidden;
    transition: max-height 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease, transform 0.45s cubic-bezier(0.16,1,0.3,1);
  }
  .persona-card:hover .persona-desc {
    max-height: 200px;
    opacity: 1;
    transform: translateY(0);
  }
  .persona-title {
    transition: transform 0.45s cubic-bezier(0.16,1,0.3,1);
  }
  .persona-card:hover .persona-title {
    transform: translateY(-2px);
  }

  @media (max-width: 980px) {
    .persona-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
  @media (max-width: 520px) {
    .persona-grid {
      grid-template-columns: 1fr !important;
    }
    .persona-card {
      aspect-ratio: 5 / 3 !important;
    }
  }

  /* ── Glass slider — custom styling ────────────────────────────────── */
  .glass-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 8px;
    background: transparent;
    cursor: pointer;
    outline: none;
    margin: 0;
  }
  .glass-slider::-webkit-slider-runnable-track {
    height: 8px;
    border-radius: 999px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.18);
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.10);
  }
  .glass-slider::-moz-range-track {
    height: 8px;
    border-radius: 999px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.18);
  }
  .glass-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.20), 0 0 0 4px rgba(255,255,255,0.14);
    margin-top: -8px;
    cursor: grab;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }
  .glass-slider::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.20), 0 0 0 4px rgba(255,255,255,0.14);
    cursor: grab;
  }
  .glass-slider:hover::-webkit-slider-thumb {
    box-shadow: 0 3px 10px rgba(0,0,0,0.25), 0 0 0 6px rgba(255,255,255,0.20);
    transform: scale(1.05);
  }
  .glass-slider:active::-webkit-slider-thumb {
    cursor: grabbing;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25), 0 0 0 8px rgba(255,255,255,0.22);
  }

  /* ── Friction calculator responsive ──────────────────────────────── */
  @media (max-width: 860px) {
    .reveal > div[style*="grid-template-columns: 1fr 1.15fr"] {
      grid-template-columns: 1fr !important;
    }
    .reveal > div[style*="grid-template-columns: 1fr 1.15fr"] > div[style*="grid-row: span 2"] {
      grid-row: auto !important;
    }
  }

  @media (max-width: 767px) {
    /* Mode toggle — fit on screen, center */
    .calc-mode-toggle {
      margin-left: auto !important;
      margin-right: auto !important;
    }
    .calc-mode-toggle button {
      padding: 9px 18px !important;
      font-size: 13px !important;
    }
    /* Glass cards — reduce padding, tighten radius */
    .calc-glass-card {
      padding: 22px 20px !important;
      border-radius: 24px !important;
    }
    /* Quality selector buttons — stack title + subtitle vertically */
    .calc-quality-btn {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 4px !important;
      padding: 13px 16px !important;
    }
    .calc-quality-btn > span:first-child {
      font-size: 14px !important;
    }
    .calc-quality-btn > span:last-child {
      font-size: 11.5px !important;
      text-align: left !important;
    }
  }

  /* ── Feature accordion responsive ─────────────────────────────────── */
  @media (max-width: 768px) {
    .feature-accordion {
      flex-direction: column !important;
      height: auto !important;
      max-height: none !important;
      min-height: 0 !important;
      overflow: visible !important;
      gap: 10px !important;
    }
    .feature-accordion > div {
      flex: unset !important;
      min-height: auto !important;
      aspect-ratio: auto !important;
    }
    /* Expanded card — full content, comfortable height */
    .feature-card-expanded {
      min-height: 260px !important;
      padding: 28px 24px !important;
    }
    /* Collapsed cards — horizontal row, tappable, readable */
    .feature-card-collapsed {
      flex-direction: row !important;
      justify-content: flex-start !important;
      align-items: center !important;
      padding: 18px 22px !important;
      gap: 16px !important;
      min-height: 68px !important;
    }
    /* Icon tile inside collapsed — reset margin */
    .feature-card-collapsed > div:first-child {
      margin-bottom: 0 !important;
    }
    /* Label — horizontal, bold, readable */
    .feature-card-collapsed span {
      writing-mode: horizontal-tb !important;
      transform: none !important;
      font-size: 20px !important;
      letter-spacing: -0.3px !important;
      flex: 1 !important;
      line-height: 1.15 !important;
      display: block !important;
      align-items: center !important;
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

// ─── Skills Data ──────────────────────────────────────────────────────────────
const SKILLS_DATA = {
  Content:  ["TikTok Video Script", "LinkedIn Post", "Newsletter", "YouTube Script", "Instagram Reel", "X Thread", "Podcast Script", "Blog Post Outline"],
  Business: ["Cold Email", "Landing Page Copy", "Facebook Ad", "Email Sequence", "Case Study", "User Persona", "Pitch Deck Narrative", "Product Launch Brief"],
  Code:     ["Code Review", "API Documentation", "Refactor Plan", "Bug Report", "Tech Spec", "PR Description", "Test Coverage Plan"],
  Creative: ["Short Story Hook", "Brand Naming", "Ad Concept", "Tagline Generator", "Creative Brief", "Mood Board Copy"],
  Personal: ["Weekly Review", "Goal Setting", "Decision Framework", "Learning Plan"],
  Research: ["Competitive Analysis", "Market Overview", "Literature Summary"],
} as const;
type SkillCategory = keyof typeof SKILLS_DATA;
const SKILL_CATEGORIES = Object.keys(SKILLS_DATA) as SkillCategory[];

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
          style={{ flex: 1, minWidth: 200, padding: "12px 16px", borderRadius: 14, border: "1.5px solid var(--border)", background: "#fff", fontSize: 14, fontFamily: "DM Sans, sans-serif", color: "var(--text)", outline: "none" }}
        />
        <button type="submit" disabled={status === "loading"}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 20px", borderRadius: 14, background: "#000", color: "#fff", border: "0.5px solid rgba(255,255,255,0.2)", cursor: "pointer", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>
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
          style={{ width: "100%", padding: "13px 18px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 14, fontFamily: "DM Sans, sans-serif", outline: "none" }}
        />
        <button type="submit" disabled={status === "loading"}
          className="btn-spring"
          style={{ width: "100%", padding: "14px 24px", borderRadius: 14, background: "#fff", color: "#0F0A1E", border: "none", cursor: "pointer", fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showResourcesMenu, setShowResourcesMenu] = useState(false);
  const { user, username, signOut, loading } = useAuth();

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
        .nav-link { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.85); background: none; border: none; cursor: pointer; transition: color 0.2s; padding: 6px 0; letter-spacing: -0.2px; }
        .nav-link:hover { color: #fff; }
        .nav-pill-inner {
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
        }
      `}</style>

      {/* Outer nav — fixed full-width transparent wrapper */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "10px 24px", transition: "padding 0.35s cubic-bezier(0.16,1,0.3,1)" }}>

        {/* Liquid glass nav pill */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            height: 64,
            maxWidth: 1040,
            margin: "0 auto",
            padding: "0 26px",
            position: "relative",
            background: scrolled
              ? "rgba(255,255,255,0.18)"
              : "rgba(255,255,255,0.10)",
            backdropFilter: "blur(48px) saturate(200%) brightness(1.08)",
            WebkitBackdropFilter: "blur(48px) saturate(200%) brightness(1.08)",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.22)",
            boxShadow: scrolled
              ? "inset 0 1px 0 rgba(255,255,255,0.40), inset 0 -1px 0 rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)"
              : "inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -1px 0 rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.14)",
            transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
          }}>

          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <img src="/lumia-logo-white.png" alt="Lumia" style={{ width: 30, height: 30, objectFit: "contain" }} />
            <span style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: "-0.5px" }}>Lumia</span>
          </a>

          {/* Desktop nav — centered */}
          <div className="nav-desktop-links" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", alignItems: "center", gap: 8, display: "flex" }}>
            {[["How it works", "how"], ["Compare", "compare"], ["Pricing", "pricing"]].map(([label, id]) => (
              <button key={id} className="nav-link" onClick={() => scrollTo(id)}
                style={{ padding: "8px 14px", borderRadius: 10 }}>{label}</button>
            ))}
            {/* Resources dropdown */}
            <div style={{ position: "relative" }}
              onMouseEnter={() => setShowResourcesMenu(true)}
              onMouseLeave={() => setShowResourcesMenu(false)}>
              <button className="nav-link" style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 10 }}>
                Resources
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.55, marginTop: 1 }}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <AnimatePresence>
                {showResourcesMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 10px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(255,255,255,0.96)",
                      backdropFilter: "blur(24px) saturate(180%)",
                      WebkitBackdropFilter: "blur(24px) saturate(180%)",
                      border: "1px solid rgba(10,10,15,0.08)",
                      borderRadius: 16,
                      boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                      minWidth: 220,
                      overflow: "hidden",
                      zIndex: 200,
                      padding: 6,
                    }}>
                    {[
                      { href: "/faq", label: "FAQ", icon: "💬" },
                      { href: "/bugs", label: "Bug Tracker", icon: "🐛" },
                      { href: "/contact", label: "Contact", icon: "✉️" },
                      { href: "/privacy", label: "Privacy Policy", icon: "🔒" },
                      { href: "/terms", label: "Terms of Service", icon: "📄" },
                    ].map(({ href, label, icon }) => (
                      <a key={href} href={href}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "11px 14px",
                          textDecoration: "none",
                          fontSize: 14,
                          fontWeight: 600,
                          color: "rgba(10,10,15,0.75)",
                          fontFamily: "DM Sans, sans-serif",
                          borderRadius: 10,
                          transition: "background 0.15s, color 0.15s",
                          letterSpacing: "-0.2px",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(86,126,252,0.08)"; e.currentTarget.style.color = "#0A0A0F"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(10,10,15,0.75)"; }}>
                        <span style={{ fontSize: 16 }}>{icon}</span>
                        {label}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop right side */}
          <div className="nav-desktop-right" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {!loading && (
              user ? (
                <div style={{ position: "relative" }}>
                  <button onClick={() => setShowUserMenu(!showUserMenu)}
                    style={{ display: "flex", alignItems: "center", gap: 8, background: scrolled ? "rgba(86,126,252,0.15)" : "rgba(86,126,252,0.08)", border: "0.5px solid rgba(86,126,252,0.18)", borderRadius: 14, padding: "6px 12px", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, color: scrolled ? "rgba(255,255,255,0.85)" : "var(--text)", transition: "all 0.3s" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg, #567EFC, #EB5E5E)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                      {(username ?? user.email ?? "?")[0].toUpperCase()}
                    </div>
                    {username ?? user.email?.split("@")[0]}
                  </button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 98 }} onClick={() => setShowUserMenu(false)} />
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                          style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 99, background: "#fff", border: "0.5px solid rgba(86,126,252,0.12)", borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.10)", minWidth: 180, overflow: "hidden" }}>
                          <div style={{ padding: "10px 16px 8px", borderBottom: "0.5px solid rgba(86,126,252,0.08)" }}>
                            <p style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "DM Sans, sans-serif", margin: 0 }}>Signed in as</p>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", fontFamily: "DM Sans, sans-serif", margin: "2px 0 0" }}>@{username ?? user.email?.split("@")[0]}</p>
                          </div>
                          <button onClick={() => { signOut(); setShowUserMenu(false); }}
                            style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", fontSize: 13, color: "var(--text-2)", fontFamily: "DM Sans, sans-serif", cursor: "pointer" }}>
                            Sign out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button onClick={() => setShowAuthModal(true)}
                  style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 600, padding: "9px 18px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.90)", cursor: "pointer", transition: "all 0.25s", letterSpacing: "-0.2px" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.90)"; }}>
                  Sign in
                </button>
              )
            )}
            <a href="#waitlist"
              className="btn-spring"
              style={{ display: "flex", alignItems: "center", gap: 8, background: "#0A0A0F", color: "#fff", borderRadius: 14, padding: "11px 20px", cursor: "pointer", fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", textDecoration: "none", letterSpacing: "-0.2px", boxShadow: "0 4px 14px rgba(0,0,0,0.18)", border: "0.5px solid rgba(255,255,255,0.18)" }}>
              Join waitlist
            </a>
          </div>

          {/* Mobile burger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="nav-mobile-burger"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text)", padding: 6, transition: "color 0.3s", display: "none" }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            style={{ position: "fixed", top: 72, left: 0, right: 0, zIndex: 99, background: "rgba(11,8,24,0.96)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "20px 24px 24px", borderBottom: "0.5px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 16 }}>
            {[["How it works", "how"], ["Compare", "compare"], ["Pricing", "pricing"]].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{ textAlign: "left", background: "none", border: "none", fontSize: 17, fontWeight: 500, color: "rgba(255,255,255,0.80)", cursor: "pointer", fontFamily: "DM Sans, sans-serif", padding: "4px 0" }}>{label}</button>
            ))}
            <div style={{ height: "0.5px", background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />
            {[
              { href: "/faq", label: "FAQ" },
              { href: "/bugs", label: "Bug Tracker" },
              { href: "/contact", label: "Contact" },
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/terms", label: "Terms of Service" },
            ].map(({ href, label }) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}
                style={{ textAlign: "left", fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.45)", fontFamily: "DM Sans, sans-serif", padding: "2px 0", textDecoration: "none" }}>{label}</a>
            ))}
            {!loading && !user && (
              <button onClick={() => { setShowAuthModal(true); setMenuOpen(false); }}
                style={{ textAlign: "left", background: "none", border: "none", fontSize: 17, fontWeight: 600, color: "#8BA8FD", cursor: "pointer", fontFamily: "DM Sans, sans-serif", padding: "4px 0" }}>
                Sign in
              </button>
            )}
            <a href="#waitlist"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#000", color: "#fff", borderRadius: 14, padding: "14px 24px", fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 15, marginTop: 4, textDecoration: "none", border: "0.5px solid rgba(255,255,255,0.18)" }}>
              Join waitlist
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
interface ErrorSticker { id: number; x: number; y: number; opacity: number; }

function HeroSection() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const [showDemo, setShowDemo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stickers, setStickers] = useState<ErrorSticker[]>([]);
  const lastSpawnRef = useRef(0);
  const counterRef = useRef(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const now = Date.now();
    if (now - lastSpawnRef.current < 50) return; // ~20 stickers / sec
    lastSpawnRef.current = now;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++counterRef.current;
    setStickers(prev => [...prev.slice(-9), { id, x, y, opacity: 1 }]);
    // fade out after 0.75s
    setTimeout(() => {
      setStickers(prev => prev.map(s => s.id === id ? { ...s, opacity: 0 } : s));
      setTimeout(() => setStickers(prev => prev.filter(s => s.id !== id)), 300);
    }, 750);
  };

  // Close modal on Escape + prevent body scroll when open
  useEffect(() => {
    if (!showDemo) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowDemo(false); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [showDemo]);

  return (
    <>
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "120px clamp(20px, 5vw, 64px) 80px",
        position: "relative",
        overflow: "hidden",
        background: "transparent",
      }}
      onMouseMove={handleMouseMove}
    >

      {/* Error sticker trail — desktop only */}
      {stickers.map(s => (
        <div key={s.id} className="hero-sticker" style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `translate(${s.x + 12}px, ${s.y + 12}px)`,
          pointerEvents: "none",
          zIndex: 10,
          opacity: s.opacity,
          transition: "opacity 0.35s ease",
          userSelect: "none",
          fontFamily: "'Arial', sans-serif",
          fontSize: 11,
        }}>
          {/* Windows 98 error popup */}
          <div style={{ width: 200, boxShadow: "2px 2px 0 #000, inset 1px 1px 0 #fff, inset -1px -1px 0 #808080", border: "1px solid #000", background: "#c0c0c0" }}>
            {/* Title bar */}
            <div style={{ background: "linear-gradient(90deg, #000080, #1084d0)", padding: "3px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 11, letterSpacing: 0 }}>Error</span>
              <div style={{ width: 16, height: 14, background: "#c0c0c0", border: "1px solid #000", boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, lineHeight: 1 }}>✕</div>
            </div>
            {/* Body */}
            <div style={{ padding: "10px 12px 8px", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ fontSize: 22, lineHeight: 1 }}>🚨</span>
              <p style={{ margin: 0, fontSize: 11, lineHeight: 1.4, color: "#000" }}>Your AI is prompting<br />without your vision.</p>
            </div>
            {/* Button */}
            <div style={{ padding: "0 12px 10px", textAlign: "center" }}>
              <div style={{ display: "inline-block", background: "#c0c0c0", border: "1px solid #000", boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080", padding: "3px 20px", fontSize: 11, cursor: "default" }}>WTF</div>
            </div>
          </div>
        </div>
      ))}

      {/* Hero bg — clipped to this section */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <picture style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <source media="(min-width: 768px)" srcSet="/hero-bg-desktop.jpg" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero-bg.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
        </picture>
        {/* dark scrim */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.38)" }} />
        {/* fade to white at bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "20%", background: "linear-gradient(to bottom, transparent, #fff)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, width: "100%", margin: "0 auto" }}>
        <div className="hero-orbital-grid">

          {/* ── LEFT: text ─────────────────────────────────────────────── */}
          <div className="hero-orbital-text">

            {/* H1 */}
            <h1 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(40px, 4.5vw, 68px)", letterSpacing: "-2.5px", lineHeight: 0.96, color: "#fff", margin: "0 0 24px", animation: "fadeUp 0.7s 0.08s ease both" }}>
              Because you&apos;re supposed<br />to DREAM it.<br /><span style={{ position: "relative", display: "inline-block" }}>
                  Not prompt it.
                  <svg viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", left: "-2%", width: "104%", top: "52%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                    <path d="M 4,7 C 40,4.5 80,9.5 130,7 C 180,4.5 230,9 296,7" stroke="#d4ff01" strokeWidth="4" strokeLinecap="round" fill="none" />
                  </svg>
                </span>
            </h1>

            {/* Subtitle */}
            <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 500, fontSize: "clamp(1rem, 1.15vw, 1.15rem)", color: "rgba(255,255,255,0.80)", margin: "0 0 36px", lineHeight: 1.65, animation: "fadeUp 0.7s 0.15s ease both", maxWidth: 440 }}>
              <strong style={{ fontWeight: 700, color: "#fff" }}>Raw idea in. Expert prompt out.</strong> — meet the overlay designed to hold your vision and make sure your AI tools never drift from it.
            </p>

            {/* CTAs */}
            <div className="hero-cta-row" style={{ display: "flex", flexWrap: "wrap", gap: 28, animation: "fadeUp 0.7s 0.25s ease both", alignItems: "center" }}>
              <a href="#waitlist" style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: "clamp(15px, 1.1vw, 17px)", color: "#fff", textDecoration: "none", letterSpacing: "-0.2px", borderBottom: "1.5px solid transparent", paddingBottom: 2, transition: "border-color 0.15s ease" }}
                onMouseEnter={e => (e.currentTarget.style.borderBottomColor = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.borderBottomColor = "transparent")}>
                Join the waitlist
              </a>
              <button onClick={() => { document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }) }} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 600, fontSize: "clamp(14px, 1vw, 16px)", color: "rgba(255,255,255,0.70)", letterSpacing: "-0.2px", borderBottom: "1.5px solid transparent", paddingBottom: 2, transition: "border-color 0.15s ease, color 0.15s ease" }}
                onMouseEnter={e => { e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.70)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderBottomColor = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.70)"; }}>
                See how it works
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>

    {/* Demo video modal */}
    <AnimatePresence>
      {showDemo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => setShowDemo(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(8,6,20,0.75)",
            backdropFilter: "blur(16px) saturate(140%)",
            WebkitBackdropFilter: "blur(16px) saturate(140%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(16px, 3vw, 40px)",
          }}
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 960,
              maxHeight: "92vh",
              background: "#0A0814",
              borderRadius: 28,
              overflow: "hidden",
              overflowY: "auto",
              boxShadow: "0 40px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowDemo(false)}
              aria-label="Close demo"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 3,
                width: 40,
                height: 40,
                borderRadius: 14,
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px) saturate(140%)",
                WebkitBackdropFilter: "blur(12px) saturate(140%)",
                border: "1px solid rgba(255,255,255,0.18)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.20)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; }}
            >
              <X size={18} color="#fff" />
            </button>

            {/* ── HEADER — branding + tagline ── */}
            <div style={{
              padding: "clamp(28px, 4vw, 40px) clamp(28px, 4vw, 44px) clamp(20px, 3vw, 28px)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              background: "linear-gradient(180deg, rgba(86,126,252,0.10) 0%, transparent 100%)",
            }}>
              {/* Logo + eyebrow */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <img src="/lumia-logo-white.png" alt="Lumia" style={{ width: 28, height: 28, objectFit: "contain" }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)", fontFamily: "DM Sans, sans-serif" }}>
                  See Lumia in action
                </span>
              </div>

              {/* Headline */}
              <h2 style={{
                fontFamily: "var(--font-bricolage), sans-serif",
                fontWeight: 800,
                fontSize: "clamp(26px, 3.5vw, 38px)",
                letterSpacing: "-1px",
                lineHeight: 1.1,
                color: "#fff",
                margin: "0 0 10px",
              }}>
                Think once. <span className="accent-word">Execute everywhere.</span>
              </h2>

              {/* Tagline */}
              <p style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.65)",
                fontFamily: "DM Sans, sans-serif",
                margin: 0,
                maxWidth: 640,
              }}>
                One shortcut. Your full project context injected into Claude, ChatGPT, or Gemini — instantly.
              </p>
            </div>

            {/* ── VIDEO ── */}
            <div style={{
              position: "relative",
              aspectRatio: "16 / 10",
              background: "#0A0814",
              width: "100%",
              flexShrink: 0,
            }}>
              <video
                ref={videoRef}
                src="/demo.mp4"
                controls
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  background: "#0A0814",
                }}
              />
            </div>

            {/* ── FOOTER — what's inside ── */}
            <div style={{
              padding: "clamp(24px, 3.5vw, 36px) clamp(28px, 4vw, 44px) clamp(28px, 4vw, 40px)",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              background: "linear-gradient(180deg, transparent 0%, rgba(86,126,252,0.06) 100%)",
            }}>
              <p style={{
                fontSize: 14.5,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.72)",
                fontFamily: "DM Sans, sans-serif",
                margin: "0 0 20px",
              }}>
                Lumia is the persistent context layer that sits between you and every AI you already use. No more re-briefing. No more pasting the same project context 11 times a day. Drop a thought, hit the shortcut, and Lumia builds a structured, context-loaded prompt — tailored to the exact model you&apos;re talking to.
              </p>

              {/* Feature bullets */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                gap: 12,
              }}>
                {[
                  { emoji: "⚡", label: "100+ built-in skills", desc: "Cold email, landing page, code review — auto-detected." },
                  { emoji: "🗂️", label: "Vault-powered context", desc: "Your docs, tone, decisions — injected automatically." },
                  { emoji: "🔁", label: "Works on every AI", desc: "Claude, ChatGPT, Gemini, Perplexity. No lock-in." },
                  { emoji: "🧠", label: "Reverse prompting", desc: "Lumia asks the right questions before it builds." },
                  { emoji: "👁️", label: "Full transparency", desc: "See exactly what context was used. Override anything." },
                  { emoji: "🎯", label: "Precision targeting", desc: "Route with #template or @document for laser-focused prompts." },
                ].map(item => (
                  <div key={item.label} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "4px 0",
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.2 }}>{item.emoji}</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "DM Sans, sans-serif", margin: 0, letterSpacing: "-0.2px" }}>{item.label}</p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: "DM Sans, sans-serif", margin: "2px 0 0", lineHeight: 1.45 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
                <a href="#waitlist" className="btn-spring" style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#000",
                  color: "#fff",
                  borderRadius: 14,
                  padding: "12px 24px",
                  fontFamily: "var(--font-bricolage), sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  border: "0.5px solid rgba(255,255,255,0.25)",
                  letterSpacing: "-0.2px",
                }}>
                  <ArrowRight size={14} />
                  Join the waitlist
                </a>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", fontFamily: "DM Sans, sans-serif" }}>
                  macOS 13+ · Free to try · No extension needed
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
            <span style={{ fontSize: 11, fontWeight: 700, color: "#22C55E", background: "#F0FDF4", padding: "2px 8px", borderRadius: 14, flexShrink: 0 }}>{row.gain}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Consultant Section ───────────────────────────────────────────────────────
const CONSULTANT_TABS = ["Dashboard", "Vault", "Templates"] as const;
type ConsultantTab = typeof CONSULTANT_TABS[number];

// ── Custom Lumia icons — same visual family as the logo ──
type LumiaIconProps = { size?: number; color?: string };

const IconSkills = ({ size = 24, color = "#567EFC" }: LumiaIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M13 2.5L14.5 8.5L20.5 10L14.5 11.5L13 17.5L11.5 11.5L5.5 10L11.5 8.5L13 2.5Z" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    <circle cx="6" cy="18" r="1.6" fill={color}/>
    <circle cx="19" cy="19" r="1" fill={color} fillOpacity="0.55"/>
  </svg>
);

const IconKnows = ({ size = 24, color = "#567EFC" }: LumiaIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3.5" y="5" width="17" height="14" rx="3" stroke={color} strokeWidth="1.8"/>
    <path d="M3.5 9H20.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="7" cy="7" r="0.7" fill={color}/>
    <circle cx="9.5" cy="7" r="0.7" fill={color} fillOpacity="0.55"/>
    <path d="M9 14L11 12L13 14L15 12" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 14L17 16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconFollows = ({ size = 24, color = "#567EFC" }: LumiaIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3.5" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.8"/>
    <path d="M12 3.5C16.7 3.5 20.5 7.3 20.5 12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M12 20.5C7.3 20.5 3.5 16.7 3.5 12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="20.5" cy="12" r="1.6" fill={color}/>
    <circle cx="3.5" cy="12" r="1.6" fill={color}/>
  </svg>
);

const IconTransparency = ({ size = 24, color = "#567EFC" }: LumiaIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M2.5 12C4.5 7.5 8 5.5 12 5.5C16 5.5 19.5 7.5 21.5 12C19.5 16.5 16 18.5 12 18.5C8 18.5 4.5 16.5 2.5 12Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3.8" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="1.3" fill={color}/>
    <circle cx="15" cy="9" r="1" fill="#fff"/>
  </svg>
);

const IconSmart = ({ size = 24, color = "#567EFC" }: LumiaIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3C8.4 3 5.5 5.9 5.5 9.5C5.5 11.5 6.4 13.1 7.5 14.2V17H16.5V14.2C17.6 13.1 18.5 11.5 18.5 9.5C18.5 5.9 15.6 3 12 3Z" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M9.5 20H14.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M10.5 22H13.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="12" cy="9.5" r="1.8" fill={color}/>
  </svg>
);

const IconPrecision = ({ size = 24, color = "#567EFC" }: LumiaIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="2" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="0.8" fill={color}/>
    <path d="M12 1.5V4M12 20V22.5M1.5 12H4M20 12H22.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

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
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const [expandedCard, setExpandedCard] = useState(0);

  const featureCards = [
    { Icon: IconSkills, short: "Skills", title: "100+ Skills built-in", desc: "TikTok scripts, cold emails, landing pages, code reviews — Lumia auto-detects what you need and applies the right expert prompt template. Zero setup.", accent: "#567EFC" },
    { Icon: IconKnows, short: "Knows you", title: "Knows your project", desc: "Your Vault stores docs, tone, past decisions. Lumia pulls the right context automatically — no briefing needed.", accent: "#567EFC" },
    { Icon: IconFollows, short: "Follows you", title: "Follows you across every AI", desc: "Claude, ChatGPT, Gemini, Perplexity — your consultant doesn't lose context on switch.", accent: "#567EFC" },
    { Icon: IconTransparency, short: "Transparency", title: "Full transparency, no black box", desc: "See exactly which context was used. Override anything before it fires.", accent: "#567EFC" },
    { Icon: IconSmart, short: "Smart", title: "Smart clarifying questions", desc: "Lumia asks the right questions before building — so the output actually fits your context.", accent: "#567EFC" },
    { Icon: IconPrecision, short: "Precision", title: "Precision context targeting", desc: "Point to any saved prompt template with #template or any doc with @document. Lumia routes exactly what the AI needs — the right structure, the right source.", accent: "#567EFC" },
  ];

  return (
    <section style={{ padding: "96px clamp(20px, 5vw, 80px)", background: "transparent", position: "relative", overflow: "hidden" }}>
      {/* Aurora blobs */}
      <div style={{ position: "absolute", top: "-10%", left: "20%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(86,126,252,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-5%", right: "10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(194,174,212,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(32px, 4.5vw, 52px)", letterSpacing: "-2px", color: "#0A0A0F", lineHeight: 1.1, margin: "0 0 16px" }}>
            One shortcut. Full context.<br />Every AI.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(10,10,15,0.45)", fontFamily: "DM Sans, sans-serif", maxWidth: 460, margin: "0 auto" }}>
            Your consultant, always on call.
          </p>
        </div>

        {/* ── Accordion feature cards — 6 cards ── */}
        <div className="feature-accordion" style={{ display: "flex", gap: 8, height: 420, minHeight: 420, maxHeight: 420, overflow: "hidden", marginBottom: 14 }}>
          {featureCards.map((card, i) => {
            const isExpanded = expandedCard === i;
            return (
              <div
                key={i}
                className={isExpanded ? "feature-card-expanded" : "feature-card-collapsed"}
                onClick={() => setExpandedCard(i)}
                style={{
                  flex: isExpanded ? 4 : 0.7,
                  background: isExpanded ? "#0A0A0F" : "rgba(10,10,15,0.92)",
                  border: "none",
                  borderRadius: 20,
                  overflow: "hidden",
                  cursor: isExpanded ? "default" : "pointer",
                  transition: "flex 0.5s cubic-bezier(0.16,1,0.3,1), background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: isExpanded ? "flex-start" : "flex-end",
                  alignItems: isExpanded ? "flex-start" : "center",
                  padding: isExpanded ? "32px 32px" : "0 0 28px",
                  boxShadow: isExpanded ? "0 8px 40px rgba(0,0,0,0.35)" : "none",
                }}
                onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = "#0A0A0F"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.25)"; }}
                onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = "rgba(10,10,15,0.92)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
              >
                {isExpanded ? (
                  /* ── Expanded: full content ── */
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8FA7FF", marginBottom: 10, fontFamily: "DM Sans, sans-serif" }}>{card.title}</div>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.65, margin: 0, maxWidth: 380 }}>{card.desc}</p>
                    <div style={{ marginTop: "auto", paddingTop: 24, width: "100%" }}>
                      <div style={{ height: 2, borderRadius: 1, background: `linear-gradient(90deg, ${card.accent}, transparent)`, width: "50%", opacity: 0.5 }} />
                    </div>
                  </>
                ) : (
                  /* ── Collapsed: big vertical label ── */
                  <span style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    transform: "rotate(180deg)",
                    fontSize: "clamp(28px, 3.5vw, 38px)",
                    fontWeight: 800,
                    letterSpacing: "-1px",
                    color: "#fff",
                    fontFamily: "var(--font-bricolage), sans-serif",
                    whiteSpace: "nowrap",
                    lineHeight: 1,
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.3s",
                  }}>{card.short}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Full-width showcase card — mirrors the real Lumia app ── */}
        <div style={{
          background: "linear-gradient(180deg, #F5F4F3 0%, #EFEEEC 100%)",
          border: "none",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 12px 48px rgba(0,0,0,0.14)",
          height: 600,
          display: "flex",
          flexDirection: "column",
        }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}>

          {/* Showcase header — app chrome */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}>
            {/* Left: Lumia AI branding */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: "#fff", border: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(10,10,15,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0F", fontFamily: "DM Sans, sans-serif" }}>Lumia AI</span>
            </div>
            {/* Center: pill tabs */}
            <div className="showcase-tabs" style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.70)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 14, padding: 3, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.90)" }}>
              {CONSULTANT_TABS.map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab); setIsPaused(true); }} style={{
                  padding: "6px 16px",
                  fontSize: 12,
                  fontWeight: activeTab === tab ? 700 : 500,
                  color: activeTab === tab ? "#0A0A0F" : "rgba(10,10,15,0.45)",
                  background: activeTab === tab ? "#fff" : "transparent",
                  border: "none",
                  borderRadius: 14,
                  cursor: "pointer",
                  fontFamily: "DM Sans, sans-serif",
                  transition: "all 0.2s",
                  boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}>{tab}</button>
              ))}
            </div>
            {/* Right: logout icon */}
            <div style={{ width: 26, height: 26, borderRadius: 8, background: "#fff", border: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(10,10,15,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <AnimatePresence mode="wait">
            {activeTab === "Dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} style={{ height: "100%", overflow: "auto" }}>
                <div style={{ padding: "4px 24px 28px" }}>
                  {/* Eyebrow + title */}
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#567EFC", margin: "0 0 6px", fontFamily: "DM Sans, sans-serif" }}>DASHBOARD</p>
                  <h4 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 24, color: "#0A0A0F", margin: "0 0 20px", letterSpacing: "-0.6px" }}>Recent activity</h4>

                  {/* 3 stat cards horizontal */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
                    {[
                      {
                        label: "Prompts generated",
                        value: "317",
                        color: "#567EFC",
                        bg: "rgba(86,126,252,0.12)",
                        icon: (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#567EFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L14.09 8.26L20.97 9.27L16 14.14L17.18 21.02L12 17.77L6.82 21.02L8 14.14L3.03 9.27L9.91 8.26L12 2Z" />
                          </svg>
                        ),
                      },
                      {
                        label: "Words added",
                        value: "130,748",
                        color: "#FF7769",
                        bg: "rgba(255,119,105,0.12)",
                        icon: (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF7769" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" y1="7" x2="18" y2="7" />
                            <line x1="4" y1="12" x2="20" y2="12" />
                            <line x1="4" y1="17" x2="14" y2="17" />
                          </svg>
                        ),
                      },
                      {
                        label: "Time saved",
                        value: "15h 30m",
                        color: "#22C55E",
                        bg: "rgba(34,197,94,0.12)",
                        icon: (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        ),
                      },
                    ].map(stat => (
                      <div key={stat.label} style={{
                        background: "#fff",
                        borderRadius: 14,
                        padding: "14px 14px 12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)",
                        position: "relative",
                      }}>
                        {/* Icon tile + arrow */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {stat.icon}
                          </div>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stat.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                            <line x1="7" y1="17" x2="17" y2="7" />
                            <polyline points="7 7 17 7 17 17" />
                          </svg>
                        </div>
                        <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 22, color: stat.color, letterSpacing: "-0.6px", lineHeight: 1 }}>{stat.value}</div>
                        <div style={{ fontSize: 11, color: "rgba(10,10,15,0.55)", fontFamily: "DM Sans, sans-serif", marginTop: 4 }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Prompt history */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <h5 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 15, color: "#0A0A0F", margin: 0, letterSpacing: "-0.3px" }}>Prompt history</h5>
                    <span style={{ fontSize: 11, color: "rgba(10,10,15,0.45)", fontFamily: "DM Sans, sans-serif" }}>30 entries</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { text: "Roadmap to reach 1k MRR for a SaaS product", time: "4 hr ago", gain: "+40%" },
                      { text: "Write cold emails for Lumia beta launch", time: "4 hr ago", gain: "+35%" },
                      { text: "Code review: NextJS auth flow", time: "5 hr ago", gain: "+52%" },
                    ].map((row, i) => (
                      <div key={i} style={{
                        background: "#fff",
                        borderRadius: 12,
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)",
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#0A0A0F", fontFamily: "DM Sans, sans-serif", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.text}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                            <span style={{ fontSize: 10, color: "rgba(10,10,15,0.40)", fontFamily: "DM Sans, sans-serif" }}>{row.time}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#22C55E", background: "rgba(34,197,94,0.10)", padding: "1px 6px", borderRadius: 4, fontFamily: "DM Sans, sans-serif", display: "inline-flex", alignItems: "center", gap: 2 }}>
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
                              {row.gain}
                            </span>
                          </div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(10,10,15,0.30)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === "Vault" && (
              <motion.div key="vault" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} style={{ height: "100%", overflow: "auto" }}>
                <div style={{ padding: "4px 24px 28px" }}>
                  {/* Eyebrow + title */}
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#567EFC", margin: "0 0 6px", fontFamily: "DM Sans, sans-serif" }}>VAULT</p>
                  <h4 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 24, color: "#0A0A0F", margin: "0 0 4px", letterSpacing: "-0.6px" }}>Your knowledge base</h4>
                  <p style={{ fontSize: 12.5, color: "rgba(10,10,15,0.55)", fontFamily: "DM Sans, sans-serif", margin: "0 0 16px" }}>All your documents, notes and context — one place.</p>

                  {/* Search bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 14, padding: "11px 16px", marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(10,10,15,0.35)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <span style={{ fontSize: 13, color: "rgba(10,10,15,0.40)", fontFamily: "DM Sans, sans-serif" }}>Search your Vault…</span>
                  </div>

                  {/* Filter pills */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                    {[
                      { label: "All", active: true },
                      { label: "Lumia", active: false },
                      { label: "AIGHTBET", active: false },
                    ].map(pill => (
                      <span key={pill.label} style={{
                        fontSize: 11,
                        fontWeight: pill.active ? 700 : 500,
                        color: pill.active ? "#567EFC" : "rgba(10,10,15,0.65)",
                        background: pill.active ? "rgba(86,126,252,0.12)" : "#fff",
                        border: pill.active ? "1px solid rgba(86,126,252,0.22)" : "1px solid rgba(0,0,0,0.06)",
                        padding: "5px 12px",
                        borderRadius: 14,
                        fontFamily: "DM Sans, sans-serif",
                        boxShadow: pill.active ? "none" : "0 1px 2px rgba(0,0,0,0.03)",
                      }}>{pill.label}</span>
                    ))}
                    <div style={{ width: 26, height: 26, borderRadius: 14, background: "rgba(86,126,252,0.12)", border: "1px solid rgba(86,126,252,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#567EFC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        <line x1="12" y1="11" x2="12" y2="17" />
                        <line x1="9" y1="14" x2="15" y2="14" />
                      </svg>
                    </div>
                  </div>

                  {/* Documents header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <h5 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 14, color: "#0A0A0F", margin: 0, letterSpacing: "-0.3px" }}>Documents</h5>
                    <span style={{ fontSize: 11, color: "rgba(10,10,15,0.45)", fontFamily: "DM Sans, sans-serif" }}>38 items</span>
                  </div>

                  {/* 2x2 grid of doc cards */}
                  <div className="showcase-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { title: "AightBetClaude_PRD", iconBg: "rgba(86,126,252,0.12)", iconColor: "#567EFC", badge: "PDF", badgeBg: "rgba(86,126,252,0.12)", badgeColor: "#567EFC", date: "13 April 2026" },
                      { title: "Pitch_One_Pager Lumia", iconBg: "rgba(255,119,105,0.12)", iconColor: "#FF7769", badge: "PDF", badgeBg: "rgba(255,119,105,0.12)", badgeColor: "#FF7769", date: "12 April 2026" },
                      { title: "Feature_List Lumia", iconBg: "rgba(255,119,105,0.12)", iconColor: "#FF7769", badge: "PDF", badgeBg: "rgba(255,119,105,0.12)", badgeColor: "#FF7769", date: "12 April 2026" },
                      { title: "Marketing_Lumia", iconBg: "rgba(255,119,105,0.12)", iconColor: "#FF7769", badge: "PDF", badgeBg: "rgba(255,119,105,0.12)", badgeColor: "#FF7769", date: "12 April 2026" },
                    ].map((doc, i) => (
                      <div key={i} style={{
                        background: "#fff",
                        borderRadius: 14,
                        padding: "14px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)",
                        transition: "transform 0.25s ease, box-shadow 0.25s ease",
                        cursor: "default",
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)"; }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: doc.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={doc.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                          </div>
                          <span style={{ fontSize: 9, fontWeight: 700, color: doc.badgeColor, background: doc.badgeBg, padding: "2px 7px", borderRadius: 4, fontFamily: "DM Sans, sans-serif" }}>{doc.badge}</span>
                        </div>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: "#0A0A0F", fontFamily: "DM Sans, sans-serif", margin: "0 0 8px", letterSpacing: "-0.2px" }}>{doc.title}</p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: doc.iconColor, background: doc.iconBg, padding: "2px 7px", borderRadius: 4, fontFamily: "DM Sans, sans-serif" }}>Document</span>
                          <span style={{ fontSize: 10, color: "rgba(10,10,15,0.40)", fontFamily: "DM Sans, sans-serif" }}>{doc.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === "Templates" && (
              <motion.div key="templates" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} style={{ height: "100%", overflow: "auto" }}>
                <div style={{ padding: "4px 24px 28px" }}>
                  {/* Eyebrow + title */}
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#567EFC", margin: "0 0 6px", fontFamily: "DM Sans, sans-serif" }}>TEMPLATES</p>
                  <h4 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 24, color: "#0A0A0F", margin: "0 0 4px", letterSpacing: "-0.6px" }}>Saved prompts</h4>
                  <p style={{ fontSize: 12.5, color: "rgba(10,10,15,0.55)", fontFamily: "DM Sans, sans-serif", margin: "0 0 16px" }}>Reuse your best-performing prompt structures instantly.</p>

                  {/* 2×2 template cards */}
                  <div className="showcase-grid-2col" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                    {[
                      { label: "Cold email sequence", tag: "Sales", uses: "12x", color: "#567EFC", bg: "rgba(86,126,252,0.12)" },
                      { label: "Weekly content calendar", tag: "Marketing", uses: "8x", color: "#C2AED4", bg: "rgba(194,174,212,0.18)" },
                      { label: "Feature spec write-up", tag: "Product", uses: "5x", color: "#FF7769", bg: "rgba(255,119,105,0.12)" },
                      { label: "Investor update draft", tag: "Founders", uses: "3x", color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
                    ].map((tpl, i) => (
                      <div key={i} style={{
                        background: "#fff",
                        borderRadius: 14,
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)",
                        cursor: "pointer",
                        transition: "transform 0.25s ease, box-shadow 0.25s ease",
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)"; }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: tpl.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={tpl.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#0A0A0F", fontFamily: "DM Sans, sans-serif", margin: "0 0 2px", letterSpacing: "-0.2px" }}>{tpl.label}</p>
                          <span style={{ fontSize: 11, color: tpl.color, fontFamily: "DM Sans, sans-serif", fontWeight: 500 }}>{tpl.tag}</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(10,10,15,0.55)", fontFamily: "DM Sans, sans-serif", background: "rgba(0,0,0,0.04)", padding: "4px 10px", borderRadius: 14, flexShrink: 0 }}>Used {tpl.uses}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
    { num: "01", title: "Say it messy.", desc: "Voice, text, half a thought. Lumia doesn't need structure.", tag: "🎙 Voice or text · No format required" },
    { num: "02", title: "Context fills itself.", desc: "Your docs, your decisions, your tone — Lumia pulls only what's relevant. Nothing extra.", tag: "📦 Vault injection · Precision retrieval" },
    { num: "03", title: "Prompt lands perfect.", desc: "Reverse-engineered, context-loaded, ready to paste. ⌘V.", tag: "✓ Prompt copied — ⌘V to paste" },
  ];

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="how" style={{ padding: "96px clamp(20px, 5vw, 80px)", background: "transparent", position: "relative", overflow: "hidden" }}>
      {/* Aurora blobs */}
      <div style={{ position: "absolute", top: "10%", left: "15%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(86,126,252,0.10) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(194,174,212,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header — liquid glass */}
        <div style={{
          marginBottom: 64,
          background: "rgba(10,8,24,0.55)",
          backdropFilter: "blur(40px) saturate(120%)",
          WebkitBackdropFilter: "blur(40px) saturate(120%)",
          border: "0.5px solid rgba(255,255,255,0.08)",
          borderRadius: 28,
          padding: "36px 40px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}>
          <h2 className="reveal" style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(30px, 4.5vw, 50px)", letterSpacing: "-1.5px", color: "#fff", marginBottom: 16, lineHeight: 1.1 }}>Idea in. Prompt out.<br />That&apos;s it.</h2>
          <p className="reveal" style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 440, fontFamily: "DM Sans, sans-serif" }}>Your Vault handles the context gap — automatically, on every AI you already use.</p>
        </div>

        <div className="hiw-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: 64, alignItems: "center" }}>
          {/* Steps — liquid glass card */}
          <div className="hiw-steps" style={{
            position: "relative",
            background: "rgba(10,8,24,0.55)",
            backdropFilter: "blur(40px) saturate(120%)",
            WebkitBackdropFilter: "blur(40px) saturate(120%)",
            border: "0.5px solid rgba(255,255,255,0.08)",
            borderRadius: 28,
            padding: "36px 32px 32px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}>
            {/* Connecting line */}
            <div style={{ position: "absolute", left: 51, top: 64, bottom: 76, width: "0.5px", background: "linear-gradient(to bottom, rgba(86,126,252,0.6), transparent)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {steps.map((step, i) => (
                <div key={step.num} className="reveal" style={{ display: "flex", gap: 20, padding: "20px 0", transitionDelay: `${i * 0.1}s`, cursor: "pointer" }} onClick={() => setActiveStep(i)}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: activeStep === i ? "var(--gradient)" : "rgba(255,255,255,0.06)", border: `0.5px solid ${activeStep === i ? "transparent" : "rgba(255,255,255,0.10)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 13, color: activeStep === i ? "#fff" : "rgba(255,255,255,0.30)", flexShrink: 0, boxShadow: activeStep === i ? "0 4px 16px rgba(86,126,252,0.35)" : "none", transition: "all 0.3s ease", zIndex: 1, position: "relative" }}>
                    {step.num}
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 17, color: activeStep === i ? "#8BA8FD" : "rgba(255,255,255,0.70)", marginBottom: 6, transition: "color 0.3s" }}>{step.title}</h3>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.40)", lineHeight: 1.6, marginBottom: 10, fontFamily: "DM Sans, sans-serif" }}>{step.desc}</p>
                    <span style={{ display: "inline-block", fontSize: 12, fontWeight: 600, background: activeStep === i ? "rgba(86,126,252,0.15)" : "rgba(255,255,255,0.06)", color: activeStep === i ? "#8BA8FD" : "rgba(255,255,255,0.30)", padding: "4px 10px", borderRadius: 14, transition: "all 0.3s" }}>{step.tag}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Step dots */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24, paddingLeft: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} onClick={() => setActiveStep(i)} style={{ height: 6, borderRadius: 14, background: activeStep === i ? "var(--gradient)" : "rgba(255,255,255,0.12)", width: activeStep === i ? 28 : 6, transition: "all 0.3s ease", cursor: "pointer" }} />
              ))}
            </div>
          </div>

          {/* Animation — chat interface sits behind Lumia overlay */}
          <div className="reveal hiw-animation" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
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

  const [view, setView] = useState<"before" | "after">("before");

  const beforeSteps = [
    { icon: "💬", label: "Open ChatGPT", detail: "Type a vague prompt from scratch", status: "bad" },
    { icon: "😶", label: "Get generic output", detail: "Missing context → wrong tone, wrong format", status: "bad" },
    { icon: "🔁", label: "Reprompt 2–3×", detail: "Re-explain your business, goals, audience…", status: "bad" },
    { icon: "🔀", label: "Switch to Claude", detail: "Have to brief it again from zero", status: "bad" },
    { icon: "⏱️", label: "6 min lost", detail: "Per prompt. Every prompt. Every day.", status: "bad" },
  ];

  const afterSteps = [
    { icon: "⌘", label: "Hit the shortcut", detail: "One keystroke. That's it.", status: "good" },
    { icon: "🧠", label: "Lumia detects intent", detail: "Knows it's a cold email. Loads the skill.", status: "good" },
    { icon: "📦", label: "Vault injected", detail: "Brand voice, ICP, tone — all pre-loaded.", status: "good" },
    { icon: "✅", label: "Perfect prompt built", detail: "Structured, context-rich, model-tailored.", status: "good" },
    { icon: "⚡", label: "30 seconds", detail: "Works on Claude, ChatGPT, Gemini. Same context.", status: "good" },
  ];

  const steps = view === "before" ? beforeSteps : afterSteps;
  const isBefore = view === "before";

  return (
    <section id="compare" style={{ padding: "96px clamp(20px, 5vw, 64px) 40px", background: "transparent", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Header — centered, clean */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 className="reveal" style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(36px, 5vw, 56px)", letterSpacing: "-1.5px", color: "#0A0A0F", lineHeight: 1.1, margin: "0 0 18px" }}>
            Same prompt.<br />Wildly different result.
          </h2>
          <p className="reveal" style={{ fontSize: 16, color: "rgba(10,10,15,0.55)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>
            See what changes when Lumia sits between you and your AI.
          </p>
        </div>

        {/* Toggle — liquid glass pill, matches Time/Money style */}
        <div className="reveal" style={{
          display: "flex",
          background: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(30px) saturate(180%)",
          WebkitBackdropFilter: "blur(30px) saturate(180%)",
          borderRadius: 14,
          padding: 5,
          marginBottom: 36,
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 6px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}>
          {(["before", "after"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "10px 26px",
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "DM Sans, sans-serif",
              background: view === v ? "#fff" : "transparent",
              color: view === v ? "#0F0A1E" : "rgba(255,255,255,0.75)",
              boxShadow: view === v ? "0 2px 10px rgba(0,0,0,0.18)" : "none",
              transition: "all 0.25s ease",
            }}>
              {v === "before" ? "Without Lumia" : "With Lumia"}
            </button>
          ))}
        </div>

        {/* Card — liquid glass */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.30, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "100%", maxWidth: 720 }}
          >
            <div style={{
              background: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(60px) saturate(180%)",
              WebkitBackdropFilter: "blur(60px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 28,
              overflow: "hidden",
              boxShadow: "0 12px 48px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -1px 0 rgba(255,255,255,0.06)",
            }}>
              {/* Card header */}
              <div style={{
                padding: "20px 28px",
                borderBottom: "1px solid rgba(255,255,255,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: isBefore ? "#FF7769" : "#3DCAB1",
                    boxShadow: `0 0 12px ${isBefore ? "rgba(255,119,105,0.6)" : "rgba(61,202,177,0.6)"}`,
                  }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: "var(--font-bricolage), sans-serif", letterSpacing: "-0.3px" }}>
                    {isBefore ? "Without Lumia — the friction loop" : "With Lumia — the flow state"}
                  </span>
                </div>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isBefore ? "#FFB8AE" : "#9AEFD8",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  padding: "4px 12px",
                  borderRadius: 14,
                  fontFamily: "DM Sans, sans-serif",
                  whiteSpace: "nowrap",
                }}>
                  {isBefore ? "~6 min / prompt" : "~30 sec / prompt"}
                </span>
              </div>

              {/* Steps */}
              <div style={{ padding: "12px 0" }}>
                {steps.map((step, i) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: isBefore ? -12 : 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "14px 28px",
                      borderBottom: i < steps.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    }}
                  >
                    {/* Step icon */}
                    <div style={{
                      width: 40, height: 40, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: step.icon === "⌘" ? 22 : 26,
                      lineHeight: 1,
                    }}>
                      {step.icon}
                    </div>
                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", fontFamily: "DM Sans, sans-serif", margin: 0, letterSpacing: "-0.2px" }}>{step.label}</p>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "DM Sans, sans-serif", margin: "3px 0 0", lineHeight: 1.4 }}>{step.detail}</p>
                    </div>
                    {/* Status dot */}
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      background: isBefore ? "rgba(255,119,105,0.15)" : "rgba(61,202,177,0.15)",
                      border: `1px solid ${isBefore ? "rgba(255,119,105,0.35)" : "rgba(61,202,177,0.35)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isBefore
                        ? <XCircle size={13} color="#FF7769" />
                        : <CheckCircle2 size={13} color="#3DCAB1" />
                      }
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Card footer */}
              <div style={{
                padding: "16px 28px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}>
                <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)", fontFamily: "DM Sans, sans-serif" }}>
                  {isBefore ? "Repeating this daily = 42h lost / month" : "Works on Claude, ChatGPT, Gemini, Perplexity"}
                </span>
                {!isBefore && (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {["/claude-ai-icon.webp", "/chatgpt-icon.webp", "/google-gemini-icon.webp", "/perplexity-ai-icon.webp"].map((src, i) => (
                      <img key={i} src={src} alt="" style={{ width: 20, height: 20, objectFit: "contain", marginLeft: i === 0 ? 0 : -5, borderRadius: 5, border: "1.5px solid rgba(20,15,40,0.6)", background: "#fff" }} />
                    ))}
                  </div>
                )}
                {isBefore && (
                  <button onClick={() => setView("after")} style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#0F0A1E",
                    background: "#fff",
                    border: "none",
                    borderRadius: 14,
                    padding: "6px 14px",
                    cursor: "pointer",
                    fontFamily: "DM Sans, sans-serif",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  }}>
                    See with Lumia →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA — aligned with page aesthetic */}
        <div className="reveal" style={{ textAlign: "center", marginTop: 48, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h3 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 800, color: "#0A0A0F", marginBottom: 10, fontFamily: "var(--font-bricolage), sans-serif", letterSpacing: "-0.6px" }}>The only tool that does all of it.</h3>
          <p style={{ fontSize: 15, color: "rgba(10,10,15,0.55)", marginBottom: 28, maxWidth: 420, lineHeight: 1.6, fontFamily: "DM Sans, sans-serif" }}>Sits on top of the workflow you've already built.</p>
          <a href="#waitlist" className="btn-spring" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "#000",
            color: "#fff",
            borderRadius: 14,
            padding: "14px 32px",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            border: "0.5px solid rgba(255,255,255,0.35)",
            fontFamily: "var(--font-bricolage), sans-serif",
            textDecoration: "none",
            letterSpacing: "-0.2px",
          }}>
            Join the waitlist <ArrowRight size={15} />
          </a>
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

function MobileCalcDots({ wrapperId, count }: { wrapperId: string; count: number }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = document.getElementById(wrapperId);
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.offsetWidth);
      setActive(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [wrapperId]);

  const scrollTo = (i: number) => {
    const el = document.getElementById(wrapperId);
    if (el) el.scrollTo({ left: i * el.offsetWidth, behavior: "smooth" });
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }} className="calc-dots">
      <style>{`.calc-dots { display: none; } @media (max-width: 700px) { .calc-dots { display: flex !important; } }`}</style>
      {Array.from({ length: count }).map((_, i) => (
        <button key={i} onClick={() => scrollTo(i)} style={{
          width: i === active ? 22 : 8, height: 8,
          borderRadius: 14, border: "none", cursor: "pointer",
          background: i === active ? "#fff" : "rgba(255,255,255,0.35)",
          transition: "all 0.25s ease", padding: 0,
        }} />
      ))}
    </div>
  );
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
    <section style={{ padding: "40px clamp(20px, 5vw, 80px) 96px", background: "transparent", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 className="reveal" style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(36px, 5vw, 56px)", letterSpacing: "-1.5px", color: "#0A0A0F", marginBottom: 18, lineHeight: 1.1 }}>How much are you losing each week?</h2>
          <p className="reveal" style={{ fontSize: 16, color: "rgba(10,10,15,0.55)", fontFamily: "DM Sans, sans-serif", maxWidth: 480, margin: "0 auto" }}>Slide to see your real-time friction cost.</p>
        </div>

        {/* Mode Toggle — liquid glass pill */}
        <div className="reveal calc-mode-toggle" style={{
          display: "flex",
          background: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(30px) saturate(180%)",
          WebkitBackdropFilter: "blur(30px) saturate(180%)",
          borderRadius: 14,
          padding: 5,
          marginBottom: 24,
          width: "fit-content",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 6px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}>
          {[["time", "Time lost"], ["money", "Money value"]].map(([m, label]) => (
            <button key={m} onClick={() => setMode(m as "time" | "money")}
              style={{
                padding: "10px 26px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "DM Sans, sans-serif",
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#0F0A1E" : "rgba(255,255,255,0.75)",
                boxShadow: mode === m ? "0 2px 10px rgba(0,0,0,0.18)" : "none",
                transition: "all 0.25s ease",
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── 3-card layout: grid on desktop, swipeable cards on mobile ── */}
        <style>{`
          .calc-cards-wrapper {
            display: grid;
            grid-template-columns: 1fr 1.15fr;
            grid-template-rows: auto auto;
            gap: 16px;
          }
          .calc-card-quality  { grid-column: 1; grid-row: 1; }
          .calc-card-sliders  { grid-column: 1; grid-row: 2; }
          .calc-card-results  { grid-column: 2; grid-row: 1 / span 2; }
          @media (max-width: 700px) {
            .calc-cards-wrapper {
              display: flex;
              flex-direction: column;
              gap: 14px;
            }
            .calc-glass-card {
              width: 100%;
              padding: 24px !important;
              border-radius: 24px !important;
            }
            .calc-card-results { grid-row: unset; }
            .calc-stats-grid {
              grid-template-columns: 1fr 1fr !important;
              gap: 10px !important;
            }
            .calc-stats-grid > div {
              height: 130px !important;
              padding: 16px 10px !important;
            }
            .calc-stats-grid > div > div:first-child {
              font-size: 19px !important;
              letter-spacing: -0.3px !important;
            }
          }
        `}</style>
        <div className="reveal calc-cards-wrapper" id="calc-cards-wrapper">

          {/* Card 1 — Quality selector */}
          <div className="calc-glass-card calc-card-quality" style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(60px) saturate(180%)",
            WebkitBackdropFilter: "blur(60px) saturate(180%)",
            borderRadius: 32,
            padding: "32px 32px 28px",
            border: "1px solid rgba(255,255,255,0.20)",
            boxShadow: "0 12px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(255,255,255,0.06)",
          }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 18, fontFamily: "DM Sans, sans-serif", letterSpacing: "-0.2px" }}>How do you usually send your prompts?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(Object.keys(qualityLabels) as QualityKey[]).map(key => (
                <button key={key} onClick={() => setQuality(key)}
                  className="calc-quality-btn"
                  style={{
                    padding: "15px 18px",
                    borderRadius: 16,
                    border: `1px solid ${quality === key ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)"}`,
                    background: quality === key ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.05)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    boxShadow: quality === key ? "inset 0 1px 0 rgba(255,255,255,0.15)" : "none",
                  }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: quality === key ? "#fff" : "rgba(255,255,255,0.80)", fontFamily: "DM Sans, sans-serif" }}>{qualityLabels[key].title}</span>
                  <span style={{ fontSize: 12, color: quality === key ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.50)", fontFamily: "DM Sans, sans-serif", textAlign: "right", lineHeight: 1.3, flexShrink: 0, whiteSpace: "nowrap" }}>{qualityLabels[key].sub}</span>
                </button>
              ))}
            </div>
            <p style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.60)",
              lineHeight: 1.6,
              fontFamily: "DM Sans, sans-serif",
              margin: "18px 0 0",
            }}>
              {qualityWarnings[quality]}
            </p>
          </div>

          {/* Card 2 — Sliders (Prompts per day) — shown before results on mobile */}
          <div className="calc-glass-card calc-card-sliders" style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(60px) saturate(180%)",
            WebkitBackdropFilter: "blur(60px) saturate(180%)",
            borderRadius: 32,
            padding: "32px",
            border: "1px solid rgba(255,255,255,0.20)",
            boxShadow: "0 12px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(255,255,255,0.06)",
          }}>
            {/* Prompts per day */}
            <div style={{ marginBottom: mode === "money" ? 28 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <label style={{ fontSize: 15, fontWeight: 600, color: "#fff", fontFamily: "DM Sans, sans-serif", letterSpacing: "-0.2px" }}>Prompts per day</label>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "var(--font-bricolage), sans-serif", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", padding: "5px 14px", borderRadius: 14, letterSpacing: "-0.3px" }}>{prompts}/day</span>
              </div>
              <input type="range" min={5} max={150} step={5} value={prompts} onChange={e => setPrompts(+e.target.value)} className="glass-slider" />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: "DM Sans, sans-serif", marginTop: 10, fontWeight: 500 }}>
                <span>5</span><span>150</span>
              </div>
            </div>
            {/* Hourly rate (money mode) */}
            {mode === "money" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <label style={{ fontSize: 15, fontWeight: 600, color: "#fff", fontFamily: "DM Sans, sans-serif", letterSpacing: "-0.2px" }}>Your hourly rate</label>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "var(--font-bricolage), sans-serif", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", padding: "5px 14px", borderRadius: 14, letterSpacing: "-0.3px" }}>${hourlyRate}/h</span>
                </div>
                <input type="range" min={25} max={400} step={25} value={hourlyRate} onChange={e => setHourlyRate(+e.target.value)} className="glass-slider" />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: "DM Sans, sans-serif", marginTop: 10, fontWeight: 500 }}>
                  <span>$25</span><span>$400</span>
                </div>
              </div>
            )}
          </div>

          {/* Card 3 — Results */}
          <div className="calc-glass-card calc-card-results" style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(60px) saturate(180%)",
            WebkitBackdropFilter: "blur(60px) saturate(180%)",
            borderRadius: 32,
            padding: "32px",
            border: "1px solid rgba(255,255,255,0.20)",
            boxShadow: "0 12px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.60)", margin: "0 0 4px", fontFamily: "DM Sans, sans-serif" }}>Your friction cost</p>

            <div className="calc-stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {/* Lost/day */}
              <div style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 22,
                padding: "20px 16px",
                textAlign: "center",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                height: 150,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}>
                <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 30, color: "#fff", letterSpacing: "-0.8px", lineHeight: 1.05, whiteSpace: "nowrap" }}>
                  {mode === "time" ? fmtTime(animMinsDay) : `$${Math.round(animMinsDay / 60 * hourlyRate)}`}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: "DM Sans, sans-serif", marginTop: 8, fontWeight: 500 }}>Lost/day</div>
              </div>
              {/* Lost/month */}
              <div style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 22,
                padding: "20px 16px",
                textAlign: "center",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                height: 150,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}>
                <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 30, color: "#fff", letterSpacing: "-0.8px", lineHeight: 1.05, whiteSpace: "nowrap" }}>
                  {mode === "time" ? fmtTime(animMinsMonth) : `$${Math.round(animMoneyMonth)}`}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: "DM Sans, sans-serif", marginTop: 8, fontWeight: 500 }}>Lost/month</div>
              </div>
              {/* Saved/year — highlight */}
              <div style={{
                background: "rgba(255,255,255,0.20)",
                border: "1px solid rgba(255,255,255,0.35)",
                borderRadius: 22,
                padding: "20px 16px",
                textAlign: "center",
                position: "relative",
                boxShadow: "0 6px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.28)",
                height: 150,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}>
                <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 30, color: "#FFD4C9", letterSpacing: "-0.8px", lineHeight: 1.05, whiteSpace: "nowrap", textShadow: "0 2px 8px rgba(235,94,94,0.25)" }}>
                  {mode === "time" ? fmtTime(animHoursYear * 60) : `$${Math.round(animMoneyYear).toLocaleString()}`}
                </div>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 700, fontFamily: "DM Sans, sans-serif", marginTop: 8 }}>Saved with Lumia</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.70)", fontFamily: "DM Sans, sans-serif", marginTop: 2 }}>per year</div>
              </div>
              {/* Work days / ROI */}
              {mode === "money" ? (
                <div style={{
                  background: "rgba(255,255,255,0.20)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  borderRadius: 22,
                  padding: "20px 16px",
                  textAlign: "center",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.28)",
                  height: 150,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                }}>
                  <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 30, color: "#FFD4C9", letterSpacing: "-0.8px", lineHeight: 1.05, whiteSpace: "nowrap", textShadow: "0 2px 8px rgba(235,94,94,0.25)" }}>
                    {Math.round(animRoi)}×
                  </div>
                  <div style={{ fontSize: 13, color: "#fff", fontWeight: 700, fontFamily: "DM Sans, sans-serif", marginTop: 8 }}>Lumia ROI</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.70)", fontFamily: "DM Sans, sans-serif", marginTop: 2 }}>at $39/month</div>
                </div>
              ) : (
                <div style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 22,
                  padding: "20px 16px",
                  textAlign: "center",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                  height: 150,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                }}>
                  <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 30, color: "#fff", letterSpacing: "-0.8px", lineHeight: 1.05, whiteSpace: "nowrap" }}>
                    {daysLostYear}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: "DM Sans, sans-serif", marginTop: 8, fontWeight: 500 }}>Work days</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", fontFamily: "DM Sans, sans-serif", marginTop: 2 }}>lost per year</div>
                </div>
              )}
            </div>

            {/* Insight */}
            <div style={{
              marginTop: "auto",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 20,
              padding: "16px 20px",
              fontSize: 14,
              color: "rgba(255,255,255,0.80)",
              lineHeight: 1.65,
              fontFamily: "DM Sans, sans-serif",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.3 }}>💡</span>
              <span>{insightText}</span>
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
      background: "transparent",
    }}>
      <style>{`
        .founder-link {
          color: rgba(10,10,15,0.45);
          text-decoration: none;
          font-size: 0.875rem;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        .founder-link:hover { color: #567EFC; }
        @media (max-width: 640px) {
          .founder-layout { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .founder-photo-wrap { margin-bottom: 28px !important; margin-right: 0 !important; }
        }
      `}</style>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{
          background: "#fff",
          borderRadius: 32,
          padding: "clamp(36px, 4.5vw, 64px)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)",
          border: "1px solid rgba(255,255,255,0.20)",
        }}>
          <div className="founder-layout" style={{ display: "flex", alignItems: "flex-start", gap: 36 }}>

            {/* Photo */}
            <div className="founder-photo-wrap" style={{ flexShrink: 0 }}>
              <img
                src="/founder.jpg"
                alt="Rosly, founder of Lumia"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid rgba(86,126,252,0.20)",
                  display: "block",
                  boxShadow: "0 4px 12px rgba(86,126,252,0.15)",
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
                letterSpacing: "0.12em",
                color: "#567EFC",
                marginBottom: 10,
                fontFamily: "DM Sans, sans-serif",
              }}>The Founder</p>

              {/* Name line */}
              <p style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#0A0A0F",
                marginBottom: 22,
                fontFamily: "var(--font-bricolage), sans-serif",
                letterSpacing: "-0.5px",
                lineHeight: 1.25,
              }}>Rosly, 19 — Industrial Engineering student at Polytechnique Montréal.</p>

              {/* Origin story */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ fontSize: "0.9375rem", lineHeight: 1.75, color: "rgba(10,10,15,0.65)", margin: 0, fontFamily: "DM Sans, sans-serif" }}>
                  I built Lumia because I kept breaking my own workflow trying to fix it. I connected NotebookLM to Gemini — too much context, the model choked. I tried a vector database on Supabase with Telegram bots — it worked, but I lost Claude&apos;s canvas, ChatGPT&apos;s artifacts, every native UI feature I actually rely on.
                </p>
                <p style={{ fontSize: "0.9375rem", lineHeight: 1.75, color: "rgba(10,10,15,0.65)", margin: 0, fontFamily: "DM Sans, sans-serif" }}>
                  Every fix forced a tradeoff. So I stopped replacing tools and built a layer on top instead.
                </p>
                <p style={{ fontSize: "0.9375rem", lineHeight: 1.75, color: "rgba(10,10,15,0.65)", margin: 0, fontFamily: "DM Sans, sans-serif" }}>
                  I send 50+ prompts a day. I don&apos;t want to learn prompt engineering — I want quality, fast. Lumia is what I built for myself first.
                </p>
              </div>

              {/* Closing line */}
              <p style={{
                fontSize: "0.875rem",
                color: "#567EFC",
                fontStyle: "italic",
                fontWeight: 500,
                marginTop: 22,
                marginBottom: 20,
                fontFamily: "DM Sans, sans-serif",
              }}>Built in Montréal. Vibe-coded into existence.</p>

              {/* Social links */}
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", paddingTop: 16, borderTop: "1px solid rgba(10,10,15,0.08)" }}>
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
      </div>
    </section>
  );
}

// ─── Pricing Section ──────────────────────────────────────────────────────────
function PricingSection() {
  const waitlistFeatures = [
    "First access when the public beta opens",
    "Founder updates, straight from me",
    "No card, no commitment",
  ];
  const founderFeatures = [
    "Instant access to the MVP today",
    "Unlimited prompts for life",
    "Unlimited Vault",
    "Every future feature included",
    "Feature vote — your top 3 ship first",
    "Direct email line to the founder",
  ];

  return (
    <section id="pricing" style={{ padding: "96px clamp(20px, 5vw, 80px)", background: "transparent", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 className="reveal" style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(36px, 5vw, 56px)", letterSpacing: "-1.5px", color: "#0A0A0F", margin: "0 0 18px", lineHeight: 1.1 }}>
            MVP stage.<br />Two ways in.
          </h2>
          <p className="reveal" style={{ fontSize: 16, color: "rgba(10,10,15,0.70)", fontFamily: "DM Sans, sans-serif", maxWidth: 520, margin: "0 auto" }}>
            To use the MVP today, become a Founder. Everyone else — join the waitlist.
          </p>
        </div>

        {/* 2-column plan grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 18, alignItems: "stretch" }}>

          {/* Waitlist card — secondary */}
          <div id="waitlist" className="reveal" style={{
            background: "rgba(10,8,24,0.92)",
            borderRadius: 28,
            padding: "32px 28px",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em", color: "#fff",
              background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 14, padding: "4px 12px", marginBottom: 18,
              fontFamily: "DM Sans, sans-serif", width: "fit-content",
            }}>Waitlist</div>

            <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 22, color: "#fff", margin: "0 0 18px", letterSpacing: "-0.4px" }}>
              Not ready yet?
            </h3>

            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 22 }}>
              <span style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 52, letterSpacing: "-2.5px", lineHeight: 1, color: "#fff" }}>Free</span>
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.12)", marginBottom: 22 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28, flex: 1 }}>
              {waitlistFeatures.map((f, fi) => (
                <div key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.20)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.75)", fontFamily: "DM Sans, sans-serif" }}>{f}</span>
                </div>
              ))}
            </div>

            <WaitlistForm variant="pricing" />

            <p style={{ fontSize: 12, fontFamily: "DM Sans, sans-serif", textAlign: "center", marginTop: 12, marginBottom: 0, color: "rgba(255,255,255,0.55)" }}>
              We'll email you when the public beta opens.
            </p>
          </div>

          {/* Founder Pack — featured, pay-to-access */}
          <div className="reveal" style={{
            background: "radial-gradient(120% 100% at 0% 0%, rgba(86,126,252,0.22) 0%, rgba(15,10,30,0.96) 55%), #0A0712",
            borderRadius: 28,
            padding: "32px 28px",
            border: "1px solid rgba(134,160,255,0.28)",
            boxShadow: "0 32px 80px rgba(86,126,252,0.28), 0 8px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            transform: "scale(1.02)",
            zIndex: 2,
          }}>
            <div style={{
              position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
              background: "#fff", color: "#000",
              fontSize: 11, fontWeight: 700, fontFamily: "DM Sans, sans-serif",
              padding: "5px 16px", borderRadius: 3, whiteSpace: "nowrap",
              letterSpacing: "0.1em", border: "0.5px solid rgba(0,0,0,0.15)",
            }}>LIMITED — BETA</div>

            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em", color: "#B3C5FF",
              background: "rgba(86,126,252,0.18)", border: "1px solid rgba(134,160,255,0.32)",
              borderRadius: 14, padding: "4px 12px", marginBottom: 18,
              fontFamily: "DM Sans, sans-serif", width: "fit-content",
            }}>Founder Pack</div>

            <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 22, color: "#fff", margin: "0 0 18px", letterSpacing: "-0.4px" }}>
              Get in today. Own it forever.
            </h3>

            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 22 }}>
              <span style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 52, letterSpacing: "-2.5px", lineHeight: 1, color: "#fff" }}>$99</span>
              <span style={{ fontSize: 15, color: "rgba(255,255,255,0.52)", fontFamily: "DM Sans, sans-serif", fontWeight: 500 }}>once</span>
            </div>

            <div style={{ height: 1, background: "rgba(134,160,255,0.18)", marginBottom: 22 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28, flex: 1 }}>
              {founderFeatures.map((f, fi) => (
                <div key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "linear-gradient(135deg, #567EFC, #EB5E5E)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.82)", fontFamily: "DM Sans, sans-serif" }}>{f}</span>
                </div>
              ))}
            </div>

            <PricingPaidForm />

            <p style={{ fontSize: 12, fontFamily: "DM Sans, sans-serif", textAlign: "center", marginTop: 12, marginBottom: 0, fontWeight: 600, color: "#FBBF24" }}>
              MVP price — increases at public launch.
            </p>
          </div>
        </div>

        {/* FM Promise */}
        <div style={{ maxWidth: 580, margin: "32px auto 0", textAlign: "center", padding: "20px 24px", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 700, fontFamily: "DM Sans, sans-serif", color: "rgba(255,255,255,0.9)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>The FM Promise</p>
          <p style={{ fontSize: 13, fontFamily: "DM Sans, sans-serif", color: "rgba(255,255,255,0.65)", margin: "0 0 6px", lineHeight: 1.6 }}>Lifetime access to the core product. No feature stripping. Ever.</p>
          <p style={{ fontSize: 13, fontFamily: "DM Sans, sans-serif", color: "rgba(255,255,255,0.65)", margin: "0 0 6px", lineHeight: 1.6 }}>After beta, non-FMs pay ~$15–20/mo.</p>
          <p style={{ fontSize: 13, fontFamily: "DM Sans, sans-serif", color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.6 }}>Advanced add-ons may come later — FMs get discount.</p>
        </div>

        {/* Bottom note */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.60)", fontFamily: "DM Sans, sans-serif", margin: "0 0 6px" }}>
            One-time payment · macOS Ventura 13.0+ · Apple Silicon &amp; Intel
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "DM Sans, sans-serif", margin: 0 }}>
            Follow live updates →{" "}
            <a href="https://x.com/_r0sly_" target="_blank" rel="noopener noreferrer"
              style={{ color: "#fff", textDecoration: "none", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.35)" }}>
              @_r0sly_ on X
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Launch Video Section ─────────────────────────────────────────────────────
function LaunchVideoSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.play();
    setPlaying(true);
  };

  return (
    <section style={{ background: "#000", padding: "120px clamp(20px, 5vw, 80px)", position: "relative" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: 24,
            overflow: "hidden",
            background: "#000",
            boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
            cursor: playing ? "default" : "pointer",
          }}
          onClick={!playing ? handlePlay : undefined}
        >
          <video
            ref={videoRef}
            src="/launch-video.mp4"
            poster="/live-beyond-thumbnail.png"
            controls={playing}
            playsInline
            preload="metadata"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          {!playing && (
            <>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.35))", pointerEvents: "none" }} />
              <button
                onClick={handlePlay}
                aria-label="Play launch video"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(12px)",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.08)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)")}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#0A0A0F">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)", padding: "28px clamp(20px, 5vw, 64px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, background: "transparent" }}>
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <img src="/lumia-logo-white.png" alt="Lumia" style={{ width: 24, height: 24, objectFit: "contain" }} />
        <span style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 18, color: "rgba(255,255,255,0.85)" }}>Lumia</span>
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontFamily: "DM Sans, sans-serif" }}>Building in public</span>
        <a href="https://x.com/_r0sly_" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#8BA8FD", fontWeight: 600, textDecoration: "none", fontFamily: "DM Sans, sans-serif" }}>@_r0sly_ on X ↗</a>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontFamily: "DM Sans, sans-serif" }}>© 2026 Lumia</span>
        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.25)", fontFamily: "DM Sans, sans-serif" }}>
          Questions about your purchase?{" "}
          <a href="mailto:rosly@getlumia.ca" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "underline" }}>rosly@getlumia.ca</a>
        </span>
      </div>
    </footer>
  );
}

// ─── Works On Top Of Section ──────────────────────────────────────────────────
function WorksOnTopOfSection() {
  const allLogos = [
    { src: "/logos/claude.webp", name: "Claude" },
    { src: "/logos/chatgpt.webp", name: "ChatGPT" },
    { src: "/logos/gemini.webp", name: "Gemini" },
    { src: "/logos/perplexity.webp", name: "Perplexity" },
    { src: "/logos/copilot.png", name: "Copilot" },
    { src: "/logos/deepseek.png", name: "DeepSeek" },
    { src: "/logos/notion.png", name: "Notion AI" },
    { src: "/logos/cursor.png", name: "Cursor" },
    { src: "/grok-icon.webp", name: "Grok" },
    { src: "/logos/mistral.png", name: "Mistral" },
    { src: "/logos/cohere.png", name: "Cohere" },
  ];
  // Extended set per row for the "infinite" feel with fade mask
  const row1 = [...allLogos, ...allLogos].slice(0, 10);
  const row2 = [...allLogos, ...allLogos].slice(3, 13);

  const maskStyle: React.CSSProperties = {
    WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 18%, black 82%, transparent 100%)",
    maskImage: "linear-gradient(90deg, transparent 0%, black 18%, black 82%, transparent 100%)",
  };

  // Liquid Glass card — même architecture que la navbar (7 couches)
  const LiquidCard = ({ logo, idx }: { logo: { src: string; name: string }; idx: number }) => {
    return (
      <div
        key={idx}
        style={{
          position: "relative",
          width: 88, height: 88,
          borderRadius: 22,
          overflow: "hidden",
          flexShrink: 0,
          WebkitTapHighlightColor: "transparent",
          outline: "none",
        }}
      >
        {/* Couche 1 — backdrop blur */}
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.09)", backdropFilter: "blur(40px) saturate(200%) brightness(1.10)", WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.10)", pointerEvents: "none" }} />
        {/* Couche 2 — grain noise */}
        <div aria-hidden style={{ position: "absolute", inset: 0, opacity: 0.055, filter: "url(#lg-noise)", background: "rgba(255,255,255,1)", mixBlendMode: "overlay", pointerEvents: "none" }} />
        {/* Couche 3 — specular gradient */}
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.10) 25%, transparent 50%, rgba(255,255,255,0.06) 80%, rgba(255,255,255,0.12) 100%)", pointerEvents: "none" }} />
        {/* Couche 4 — top edge streak */}
        <div aria-hidden style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1.5, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.65) 30%, rgba(255,255,255,0.78) 50%, rgba(255,255,255,0.65) 70%, transparent)", filter: "url(#lg-bloom)", pointerEvents: "none" }} />
        {/* Couche 5 — bottom inner shadow */}
        <div aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.09))", pointerEvents: "none" }} />
        {/* Couche 7 — border inset + outer glow */}
        <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "inherit", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.22), inset 0 0 0 0.5px rgba(255,255,255,0.08)", pointerEvents: "none" }} />
        {/* Contenu */}
        <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={logo.src} alt={logo.name} draggable={false} style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 10, userSelect: "none", pointerEvents: "none" }} />
        </div>
      </div>
    );
  };

  return (
    <section style={{
      background: "transparent",
      padding: "80px clamp(20px, 5vw, 64px)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div className="works-grid" style={{
        maxWidth: 1200,
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
        display: "grid",
        gridTemplateColumns: "minmax(260px, 1fr) 1.8fr",
        alignItems: "center",
        gap: 48,
      }}>
        {/* LEFT — Title */}
        <h2 className="reveal" style={{
          fontFamily: "var(--font-bricolage), sans-serif",
          fontWeight: 800,
          fontSize: "clamp(32px, 4vw, 48px)",
          letterSpacing: "-1.5px",
          color: "#0A0A0F",
          lineHeight: 1.1,
          margin: 0,
        }}>
          Integrates with your entire stack
        </h2>

        {/* RIGHT — Logos with edge fade mask */}
        <div className="reveal" style={{ overflow: "hidden", ...maskStyle }}>
          {/* Row 1 */}
          <div style={{ display: "flex", gap: 16, marginBottom: 16, justifyContent: "flex-start" }}>
            {row1.map((logo, i) => <LiquidCard key={`r1-${i}`} logo={logo} idx={i} />)}
          </div>
          {/* Row 2 — offset for natural feel */}
          <div className="works-row-2" style={{ display: "flex", gap: 16, justifyContent: "flex-start", marginLeft: 52 }}>
            {row2.map((logo, i) => <LiquidCard key={`r2-${i}`} logo={logo} idx={i} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Made For You Section ─────────────────────────────────────────────────────
const PERSONAS = [
  {
    label: "The Builder",
    title: "The Builder",
    desc: "You ship at 2am. Your stack is Cursor + Claude + ChatGPT.\nYour vision doesn't fit in a prompt box. Lumia carries it.",
  },
  {
    label: "The Creator",
    title: "The Creator",
    desc: "Your brand voice. Your tone. Your references.\nLumia knows them before you type.",
  },
  {
    label: "The Founder",
    title: "The Founder",
    desc: "Your startup. Your customers. Your numbers.\nLumia makes sure every AI knows the full story.",
  },
];

function MadeForYouSection() {
  return (
    <section style={{ background: "transparent", padding: "96px clamp(20px, 5vw, 80px)", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header — centered */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p className="reveal" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(10,10,15,0.55)", marginBottom: 14, fontFamily: "DM Sans, sans-serif" }}>Who it&apos;s for</p>
          <h2 className="reveal" style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(36px, 5vw, 56px)", color: "#0A0A0F", letterSpacing: "-1.5px", lineHeight: 1.1, margin: "0 0 18px" }}>
            Built for people who build.
          </h2>
          <p className="reveal" style={{ fontSize: 16, color: "rgba(10,10,15,0.55)", fontFamily: "DM Sans, sans-serif", maxWidth: 540, margin: "0 auto" }}>
            Whatever your workflow — Lumia keeps your full context one shortcut away.
          </p>
        </div>

        {/* Persona grid — 3 tiles */}
        <div className="persona-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
        }}>
          {PERSONAS.map(p => {
            const isCreator = p.label === "The Creator";
            const isBuilder = p.label === "The Builder";
            const isFounder = p.label === "The Founder";
            const hasBg = isCreator || isBuilder || isFounder;
            const bgUrl = isCreator ? "/creator-bg.jpg" : isBuilder ? "/builder-bg.jpg" : isFounder ? "/founder-bg.jpg" : null;
            const bgPos = isCreator ? "center 20%" : isBuilder ? "center" : isFounder ? "center" : undefined;
            return (
            <div key={p.label} className="persona-card" style={{
              position: "relative",
              borderRadius: 20,
              overflow: "hidden",
              cursor: "default",
              background: hasBg ? "#0A0A0F" : "#000",
              backgroundImage: bgUrl ? `url('${bgUrl}')` : undefined,
              backgroundSize: hasBg ? "cover" : undefined,
              backgroundPosition: bgPos,
              border: "0.5px solid rgba(255,255,255,0.18)",
              padding: "36px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              minHeight: 380,
              aspectRatio: "3 / 4",
              boxShadow: "0 30px 60px -20px rgba(10,10,15,0.45), 0 12px 28px -12px rgba(10,10,15,0.30), 0 2px 6px rgba(10,10,15,0.10)",
              transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease",
            }}>
              {hasBg && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.65) 100%)",
                  pointerEvents: "none",
                }} />
              )}
              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
                <h3 className="persona-title" style={{
                  fontFamily: "var(--font-bricolage), sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(40px, 4.4vw, 56px)",
                  letterSpacing: "-2px",
                  color: "#fff",
                  margin: 0,
                  lineHeight: 0.95,
                  textTransform: "uppercase",
                  textShadow: hasBg ? "0 2px 14px rgba(0,0,0,0.55)" : undefined,
                }}>
                  {p.title.split(' ').map((w, i) => (
                    <span key={i} style={{ display: "block" }}>{w}</span>
                  ))}
                </h3>
                <p className="persona-desc" style={{
                  fontSize: 14,
                  color: hasBg ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.68)",
                  lineHeight: 1.55,
                  fontFamily: "DM Sans, sans-serif",
                  margin: 0,
                  textShadow: hasBg ? "0 1px 8px rgba(0,0,0,0.5)" : undefined,
                }}>
                  {p.desc.split('\n').map((line, i) => <span key={i}>{line}{i < p.desc.split('\n').length - 1 && <br />}</span>)}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Skills Section ───────────────────────────────────────────────────────────
function SkillsSection() {
  const FEATURED_SKILLS = [
    { cat: "Content",  skills: ["TikTok Script", "LinkedIn Post", "Newsletter", "YouTube Script", "Instagram Reel", "X Thread"] },
    { cat: "Business", skills: ["Cold Email", "Landing Page", "Facebook Ad", "Email Sequence", "Case Study", "User Persona"] },
    { cat: "Code",     skills: ["Code Review", "API Docs", "Refactor Plan", "Bug Report", "Tech Spec", "PR Description"] },
  ];
  const TEMPLATE_ITEMS = [
    { icon: "📄", name: "Target Audience — Lumia", tag: "#audience", color: "#567EFC" },
    { icon: "📝", name: "Brand Voice Guide",        tag: "#voice",    color: "#C2AED4" },
    { icon: "🎯", name: "Ideal Customer Profile",   tag: "#icp",      color: "#FF7769" },
    { icon: "⚙️", name: "Tech Stack & Constraints", tag: "#stack",    color: "#567EFC" },
  ];
  const MODEL_LOGOS = [
    { src: "/claude-ai-icon.webp", name: "Claude" },
    { src: "/chatgpt-icon.webp", name: "ChatGPT" },
    { src: "/google-gemini-icon.webp", name: "Gemini" },
    { src: "/perplexity-ai-icon.webp", name: "Perplexity" },
    { src: "/grok-icon.webp", name: "Grok" },
  ];
  const AUDIENCE_OPTS = ["B2B SaaS", "Freelancers", "Agencies", "Founders"];

  return (
    <section style={{ padding: "48px clamp(20px, 5vw, 72px) 96px", background: "transparent", position: "relative", overflow: "hidden" }}>
      {/* Background blobs */}
      <div style={{ position: "absolute", top: "15%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(86,126,252,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "-5%", width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle, rgba(235,94,94,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(32px, 4vw, 50px)", letterSpacing: "-2px", color: "#0A0A0F", lineHeight: 1.1, margin: "0 0 16px" }}>
            Your context. Pre-loaded.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(10,10,15,0.55)", fontFamily: "DM Sans, sans-serif", maxWidth: 520, margin: "0 auto", lineHeight: 1.65 }}>
            Lumia doesn&apos;t give you templates. It remembers your stack, your projects, your voice — and builds the prompt for you. You just think out loud.
          </p>
        </div>

        {/* ── Feature rows — alternating mockup/text ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>

          {/* Row 1 — Skills: mockup left, text right */}
          <div className="reveal skills-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div style={{ background: "rgba(0,0,0,0.04)", backdropFilter: "blur(32px) saturate(150%)", WebkitBackdropFilter: "blur(32px) saturate(150%)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 24, padding: "28px", overflow: "hidden", position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.10)" }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8BA8FD", fontFamily: "DM Sans, sans-serif", margin: "0 0 16px" }}>100+ Skills built-in</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {FEATURED_SKILLS.map(({ cat, skills }) => (
                  <div key={cat}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(10,10,15,0.45)", fontFamily: "DM Sans, sans-serif", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.1em" }}>{cat}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {skills.map(s => (
                        <span key={s} style={{ fontSize: 11, fontWeight: 500, fontFamily: "DM Sans, sans-serif", color: "rgba(10,10,15,0.75)", background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: "4px 12px", whiteSpace: "nowrap" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "rgba(10,10,15,0.45)", fontFamily: "DM Sans, sans-serif" }}>+ Creative · Personal · Research</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {MODEL_LOGOS.map(m => (
                    <img key={m.name} src={m.src} alt={m.name} style={{ width: 16, height: 16, objectFit: "contain", opacity: 0.6, borderRadius: 3 }} />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "#8BA8FD", fontFamily: "DM Sans, sans-serif", margin: "0 0 14px" }}>Skills</p>
              <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(26px, 3vw, 36px)", letterSpacing: "-1px", color: "#0A0A0F", margin: "0 0 16px", lineHeight: 1.15 }}>Say what you need.<br />The right skill fires.</h3>
              <p style={{ fontSize: 15, color: "rgba(10,10,15,0.50)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.7, margin: "0 0 24px" }}>Type &quot;write a cold email&quot; and Lumia detects the intent, loads the right skill, and builds the prompt — tailored to Claude, ChatGPT, or Gemini. No setup. No switching.</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(86,126,252,0.10)", border: "1px solid rgba(86,126,252,0.20)", borderRadius: 14, padding: "7px 16px" }}>
                <span style={{ fontSize: 13 }}>⚡</span>
                <span style={{ fontSize: 12, color: "#8BA8FD", fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>Auto-detected · Works on every AI</span>
              </div>
            </div>
          </div>

          {/* Row 2 — Vault: text left, mockup right */}
          <div className="reveal skills-row skills-row-reversed" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "#C2AED4", fontFamily: "DM Sans, sans-serif", margin: "0 0 14px" }}>Templates</p>
              <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(26px, 3vw, 36px)", letterSpacing: "-1px", color: "#0A0A0F", margin: "0 0 16px", lineHeight: 1.15 }}>Your context,<br />always pre-loaded.</h3>
              <p style={{ fontSize: 15, color: "rgba(10,10,15,0.50)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.7, margin: "0 0 24px" }}>Reference any saved doc with <span style={{ fontFamily: "monospace", background: "rgba(194,174,212,0.12)", borderRadius: 4, padding: "2px 7px", color: "#C2AED4", fontSize: 13 }}>@document</span> or any template with <span style={{ fontFamily: "monospace", background: "rgba(194,174,212,0.12)", borderRadius: 4, padding: "2px 7px", color: "#C2AED4", fontSize: 13 }}>#template</span>. Lumia injects exactly what&apos;s needed — nothing more.</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(194,174,212,0.10)", border: "1px solid rgba(194,174,212,0.20)", borderRadius: 14, padding: "7px 16px" }}>
                <span style={{ fontSize: 13 }}>📦</span>
                <span style={{ fontSize: 12, color: "#C2AED4", fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>Vault-powered · Precision retrieval</span>
              </div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.04)", backdropFilter: "blur(32px) saturate(150%)", WebkitBackdropFilter: "blur(32px) saturate(150%)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 24, padding: "28px", overflow: "hidden", position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.10)" }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(10,10,15,0.45)", fontFamily: "DM Sans, sans-serif", margin: "0 0 14px" }}>Your Vault</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {TEMPLATE_ITEMS.map(item => (
                  <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14 }}>{item.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(10,10,15,0.85)", fontFamily: "DM Sans, sans-serif" }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: item.color, background: item.color + "22", borderRadius: 14, padding: "3px 10px", fontFamily: "DM Sans, sans-serif", flexShrink: 0 }}>{item.tag}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(86,126,252,0.12)", border: "1px solid rgba(86,126,252,0.25)", borderRadius: 12, padding: "10px 14px" }}>
                <p style={{ fontSize: 12, color: "rgba(139,168,253,0.95)", fontFamily: "DM Sans, sans-serif", margin: 0 }}>✦ Injecting <strong>#icp</strong> + <strong>@audience</strong> into prompt…</p>
              </div>
            </div>
          </div>

          {/* Row 3 — Reverse Prompting: mockup left, text right */}
          <div className="reveal skills-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div style={{ background: "rgba(0,0,0,0.04)", backdropFilter: "blur(32px) saturate(150%)", WebkitBackdropFilter: "blur(32px) saturate(150%)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 24, padding: "28px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.10)" }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#8BA8FD", background: "rgba(86,126,252,0.15)", border: "1px solid rgba(86,126,252,0.30)", borderRadius: 14, padding: "4px 12px", fontFamily: "DM Sans, sans-serif" }}>Cold Email</span>
                <span style={{ fontSize: 11, color: "rgba(10,10,15,0.65)", background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: "4px 12px", fontFamily: "DM Sans, sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                  <img src="/claude-ai-icon.webp" alt="Claude" style={{ width: 12, height: 12, objectFit: "contain", opacity: 0.8 }} />Claude
                </span>
              </div>
              <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(10,10,15,0.50)", fontFamily: "DM Sans, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Target audience</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {AUDIENCE_OPTS.map((opt, i) => (
                  <span key={opt} style={{ fontSize: 12, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? "#0A0A0F" : "rgba(10,10,15,0.65)", background: i === 0 ? "linear-gradient(90deg, #598CFF, #FF7359)" : "rgba(0,0,0,0.04)", border: i === 0 ? "none" : "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: "6px 14px", fontFamily: "DM Sans, sans-serif" }}>{opt}</span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 13, color: "rgba(10,10,15,0.65)", fontFamily: "DM Sans, sans-serif" }}>Include social proof?</span>
                <div style={{ width: 38, height: 22, borderRadius: 11, background: "linear-gradient(90deg, #598CFF, #4CABFF)", position: "relative" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, right: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, padding: "11px 0", background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, fontSize: 13, color: "rgba(10,10,15,0.65)", fontFamily: "DM Sans, sans-serif", textAlign: "center" }}>Skip ↗</div>
                <div style={{ flex: 1, padding: "11px 0", background: "linear-gradient(90deg, #598CFF, #FF7359)", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "DM Sans, sans-serif", textAlign: "center" }}>Continue →</div>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "#8BA8FD", fontFamily: "DM Sans, sans-serif", margin: "0 0 14px" }}>Reverse Prompting</p>
              <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(26px, 3vw, 36px)", letterSpacing: "-1px", color: "#0A0A0F", margin: "0 0 16px", lineHeight: 1.15 }}>Asks before it builds —<br />for every model.</h3>
              <p style={{ fontSize: 15, color: "rgba(10,10,15,0.50)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.7, margin: "0 0 24px" }}>Lumia knows exactly which context Claude, ChatGPT, or Gemini each needs. The questions it asks are specific to your skill <em style={{ color: "rgba(10,10,15,0.65)" }}>and</em> your model — so every prompt lands, regardless of which AI you use.</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(86,126,252,0.10)", border: "1px solid rgba(86,126,252,0.20)", borderRadius: 14, padding: "7px 16px" }}>
                <span style={{ fontSize: 13 }}>🧠</span>
                <span style={{ fontSize: 12, color: "#8BA8FD", fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>Model-aware · Skill-specific</span>
              </div>
            </div>
          </div>

          {/* Row 4 — Multi-AI: text left, mockup right */}
          <div className="reveal skills-row skills-row-reversed" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "#FC9865", fontFamily: "DM Sans, sans-serif", margin: "0 0 14px" }}>Multi-AI routing</p>
              <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(26px, 3vw, 36px)", letterSpacing: "-1px", color: "#0A0A0F", margin: "0 0 16px", lineHeight: 1.15 }}>Follows you<br />everywhere.</h3>
              <p style={{ fontSize: 15, color: "rgba(10,10,15,0.50)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.7, margin: "0 0 24px" }}>Switch AI mid-session — Lumia re-routes your context instantly. Claude, ChatGPT, Gemini, Perplexity — your consultant doesn&apos;t lose context on switch. No re-briefing.</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(252,152,101,0.10)", border: "1px solid rgba(252,152,101,0.20)", borderRadius: 14, padding: "7px 16px" }}>
                <span style={{ fontSize: 13 }}>🌐</span>
                <span style={{ fontSize: 12, color: "#FC9865", fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>Works everywhere · Zero re-briefing</span>
              </div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.04)", backdropFilter: "blur(32px) saturate(150%)", WebkitBackdropFilter: "blur(32px) saturate(150%)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 24, padding: "28px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.10)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { logo: "/claude-ai-icon.webp", name: "Claude", status: "Active", color: "#D97706" },
                  { logo: "/chatgpt-icon.webp", name: "ChatGPT", status: "Ready", color: "#19C37D" },
                  { logo: "/google-gemini-icon.webp", name: "Gemini", status: "Ready", color: "#4285F4" },
                  { logo: "/perplexity-ai-icon.webp", name: "Perplexity", status: "Ready", color: "#6366F1" },
                ].map((ai, i) => (
                  <div key={ai.name} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.04)", border: i === 0 ? "1px solid rgba(252,152,101,0.28)" : "1px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: "11px 14px" }}>
                    <img src={ai.logo} alt={ai.name} style={{ width: 22, height: 22, objectFit: "contain", borderRadius: 5 }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(10,10,15,0.85)", fontFamily: "DM Sans, sans-serif", flex: 1 }}>{ai.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: ai.color, background: ai.color + "20", borderRadius: 99, padding: "3px 10px", fontFamily: "DM Sans, sans-serif" }}>{ai.status}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "rgba(10,10,15,0.55)", fontFamily: "DM Sans, sans-serif", margin: "16px 0 0", lineHeight: 1.5, textAlign: "center" }}>
                Lumia re-routes your context instantly.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Video Scroll-Scrub Background ───────────────────────────────────────────
function VideoBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: -1, overflow: "hidden", pointerEvents: "none" }}>
      <picture style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <source media="(min-width: 768px)" srcSet="/hero-bg-desktop.jpg" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-bg.jpg"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
          }}
        />
      </picture>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
    </div>
  );
}

// ─── Pillars Section (3 cards under hero) ────────────────────────────────────
function PillarsSection() {
  const PILLARS = [
    {
      num: "01",
      label: "WE CARRY IT",
      title: "WE CARRY IT",
      desc: "Anything on your mind. Anything in your drive.",
      bg: "linear-gradient(145deg, #FFE9C7 0%, #FFD29A 55%, #FFB77A 100%)",
      accent: "#8A3A12",
      visual: (
        <img src="/card1-bg.png" alt="Think it. Map it. Draft it." style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ),
    },
    {
      num: "02",
      label: "WE ALIGN IT",
      title: "WE ALIGN IT",
      desc: "Messy input gets structure. Unclear gets asked. No hallucination.",
      bg: "linear-gradient(145deg, #E9EEFF 0%, #CFD9FF 55%, #9FB1FF 100%)",
      accent: "#2433A8",
      visual: (
        <img src="/card2-bg.png" alt="We align it." style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ),
    },
    {
      num: "03",
      label: "SHIP IT",
      title: "SHIP IT",
      desc: "You speak your intent. We speak AI.",
      bg: "linear-gradient(145deg, #D9F7E4 0%, #A6E9BE 55%, #6FD89A 100%)",
      accent: "#0B6A3D",
      visual: (
        <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 18, padding: "16px 18px", minWidth: 220, boxShadow: "0 24px 48px -12px rgba(11,106,61,0.32), 0 6px 16px rgba(11,106,61,0.18)", transform: "rotate(-2deg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#0B6A3D", background: "rgba(11,106,61,0.12)", padding: "3px 9px", borderRadius: 10, fontFamily: "DM Sans, sans-serif", letterSpacing: "0.04em" }}>SHIPPED</span>
              <span style={{ fontSize: 10, color: "rgba(10,10,15,0.5)", fontFamily: "DM Sans, sans-serif" }}>0.8s</span>
            </div>
            <p style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 14, color: "#0A0A0F", lineHeight: 1.3, margin: "0 0 10px", letterSpacing: "-0.4px" }}>Cold email — B2B SaaS</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[100, 86, 94, 70].map((w, i) => (
                <div key={i} style={{ height: 5, width: `${w}%`, background: "rgba(10,10,15,0.12)", borderRadius: 4 }} />
              ))}
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
              <div style={{ flex: 1, padding: "7px 0", background: "#0A0A0F", color: "#fff", borderRadius: 10, fontSize: 11, fontWeight: 700, fontFamily: "DM Sans, sans-serif", textAlign: "center" }}>Copy</div>
              <div style={{ flex: 1, padding: "7px 0", background: "rgba(0,0,0,0.06)", color: "rgba(10,10,15,0.7)", borderRadius: 10, fontSize: 11, fontWeight: 700, fontFamily: "DM Sans, sans-serif", textAlign: "center" }}>Send</div>
            </div>
          </div>
          <div style={{ position: "absolute", top: "14%", left: "10%", transform: "rotate(-8deg)", background: "#0B6A3D", color: "#D9F7E4", fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 900, fontSize: 11, padding: "6px 12px", borderRadius: 8, letterSpacing: "0.5px" }}>✓ READY</div>
          <div style={{ position: "absolute", bottom: "16%", right: "10%", transform: "rotate(8deg)", background: "#fff", color: "#0A0A0F", fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 11, padding: "6px 12px", borderRadius: 8, boxShadow: "0 6px 14px rgba(11,106,61,0.2)" }}>no edits</div>
        </div>
      ),
    },
  ];

  return (
    <section style={{ background: "#EEEEEE", padding: "120px clamp(20px, 5vw, 80px) 110px", position: "relative" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ marginBottom: 56 }}>
          <p className="reveal" style={{ fontSize: 14, fontWeight: 700, color: "#0A0A0F", fontFamily: "DM Sans, sans-serif", margin: "0 0 18px", letterSpacing: "-0.2px" }}>
            One flow from thought to shipped output.
          </p>
          <h2 className="reveal" style={{
            fontFamily: "var(--font-bricolage), sans-serif",
            fontWeight: 900,
            fontSize: "clamp(44px, 7vw, 92px)",
            letterSpacing: "-3px",
            lineHeight: 0.95,
            color: "#0A0A0F",
            margin: 0,
          }}>
            How Lumia carries<br />your vision.
          </h2>
        </div>

        <div className="pillars-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {PILLARS.map(p => (
            <div key={p.num} className="pillar-item reveal">
              <div className="pillar-card" style={{
                background: p.bg,
                borderRadius: 28,
                aspectRatio: "4 / 5",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
              }}>
                <div style={{ position: "absolute", inset: 0 }}>{p.visual}</div>
              </div>
              <div style={{ padding: "22px 6px 0" }}>
                <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(20px, 2vw, 26px)", letterSpacing: "-0.8px", color: "#0A0A0F", margin: "0 0 8px", lineHeight: 1.1, whiteSpace: "pre-line" }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: 15, color: "rgba(10,10,15,0.6)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.55, margin: 0 }}>
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
          <button onClick={() => setIsSuccess(false)} style={{ padding: "12px 28px", background: "#0F0A1E", color: "#fff", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "var(--font-bricolage), sans-serif" }}>Back to Home</button>
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
      <div style={{ minHeight: "100vh", overflowX: "hidden" }}>
        <LiquidGlassNavbar onSignIn={() => setShowAuthModal(true)} />
        <HeroSection />
        <PillarsSection />
        <div className="dark-zone">
          <div className="noise-overlay" aria-hidden="true" />
          <HowItWorksSection />
          <ConsultantSection />
          <SkillsSection />
          <WorksOnTopOfSection />
          <ComparisonSection />
          <FrictionCalculator />
          <MadeForYouSection />
          <FounderSection />
          <PricingSection />
          <LaunchVideoSection />
          {/* Live Beyond closing statement */}
          <section style={{ background: "#000", padding: "120px clamp(20px, 5vw, 80px)", textAlign: "center", position: "relative" }}>
            <h2 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 900, fontStyle: "italic", fontSize: "clamp(72px, 14vw, 200px)", letterSpacing: "-4px", lineHeight: 0.92, color: "#fff", margin: "0 0 48px" }}>
              Live Beyond.
            </h2>
            <a href="#waitlist" className="btn-spring" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#000", color: "#fff", borderRadius: 14, padding: "16px 36px", fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 16, textDecoration: "none", border: "0.5px solid rgba(255,255,255,0.35)", letterSpacing: "-0.3px" }}>
              Join the waitlist <ArrowRight size={15} />
            </a>
          </section>
          <Footer />
        </div>
      </div>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
