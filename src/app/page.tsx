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

  .lumia-faq-trigger { transition: background 0.2s ease; }
  .lumia-faq-trigger:hover { background: rgba(10,10,15,0.03); }
  .lumia-faq-trigger:focus-visible { outline: 2px solid #D4FF3A; outline-offset: -2px; }

  .hero-founder-link { transition: color 0.2s ease; }
  .hero-founder-link:hover { color: #D6F23C; }
  .hero-founder-link__text {
    background-image: linear-gradient(currentColor, currentColor);
    background-repeat: no-repeat;
    background-size: 0% 1px;
    background-position: 0 100%;
    transition: background-size 0.3s ease;
    padding-bottom: 1px;
  }
  .hero-founder-link:hover .hero-founder-link__text { background-size: 100% 1px; }
  .hero-founder-link__arrow { transition: transform 0.2s ease; }
  .hero-founder-link:hover .hero-founder-link__arrow { transform: translateX(3px); }

  .lumia-video-scrub::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    cursor: pointer;
    transition: transform 0.15s ease;
  }
  .lumia-video-scrub::-webkit-slider-thumb:hover { transform: scale(1.2); }
  .lumia-video-scrub::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    cursor: pointer;
  }
  
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

  /* ── Copilot section ─────────────────────────────────────────────── */
  .copilot-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 48px;
    align-items: end;
  }
  @media (max-width: 768px) {
    .copilot-grid {
      display: block;
      padding-top: 88px !important;
      padding-bottom: 48px !important;
    }
    .copilot-statue-desktop { display: none !important; }
    .copilot-statue-mobile {
      display: block !important;
      float: right;
      width: 64%;
      max-width: 360px;
      margin: 8px -12px 0 18px;
      shape-outside: url(/error-statue.png);
      shape-image-threshold: 0.4;
      shape-margin: 10px;
    }
    .copilot-grid .copilot-title {
      font-size: clamp(34px, 9.5vw, 48px) !important;
      letter-spacing: -1.2px !important;
      margin-bottom: 20px !important;
    }
    .copilot-grid .copilot-body {
      font-size: 15px !important;
      max-width: none !important;
      margin-bottom: 14px !important;
    }
    .copilot-grid .copilot-cta-wrap {
      clear: both;
      padding-top: 28px;
    }
    .copilot-grid .copilot-text {
      padding-bottom: 0 !important;
      display: block !important;
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

  /* ── "See where every answer comes from" card — mobile image, no scale ── */
  @media (max-width: 767px) {
    .card4-sources-img { transform: none !important; }
  }

  /* ── Friction calculator — minutes indicator fade ─────────────────── */
  @keyframes fcMinFade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @media (max-width: 767px) {
    .fc-toprow { flex-wrap: wrap !important; }
    .fc-minutes { width: 100%; text-align: right; }
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
        alignItems: "flex-start",
        padding: "140px clamp(20px, 5vw, 64px) 80px",
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
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, width: "100%", margin: "0 auto" }}>
        <div className="hero-orbital-grid">

          {/* ── LEFT: text ─────────────────────────────────────────────── */}
          <div className="hero-orbital-text" style={{ display: "flex", flexDirection: "column" }}>

            {/* H1 */}
            <h1 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(40px, 4.5vw, 68px)", letterSpacing: "-2.5px", lineHeight: 0.96, color: "#fff", margin: "0 0 24px", animation: "fadeUp 0.7s 0.08s ease both" }}>
              Synced AI.<br />Crafted prompts.<br />One overlay.
            </h1>

            {/* Subtitle */}
            <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 500, fontSize: "clamp(1rem, 1.15vw, 1.15rem)", color: "rgba(255,255,255,0.80)", margin: "0 0 36px", lineHeight: 1.65, animation: "fadeUp 0.7s 0.15s ease both", maxWidth: 440 }}>
              <strong style={{ fontWeight: 700, color: "#fff" }}>Raw idea in. Expert prompt out.</strong> — meet the overlay designed to hold your vision and make sure your AI tools never drift from it.
            </p>

            {/* CTAs */}
            <div className="hero-cta-row" style={{ display: "flex", flexWrap: "wrap", gap: 28, animation: "fadeUp 0.7s 0.25s ease both", alignItems: "center", marginTop: "clamp(120px, 18vh, 260px)" }}>
              <a href="#waitlist" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
                background: "#D6F23C",
                color: "#0A0A0F",
                borderRadius: 999,
                padding: "14px 26px",
                fontFamily: "var(--font-bricolage), sans-serif",
                fontWeight: 600,
                fontSize: "clamp(15px, 1.1vw, 17px)",
                textDecoration: "none",
                letterSpacing: "-0.2px",
              }}>
                Join the waitlist
                <ArrowRight size={18} strokeWidth={2.25} />
              </a>
            </div>

            <a
              href="#pricing"
              className="hero-founder-link"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 18,
                fontFamily: "DM Sans, sans-serif",
                fontSize: 13.5,
                fontWeight: 500,
                color: "rgba(255,255,255,0.65)",
                textDecoration: "none",
                letterSpacing: "-0.1px",
                animation: "fadeUp 0.7s 0.32s ease both",
                width: "fit-content",
              }}
            >
              <span className="hero-founder-link__text">
                Or skip the line — become a founding member ($99 lifetime)
              </span>
              <ArrowRight size={13} strokeWidth={2.25} className="hero-founder-link__arrow" />
            </a>
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

const QUALITY_CONFIG: Record<QualityKey, { frictionMin: number }> = {
  short:  { frictionMin: 3 },
  mid:    { frictionMin: 5 },
  struct: { frictionMin: 6 },
};

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
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Mode Toggle row */}
      <div className="fc-toprow" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}>
        <div style={{
          display: "inline-flex",
          background: "rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: 4,
          width: "fit-content",
          border: "1px solid rgba(255,255,255,0.14)",
        }}>
          {[["time", "Time"], ["money", "Money"]].map(([m, label]) => (
            <button key={m} onClick={() => setMode(m as "time" | "money")}
              style={{
                padding: "6px 16px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "DM Sans, sans-serif",
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#0F0A1E" : "rgba(255,255,255,0.70)",
                transition: "all 0.2s ease",
              }}>
              {label}
            </button>
          ))}
        </div>
        <span
          key={quality}
          aria-live="polite"
          className="fc-minutes"
          style={{
            fontFamily: "var(--font-bricolage), sans-serif",
            fontWeight: 400,
            fontSize: 13,
            color: "rgba(255,255,255,0.70)",
            letterSpacing: "-0.1px",
            animation: "fcMinFade 150ms ease-out",
          }}
        >
          {({ short: 4, mid: 5, struct: 6 } as Record<QualityKey, number>)[quality]} min per usable response
        </span>
      </div>

      {/* Quality pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(Object.keys(qualityLabels) as QualityKey[]).map(key => (
          <button key={key} onClick={() => setQuality(key)}
            style={{
              padding: "7px 12px",
              borderRadius: 999,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "DM Sans, sans-serif",
              background: quality === key ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.04)",
              color: quality === key ? "#fff" : "rgba(255,255,255,0.65)",
              border: `1px solid ${quality === key ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.10)"}`,
              transition: "all 0.2s",
            }}>
            {qualityLabels[key].title}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.80)", fontFamily: "DM Sans, sans-serif" }}>Prompts / day</label>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "var(--font-bricolage), sans-serif", background: "rgba(255,255,255,0.14)", padding: "3px 10px", borderRadius: 10 }}>{prompts}</span>
          </div>
          <input type="range" min={5} max={150} step={5} value={prompts} onChange={e => setPrompts(+e.target.value)} className="glass-slider" />
        </div>
        {mode === "money" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.80)", fontFamily: "DM Sans, sans-serif" }}>Hourly rate</label>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "var(--font-bricolage), sans-serif", background: "rgba(255,255,255,0.14)", padding: "3px 10px", borderRadius: 10 }}>${hourlyRate}</span>
            </div>
            <input type="range" min={25} max={400} step={25} value={hourlyRate} onChange={e => setHourlyRate(+e.target.value)} className="glass-slider" />
          </div>
        )}
      </div>

      {/* Results — 2 stat boxes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: "auto" }}>
        <div style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16,
          padding: "14px 14px",
          textAlign: "left",
        }}>
          <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(20px, 2vw, 26px)", color: "#fff", letterSpacing: "-0.6px", lineHeight: 1.05 }}>
            {mode === "time" ? fmtTime(animMinsMonth) : `$${Math.round(animMoneyMonth).toLocaleString()}`}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.60)", fontFamily: "DM Sans, sans-serif", marginTop: 4, fontWeight: 500 }}>Lost / month</div>
        </div>
        <div style={{
          background: "rgba(214,242,60,0.14)",
          border: "1px solid rgba(214,242,60,0.35)",
          borderRadius: 16,
          padding: "14px 14px",
          textAlign: "left",
        }}>
          <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(20px, 2vw, 26px)", color: "#D6F23C", letterSpacing: "-0.6px", lineHeight: 1.05 }}>
            {mode === "time" ? fmtTime(animHoursYear * 60) : `$${Math.round(animMoneyYear).toLocaleString()}`}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.80)", fontFamily: "DM Sans, sans-serif", marginTop: 4, fontWeight: 600 }}>Saved / year with Lumia</div>
        </div>
      </div>
    </div>
  );
}

// ─── Four Cards Section (2x2 grid, UGLYCASH-style) ──────────────────────────
function FourCardsSection() {
  const visualCard: React.CSSProperties = {
    background: "#0F0E14",
    borderRadius: 28,
    padding: 28,
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    height: 440,
    boxShadow: "0 12px 40px rgba(10,10,15,0.10)",
  };
  const titleStyle: React.CSSProperties = {
    fontFamily: "var(--font-bricolage), sans-serif",
    fontWeight: 800,
    fontSize: "clamp(18px, 1.6vw, 22px)",
    letterSpacing: "-0.5px",
    color: "#0A0A0F",
    margin: "20px 0 6px",
    lineHeight: 1.2,
  };
  const subStyle: React.CSSProperties = {
    fontFamily: "DM Sans, sans-serif",
    fontSize: 15,
    color: "rgba(10,10,15,0.60)",
    lineHeight: 1.55,
    margin: 0,
    fontWeight: 400,
  };

  return (
    <section style={{ padding: "40px clamp(20px, 5vw, 80px) 96px", background: "transparent" }}>
      <h2 style={{
        fontFamily: "var(--font-bricolage), sans-serif",
        fontWeight: 800,
        fontSize: "clamp(28px, 3.5vw, 48px)",
        letterSpacing: "-1.2px",
        lineHeight: 1.1,
        color: "#0A0A0F",
        margin: "0 auto 48px",
        maxWidth: 1040,
      }}>
        Built for what other tools miss.
      </h2>
      <style>{`
        .four-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px 24px;
          max-width: 1040px;
          margin: 0 auto;
        }
        @media (max-width: 820px) {
          .four-cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="four-cards-grid">

        {/* Card 1 — Calculator */}
        <div>
          <div style={visualCard}>
            <FrictionCalculator />
          </div>
          <h3 style={titleStyle}>Say goodbye to the &ldquo;edit&rdquo; button.</h3>
          <p style={subStyle}>First prompt works. Every time.</p>
        </div>

        {/* Card 2 — Multi-AI context */}
        <div>
          <div style={{ ...visualCard, padding: 0 }}>
            <img src="/same-context.png" alt="" aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: "scale(1.12)", transformOrigin: "center" }} />
          </div>
          <h3 style={titleStyle}>Same context. Different AI. Zero setup.</h3>
          <p style={subStyle}>Claude for code. ChatGPT for drafts. Gemini for search. Your context lands in each — you never re-brief.</p>
        </div>

        {/* Card 3 — Projects */}
        <div>
          <div style={{ ...visualCard, background: "#F5F5F3", padding: "32px 28px", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { name: "Brand Refresh", count: 12, active: true },
                { name: "Q2 Campaign", count: 18, active: false },
                { name: "Product Launch", count: 24, active: false },
                { name: "Website Redesign", count: 16, active: false },
                { name: "Investor Deck", count: 9, active: false },
              ].map(({ name, count, active }) => (
                <div key={name} style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "16px 18px",
                  background: active ? "#fff" : "#EBEBEA",
                  border: active ? "1.5px solid #C8E63A" : "1.5px solid transparent",
                  borderRadius: 16,
                  boxShadow: active ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
                }}>
                  {/* Folder icon */}
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M4 8.5C4 7.4 4.9 6.5 6 6.5H11.5L13.5 8.5H22C23.1 8.5 24 9.4 24 10.5V19.5C24 20.6 23.1 21.5 22 21.5H6C4.9 21.5 4 20.6 4 19.5V8.5Z"
                      stroke={active ? "#1A1A1A" : "#9A9A94"} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                  </svg>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 15, color: active ? "#0A0A0F" : "#6B6B66", letterSpacing: "-0.2px", lineHeight: 1.2 }}>{name}</div>
                    <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: active ? "#6B6B66" : "#9A9A94", marginTop: 2 }}>{count} items</div>
                  </div>
                  {active && (
                    <div style={{ width: 28, height: 28, borderRadius: 999, background: "#C8E63A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7L5.5 10L11.5 4" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <h3 style={titleStyle}>Switch projects. Never re-explain.</h3>
          <p style={subStyle}>Each project has its own vault — brand voice, decisions, sources. You change context in one click. Lumia follows.</p>
        </div>

        {/* Card 4 — Sources */}
        <div>
          <div style={{ ...visualCard, padding: 0 }}>
            <picture style={{ display: "block", width: "100%", height: "100%" }}>
              <source media="(max-width: 767px)" srcSet="/card4-sources-mobile.png" />
              <img className="card4-sources-img" src="/card4-sources.png" alt="" aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: "scale(1.12)", transformOrigin: "center" }} />
            </picture>
          </div>
          <h3 style={titleStyle}>See where every answer comes from.</h3>
          <p style={subStyle}>Every prompt shows its sources — which docs, which decisions, which vault entries fed in. No black box, no "trust me bro."</p>
        </div>

      </div>
    </section>
  );
}

// ─── For Who Section ──────────────────────────────────────────────────────────
function ForWhoSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const personas = [
    {
      title: "Solo founders",
      sub: "You're CEO, CTO, head of marketing, and support team. Lumia is your operator brain.",
      bg: "#000000",
      fg: "#FFFFFF",
      sub_fg: "rgba(255,255,255,0.70)",
      img: "/personas/solo-founders.jpg",
      imgFull: true,
      gradient: "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.10) 55%, transparent 100%)",
    },
    {
      title: "Indie devs",
      sub: "Shipping weekly, reviewing your own PRs, debugging at 2am. Lumia writes the prompts, you stay in the code.",
      bg: "#D4FF3A",
      fg: "#0A0A0F",
      sub_fg: "rgba(10,10,15,0.70)",
      img: "/personas/indie-devs.jpg",
      imgFull: true,
      gradient: "linear-gradient(to top, rgba(212,255,58,0.85) 0%, rgba(212,255,58,0.20) 55%, transparent 100%)",
    },
    {
      title: "Freelancers",
      sub: "Five clients, five brand voices, zero confusion. Each project stays in its own lane.",
      bg: "#F5F2EC",
      fg: "#0A0A0F",
      sub_fg: "rgba(10,10,15,0.70)",
      img: "/personas/freelancers.jpg",
      imgFull: true,
    },
  ];

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cards = Array.from(scroller.querySelectorAll<HTMLElement>("[data-persona-card]"));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.6) {
            const idx = Number((e.target as HTMLElement).dataset.index);
            setActiveIndex(idx);
          }
        });
      },
      { root: scroller, threshold: [0.6, 0.75, 0.9] }
    );
    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  const scrollToIndex = (i: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.querySelector<HTMLElement>(`[data-index="${i}"]`);
    if (card) card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <section style={{ padding: "96px 0 120px", background: "transparent" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .forwho-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 clamp(20px, 5vw, 80px);
        }
        .forwho-scroller {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding: 8px 0 24px;
          scrollbar-width: none;
        }
        .forwho-scroller::-webkit-scrollbar { display: none; }
        .forwho-card {
          flex: 0 0 85vw;
          scroll-snap-align: center;
          height: 480px;
          border-radius: 24px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          position: relative;
          overflow: hidden;
          transition: transform 200ms ease;
        }
        @media (min-width: 1024px) {
          .forwho-scroller {
            overflow-x: visible;
            scroll-snap-type: none;
          }
          .forwho-card {
            flex: 1 1 0;
            height: 580px;
          }
          .forwho-card:hover {
            transform: translateY(-4px);
          }
        }
      `}} />

      <div className="forwho-wrap">
        <h2 style={{
          fontFamily: "var(--font-bricolage), sans-serif",
          fontWeight: 800,
          fontSize: "clamp(40px, 6vw, 72px)",
          letterSpacing: "-2px",
          lineHeight: 1.0,
          color: "#0A0A0F",
          margin: "0 0 16px",
        }}>
          Built for one-person armies.
        </h2>
        <p style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: "clamp(16px, 1.6vw, 19px)",
          lineHeight: 1.55,
          color: "rgba(10,10,15,0.65)",
          margin: "0 0 40px",
          maxWidth: 640,
        }}>
          Solo founders, indie devs, creators, freelancers. If you ship alone, Lumia was made for you.
        </p>
      </div>

      <div className="forwho-wrap">
      <div ref={scrollerRef} className="forwho-scroller" role="region" aria-label="Who Lumia is for">
        {personas.map((p, i) => (
          <article
            key={p.title}
            data-persona-card
            data-index={i}
            className="forwho-card"
            style={{ background: p.bg, color: p.fg }}
          >
            <div style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${p.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: (p as { imgFull?: boolean }).imgFull ? 1 : 0.15,
              pointerEvents: "none",
            }} />
            {(p as { imgFull?: boolean; gradient?: string }).imgFull && (p as { gradient?: string }).gradient && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: (p as { gradient?: string }).gradient,
                pointerEvents: "none",
              }} />
            )}
            <div style={{ position: "relative", zIndex: 1 }}>
              <h3 style={{
                fontFamily: "var(--font-bricolage), sans-serif",
                fontWeight: 800,
                fontSize: 28,
                letterSpacing: "-0.8px",
                lineHeight: 1.1,
                margin: "0 0 12px",
                color: p.fg,
              }}>
                {p.title}
              </h3>
              <p style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 15,
                lineHeight: 1.55,
                color: p.sub_fg,
                margin: 0,
              }}>
                {p.sub}
              </p>
            </div>
          </article>
        ))}
      </div>
      </div>

      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 8,
        marginTop: 28,
      }}>
        {personas.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: activeIndex === i ? 24 : 8,
              height: 8,
              borderRadius: 999,
              border: "none",
              padding: 0,
              cursor: "pointer",
              background: activeIndex === i ? "#0A0A0F" : "rgba(10,10,15,0.20)",
              transition: "width 200ms ease, background 200ms ease",
            }}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Founder Section ──────────────────────────────────────────────────────────
function FounderSection() {
  return (
    <section style={{
      padding: "120px clamp(20px, 5vw, 80px)",
      background: "transparent",
      position: "relative",
    }}>
      <style>{`
        .founder-link {
          color: rgba(10,10,15,0.55);
          text-decoration: none;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          transition: color 0.2s ease, transform 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .founder-link:hover { color: #0A0A0F; transform: translateX(2px); }
        .founder-grid {
          display: grid;
          grid-template-columns: minmax(240px, 320px) 1fr;
          gap: clamp(32px, 5vw, 64px);
          align-items: start;
        }
        @media (max-width: 860px) {
          .founder-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .founder-portrait {
            max-width: 320px;
            margin: 0 auto;
          }
        }
      `}</style>

      <div style={{ maxWidth: 1040, margin: "0 auto" }}>

        {/* Section header — matches the DA of other sections */}
        <div style={{ marginBottom: 56, maxWidth: 680 }}>
          <p style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "rgba(10,10,15,0.50)",
            margin: "0 0 16px",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#D4FF3A", display: "inline-block" }} />
            The Founder
          </p>
          <h2 style={{
            fontFamily: "var(--font-bricolage), sans-serif",
            fontWeight: 800,
            fontSize: "clamp(32px, 3.8vw, 48px)",
            letterSpacing: "-1.4px",
            lineHeight: 1.05,
            color: "#0A0A0F",
            margin: "0 0 16px",
          }}>
            Built by one. For the ones who build alone.
          </h2>
          <p style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: "clamp(15px, 1.3vw, 17px)",
            lineHeight: 1.55,
            color: "rgba(10,10,15,0.60)",
            margin: 0,
            maxWidth: 540,
          }}>
            No team. No investors. No roadmap Twitter thread. Just one person who broke his own workflow enough times to build the fix.
          </p>
        </div>

        {/* Two-column content */}
        <div className="founder-grid">

          {/* Portrait card */}
          <div className="founder-portrait" style={{
            position: "relative",
            borderRadius: 28,
            overflow: "hidden",
            aspectRatio: "4 / 5",
            background: "#0F0E14",
            boxShadow: "0 20px 60px rgba(10,10,15,0.12)",
          }}>
            <img
              src="/founder.jpg"
              alt="Rosly, founder of Lumia"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            {/* Lime name chip, bottom-left */}
            <div style={{
              position: "absolute",
              left: 18,
              bottom: 18,
              background: "#D4FF3A",
              color: "#0A0A0F",
              padding: "10px 16px",
              borderRadius: 999,
              fontFamily: "var(--font-bricolage), sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "-0.2px",
              boxShadow: "0 4px 14px rgba(212,255,58,0.35)",
            }}>
              Rosly · 19 · Montréal
            </div>
          </div>

          {/* Story column */}
          <div>
            <p style={{
              fontFamily: "var(--font-bricolage), sans-serif",
              fontWeight: 700,
              fontSize: "clamp(18px, 1.7vw, 22px)",
              letterSpacing: "-0.5px",
              lineHeight: 1.3,
              color: "#0A0A0F",
              margin: "0 0 24px",
            }}>
              Engineering @ Polytechnique Montréal · Builder first, student second.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, lineHeight: 1.7, color: "rgba(10,10,15,0.70)", margin: 0 }}>
                I built Lumia because I kept breaking my own workflow trying to fix it. I connected NotebookLM to Gemini — too much context, the model choked. I tried a vector database on Supabase with Telegram bots — it worked, but I lost Claude&apos;s canvas, ChatGPT&apos;s artifacts, every native UI feature I actually rely on.
              </p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, lineHeight: 1.7, color: "rgba(10,10,15,0.70)", margin: 0 }}>
                Every fix forced a tradeoff. So I stopped replacing tools and built a layer on top instead.
              </p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, lineHeight: 1.7, color: "rgba(10,10,15,0.70)", margin: 0 }}>
                I send 50+ prompts a day. I don&apos;t want to learn prompt engineering — I want quality, fast. Lumia is what I built for myself first.
              </p>
            </div>

            {/* Closing tagline */}
            <div style={{
              display: "inline-block",
              background: "#0A0A0F",
              color: "#D4FF3A",
              fontFamily: "var(--font-bricolage), sans-serif",
              fontSize: 14,
              fontStyle: "italic",
              fontWeight: 600,
              letterSpacing: "-0.2px",
              padding: "10px 18px",
              borderRadius: 999,
              marginTop: 36,
            }}>
              Built in Montréal. Shipped solo.
            </div>

            {/* Social links */}
            <div style={{
              display: "flex",
              gap: 28,
              flexWrap: "wrap",
              marginTop: 32,
              paddingTop: 24,
              borderTop: "1px solid rgba(10,10,15,0.08)",
            }}>
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
    <section id="pricing" style={{ padding: "72px clamp(20px, 5vw, 80px) 80px", background: "transparent", position: "relative" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header — compact, left-aligned to match page DA */}
        <div style={{ marginBottom: 36, maxWidth: 680 }}>
          <p style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "rgba(10,10,15,0.50)",
            margin: "0 0 14px",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#D4FF3A", display: "inline-block" }} />
            Pricing
          </p>
          <h2 style={{
            fontFamily: "var(--font-bricolage), sans-serif",
            fontWeight: 800,
            fontSize: "clamp(32px, 3.8vw, 48px)",
            letterSpacing: "-1.4px",
            lineHeight: 1.05,
            color: "#0A0A0F",
            margin: "0 0 14px",
          }}>
            MVP stage. Two ways in.
          </h2>
          <p style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: "clamp(15px, 1.3vw, 17px)",
            lineHeight: 1.55,
            color: "rgba(10,10,15,0.60)",
            margin: 0,
          }}>
            To use the MVP today, become a Founder. Everyone else — join the waitlist.
          </p>
        </div>

        {/* 2-column plan grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 16, alignItems: "stretch" }}>

          {/* Waitlist — light card (secondary) */}
          <div id="waitlist" style={{
            background: "#F5F2EC",
            borderRadius: 24,
            padding: "28px 26px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(10,10,15,0.60)",
              background: "rgba(10,10,15,0.06)",
              borderRadius: 999, padding: "4px 10px", marginBottom: 16,
              fontFamily: "DM Sans, sans-serif", width: "fit-content",
            }}>Waitlist</div>

            <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 20, color: "#0A0A0F", margin: "0 0 12px", letterSpacing: "-0.3px" }}>
              Following along?
            </h3>

            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 18 }}>
              <span style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 44, letterSpacing: "-2px", lineHeight: 1, color: "#0A0A0F" }}>Free</span>
            </div>

            <div style={{ height: 1, background: "rgba(10,10,15,0.10)", marginBottom: 18 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22, flex: 1 }}>
              {waitlistFeatures.map((f, fi) => (
                <div key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(10,10,15,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <svg width="8" height="8" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#0A0A0F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 14, lineHeight: 1.5, color: "rgba(10,10,15,0.70)", fontFamily: "DM Sans, sans-serif" }}>{f}</span>
                </div>
              ))}
            </div>

            <WaitlistForm variant="pricing" />

            <p style={{ fontSize: 12, fontFamily: "DM Sans, sans-serif", textAlign: "center", marginTop: 10, marginBottom: 0, color: "rgba(10,10,15,0.50)" }}>
              We&apos;ll email you when the public beta opens.
            </p>
          </div>

          {/* Founder Pack — dark + lime accent, featured */}
          <div style={{
            background: "#0A0A0F",
            borderRadius: 24,
            padding: "28px 26px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 16px 48px rgba(10,10,15,0.18)",
          }}>
            <div style={{
              position: "absolute", top: -11, left: 20,
              background: "#D4FF3A", color: "#0A0A0F",
              fontSize: 10, fontWeight: 700, fontFamily: "DM Sans, sans-serif",
              padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap",
              letterSpacing: "0.12em", textTransform: "uppercase",
            }}>Limited · Beta</div>

            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.12em", color: "#D4FF3A",
              background: "rgba(212,255,58,0.12)",
              borderRadius: 999, padding: "4px 10px", marginBottom: 16,
              fontFamily: "DM Sans, sans-serif", width: "fit-content",
            }}>Founder Pack</div>

            <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 20, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.3px" }}>
              Get in today. Own it forever.
            </h3>

            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 18 }}>
              <span style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 44, letterSpacing: "-2px", lineHeight: 1, color: "#fff" }}>$99</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.50)", fontFamily: "DM Sans, sans-serif", fontWeight: 500 }}>once</span>
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.10)", marginBottom: 18 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22, flex: 1 }}>
              {founderFeatures.map((f, fi) => (
                <div key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#D4FF3A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <svg width="8" height="8" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#0A0A0F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.78)", fontFamily: "DM Sans, sans-serif" }}>{f}</span>
                </div>
              ))}
            </div>

            <PricingPaidForm />

            <p style={{ fontSize: 12, fontFamily: "DM Sans, sans-serif", textAlign: "center", marginTop: 10, marginBottom: 0, fontWeight: 600, color: "#D4FF3A" }}>
              MVP price — increases at public launch.
            </p>
          </div>
        </div>

        {/* Compact footer note */}
        <p style={{
          textAlign: "center", marginTop: 24, fontSize: 12,
          color: "rgba(10,10,15,0.50)", fontFamily: "DM Sans, sans-serif",
        }}>
          Lifetime access · No feature stripping · After beta, ~$15–20/mo for non-FMs
        </p>
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
    <section id="demo-video" style={{ background: "#000", padding: "120px clamp(20px, 5vw, 80px)", position: "relative", scrollMarginTop: 80 }}>
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

// ─── Hero Demo Video Section ──────────────────────────────────────────────────
function HeroDemoVideoSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setProgress(v.currentTime);
    const onMeta = () => setDuration(v.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const t = (parseFloat(e.target.value) / 100) * duration;
    v.currentTime = t;
    setProgress(t);
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <section
      style={{
        background: "#fff",
        padding: "40px clamp(20px, 5vw, 80px) 80px",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <h3
          style={{
            fontFamily: "var(--font-bricolage), sans-serif",
            fontSize: "clamp(22px, 2.4vw, 32px)",
            fontWeight: 700,
            letterSpacing: "-0.8px",
            lineHeight: 1.25,
            color: "#0A0A0F",
            margin: "0 0 14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            maxWidth: 720,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#D4FF3A",
              boxShadow: "0 0 14px rgba(212,255,58,0.75)",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          v1.0 — live, working, slightly rough on the edges.
        </h3>

        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: "clamp(15px, 1.15vw, 17px)",
            fontWeight: 400,
            lineHeight: 1.55,
            color: "rgba(10,10,15,0.7)",
            margin: "0 0 28px",
            maxWidth: 640,
          }}
        >
          Real session on my Mac. The MVP ships today — every founding member shapes what v2 looks like.
        </p>
        <div
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: 24,
            overflow: "hidden",
            background: "#000",
            boxShadow: "0 30px 80px rgba(10,10,15,0.18), 0 0 0 1px rgba(10,10,15,0.06)",
            cursor: "pointer",
          }}
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src="/demo-video.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />

          {/* Centered play overlay when paused */}
          {!playing && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.25)",
                pointerEvents: "none",
                transition: "background 0.2s ease",
              }}
            >
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.95)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#0A0A0F">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}

          {/* Bottom control bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              padding: "32px 20px 16px",
              background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              opacity: hovering || !playing ? 1 : 0,
              transition: "opacity 0.25s ease",
            }}
          >
            <button
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.95)",
                color: "#0A0A0F",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {playing ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <span
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.85)",
                fontVariantNumeric: "tabular-nums",
                minWidth: 36,
              }}
            >
              {fmt(progress)}
            </span>

            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={pct}
              onChange={onSeek}
              aria-label="Seek"
              className="lumia-video-scrub"
              style={{
                flex: 1,
                appearance: "none",
                WebkitAppearance: "none",
                height: 4,
                borderRadius: 999,
                background: `linear-gradient(to right, #fff 0%, #fff ${pct}%, rgba(255,255,255,0.25) ${pct}%, rgba(255,255,255,0.25) 100%)`,
                outline: "none",
                cursor: "pointer",
              }}
            />

            <span
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.6)",
                fontVariantNumeric: "tabular-nums",
                minWidth: 36,
              }}
            >
              {fmt(duration)}
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: 28,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: "clamp(14px, 1.05vw, 16px)",
              fontWeight: 400,
              lineHeight: 1.6,
              color: "rgba(10,10,15,0.78)",
              margin: 0,
            }}
          >
            <strong style={{ fontWeight: 700, color: "#0A0A0F" }}>Beta is capped at 30 founding members.</strong> I onboard each one personally — Loom welcome, direct line on Slack, top 3 feature votes shipped first.
          </p>

          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: "clamp(14px, 1.05vw, 16px)",
              fontWeight: 400,
              lineHeight: 1.6,
              color: "rgba(10,10,15,0.78)",
              margin: 0,
            }}
          >
            <strong style={{ fontWeight: 700, color: "#0A0A0F" }}>Lifetime access for $99.</strong> After that, the next batch waits for v2.
          </p>

          <a
            href="#pricing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              alignSelf: "flex-end",
              marginTop: 8,
              background: "#0A0A0F",
              color: "#fff",
              borderRadius: 999,
              padding: "12px 22px",
              fontFamily: "var(--font-bricolage), sans-serif",
              fontWeight: 600,
              fontSize: "clamp(14px, 1vw, 16px)",
              letterSpacing: "-0.2px",
              textDecoration: "none",
              transition: "transform 0.2s ease, background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1a1a24";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#0A0A0F";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Become a founding member
            <ArrowRight size={16} strokeWidth={2.25} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ Section ──────────────────────────────────────────────────────────────
const FAQ_ITEMS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Is Lumia actually working today, or is this a pre-launch?",
    a: "Lumia is live and working. Founding members get access today, not on a future date. The MVP is v1 — solid on the core flow, with rough edges I'm shipping fixes for daily. The demo on this page is the actual product, recorded on my Mac.",
  },
  {
    q: "Why not just use Claude Projects or ChatGPT memory?",
    a: "Claude Projects work — but only inside Claude. ChatGPT memory works — but only inside ChatGPT. The moment you switch tools (Claude for code, ChatGPT for drafts, Gemini for search), your context is stuck in silos. Lumia is the layer above all of them — same vault, every AI. If you only ever use one AI tool, you don't need Lumia. If you switch between 2+, that's where Lumia earns its keep.",
  },
  {
    q: "Is Lumia Mac-only?",
    a: "Yes, macOS only for now (the overlay relies on macOS-specific APIs). Windows is on the roadmap if there's enough demand from founders — vote for it once you're in.",
  },
  {
    q: "$99 lifetime — what's the catch?",
    a: "No catch. Founding members lock in $99 once, get the MVP today, and keep every feature I ship — no future paywall, no \"premium tier\" added later. The reason it's $99 and not $20/mo? I'd rather have 30 founders fully invested than 300 churning monthly. The non-FM tier ($15–20/mo) launches after public beta.",
  },
  {
    q: "You're 19 and solo. What if you stop building Lumia?",
    a: "Fair question. I don't have an investor I owe a 5-year roadmap to, but I also don't have a cofounder breaking up with me. I send 50+ prompts a day through Lumia myself — the day I stop using it is the day I stop being its target user. Worst case: founding members get a data export and the codebase becomes open source.",
  },
];

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" style={{ padding: "72px clamp(20px, 5vw, 80px) 96px", background: "transparent", position: "relative" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Header — same DA as pricing */}
        <div style={{ marginBottom: 36, maxWidth: 680, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "rgba(10,10,15,0.50)",
            margin: "0 0 14px",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#D4FF3A", display: "inline-block" }} />
            FAQ
          </p>
          <h2 style={{
            fontFamily: "var(--font-bricolage), sans-serif",
            fontWeight: 800,
            fontSize: "clamp(32px, 3.8vw, 48px)",
            letterSpacing: "-1.4px",
            lineHeight: 1.05,
            color: "#0A0A0F",
            margin: "0 0 14px",
          }}>
            Questions before you commit.
          </h2>
          <p style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: "clamp(15px, 1.3vw, 17px)",
            lineHeight: 1.55,
            color: "rgba(10,10,15,0.60)",
            margin: 0,
          }}>
            The 5 things every founder asks before becoming a Founding Member.
          </p>
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: 760,
            borderRadius: 20,
            background: "rgba(255,255,255,0.55)",
            border: "1px solid rgba(10,10,15,0.08)",
            overflow: "hidden",
          }}
        >
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                style={{
                  borderTop: idx === 0 ? "none" : "1px solid rgba(10,10,15,0.08)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="lumia-faq-trigger"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 24,
                    padding: "22px clamp(18px, 2.4vw, 28px)",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "var(--font-bricolage), sans-serif",
                    fontWeight: 700,
                    fontSize: "clamp(16px, 1.35vw, 19px)",
                    letterSpacing: "-0.4px",
                    color: "#0A0A0F",
                    lineHeight: 1.35,
                  }}
                >
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    style={{
                      flexShrink: 0,
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: isOpen ? "#D4FF3A" : "rgba(10,10,15,0.06)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.25s ease, transform 0.25s ease",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      color: "#0A0A0F",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1.5V12.5M1.5 7H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <p
                        style={{
                          fontFamily: "DM Sans, sans-serif",
                          fontSize: "clamp(14px, 1.05vw, 16px)",
                          lineHeight: 1.65,
                          color: "rgba(10,10,15,0.72)",
                          margin: 0,
                          padding: "0 clamp(18px, 2.4vw, 28px) 24px",
                          maxWidth: 680,
                        }}
                      >
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: "#0A0A0F", padding: "48px clamp(20px, 5vw, 80px) 40px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        {/* Big wordmark row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            paddingBottom: 28,
            borderBottom: "0.5px solid rgba(255,255,255,0.08)",
          }}
        >
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/lumia-logo-white.png" alt="Lumia" style={{ width: 28, height: 28, objectFit: "contain" }} />
            <span
              style={{
                fontFamily: "var(--font-bricolage), sans-serif",
                fontWeight: 800,
                fontSize: "clamp(28px, 3.6vw, 44px)",
                letterSpacing: "-1.4px",
                color: "#fff",
                lineHeight: 1,
              }}
            >
              Lumia
            </span>
          </a>

          {/* Eyebrow — building in public */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#D4FF3A",
                boxShadow: "0 0 12px rgba(212,255,58,0.6)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              Building in public
            </span>
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            paddingTop: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
              fontFamily: "DM Sans, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            <span>© 2026 Lumia · Montréal</span>
            <a
              href="mailto:rosly@getlumia.ca"
              style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.15)" }}
            >
              rosly@getlumia.ca
            </a>
          </div>

          <a
            href="https://x.com/_r0sly_"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "DM Sans, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: "#0A0A0F",
              textDecoration: "none",
              padding: "8px 14px",
              borderRadius: 999,
              background: "#D4FF3A",
              letterSpacing: "-0.1px",
            }}
          >
            @_r0sly_ on X
            <span aria-hidden style={{ fontSize: 12 }}>↗</span>
          </a>
        </div>
      </div>
    </footer>
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

// ─── Copilot Section ─────────────────────────────────────────────────────────
function CopilotSection() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <section style={{ background: "#F4F4F2", position: "relative" }}>
      {/* Conteneur aligné sur la navbar (maxWidth 1040, centré) */}
      <div className="copilot-grid" style={{
        maxWidth: 1040,
        margin: "0 auto",
        padding: "136px 16px 0",
      }}>
        {/* Left — title + copy + CTA */}
        <div className="copilot-text" style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: 122 }}>
          <h2 className="copilot-title" style={{
            fontFamily: "var(--font-bricolage), sans-serif",
            fontWeight: 800,
            fontSize: "clamp(36px, 5vw, 56px)",
            color: "#0A0A0F",
            letterSpacing: "-1.5px",
            lineHeight: 1.1,
            margin: "0 0 28px",
          }}>
            Because you&apos;re supposed<br />to make it. <span style={{ position: "relative", display: "inline-block" }}>
              prompt it.
              <svg
                viewBox="0 0 300 14"
                preserveAspectRatio="none"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-2%",
                  width: "104%",
                  top: "52%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              >
                <path
                  d="M 4,7 C 40,4.5 80,9.5 130,7 C 180,4.5 230,9 296,7"
                  stroke="#d4ff01"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
          </h2>
          {/* Statue (mobile only — floats right after title, text wraps around) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="copilot-statue copilot-statue-mobile"
            src="/error-statue.png"
            alt=""
            aria-hidden="true"
            style={{ display: "none" }}
          />
          <p className="copilot-body" style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: "clamp(14px, 1vw, 16px)",
            color: "rgba(10,10,15,0.60)",
            lineHeight: 1.65,
            margin: "0 0 16px",
            maxWidth: 400,
          }}>
            Lumia holds your context — projects, voice, decisions — and turns your raw thoughts into perfectly crafted prompts for every AI tool you use.
          </p>
          <p className="copilot-body" style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: "clamp(14px, 1vw, 16px)",
            color: "rgba(10,10,15,0.60)",
            lineHeight: 1.65,
            margin: "0 0 40px",
            maxWidth: 360,
          }}>
            It&apos;s the shortcut between mind and execution.
          </p>
          <div className="copilot-cta-wrap">
            <button
              onClick={() => scrollTo("how")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 500,
                fontSize: 15,
                color: "#0A0A0F",
                letterSpacing: "-0.2px",
                width: "fit-content",
              }}
            >
              See how it works
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: "1.5px solid rgba(10,10,15,0.30)",
                color: "#0A0A0F",
              }}>
                <ArrowRight size={13} strokeWidth={2} />
              </span>
            </button>
          </div>
        </div>

        {/* Right — statue image (desktop only) */}
        <div className="copilot-statue-desktop" style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/error-statue.png"
            alt="AI error statue"
            style={{
              width: "100%",
              maxWidth: 460,
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>
      </div>
    </section>
  );
}

// ─── Pillars Section (3 cards under hero) ────────────────────────────────────
function PillarsSection() {
  const [showDemo, setShowDemo] = useState(false);
  useEffect(() => {
    if (!showDemo) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowDemo(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [showDemo]);
  const PILLARS = [
    {
      num: "01",
      label: "We carry it.",
      title: "We carry it.",
      desc: "When you @mention a document or project, that's the Vault. Your context — projects, voice, decisions — stored once, reused forever.",
      bg: "linear-gradient(145deg, #FFE9C7 0%, #FFD29A 55%, #FFB77A 100%)",
      accent: "#8A3A12",
      visual: (
        <img src="/we-carry-it.jpg" alt="we carry it" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ),
    },
    {
      num: "02",
      label: "We align it.",
      title: "We align it.",
      desc: "When the overlay asks you a question, that's the Architect. It catches what's vague, pulls from the Vault, and clarifies before the AI sees a thing.",
      bg: "linear-gradient(145deg, #E9EEFF 0%, #CFD9FF 55%, #9FB1FF 100%)",
      accent: "#2433A8",
      visual: (
        <img src="/card2-bg.png" alt="We align it." style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ),
    },
    {
      num: "03",
      label: "We structure it.",
      title: "We structure it.",
      desc: "When Lumia delivers a ready-to-ship prompt to Claude, that's the output. Tailored to each AI tool, every time.",
      bg: "linear-gradient(145deg, #D9F7E4 0%, #A6E9BE 55%, #6FD89A 100%)",
      accent: "#0B6A3D",
      visual: (
        <img src="/ship-it.jpg" alt="Ship it." style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ),
    },
  ];

  return (
    <section style={{ background: "#EEEEEE", padding: "120px 16px 110px", position: "relative" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ marginBottom: 56, textAlign: "center" }}>
          <h2 style={{
            fontFamily: "var(--font-bricolage), sans-serif",
            fontWeight: 800,
            fontSize: "clamp(36px, 5vw, 56px)",
            letterSpacing: "-1.5px",
            lineHeight: 1.1,
            color: "#0A0A0F",
            margin: 0,
          }}>
            The 3 pillars.
          </h2>
        </div>

        <div className="pillars-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {PILLARS.map(p => (
            <div key={p.num} className="pillar-item reveal" style={{ position: "relative" }}>
              <div className="pillar-card" style={{
                background: p.bg,
                borderRadius: 16,
                aspectRatio: "4 / 5",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
              }}>
                <div style={{ position: "absolute", inset: 0 }}>{p.visual}</div>
              </div>
              {/* Title sits flush at the card's bottom boundary */}
              <h3 style={{
                fontFamily: "var(--font-bricolage), sans-serif",
                fontWeight: 800,
                fontSize: "clamp(18px, 1.8vw, 24px)",
                letterSpacing: "-0.5px",
                color: "#0A0A0F",
                margin: "0 0 6px",
                paddingTop: 14,
                paddingLeft: 16,
                lineHeight: 1.1,
              }}>
                {p.title}
              </h3>
              <p style={{ fontSize: 15, color: "rgba(10,10,15,0.6)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.55, margin: 0, paddingLeft: 16 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 56 }}>
          <a
            href="#waitlist"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 22px",
              borderRadius: 999,
              background: "#0A0A0F",
              color: "#fff",
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "-0.2px",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            Join the waitlist
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#D4FF3A",
                color: "#0A0A0F",
              }}
            >
              <ArrowRight size={12} strokeWidth={2.5} />
            </span>
          </a>
        </div>
      </div>

      {showDemo && (
        <div
          onClick={() => setShowDemo(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.78)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(16px, 4vw, 48px)",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 1100,
              aspectRatio: "16 / 9",
              borderRadius: 20,
              overflow: "hidden",
              background: "#000",
              boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            <video
              src="/demo-video.mp4"
              autoPlay
              controls
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowDemo(false)}
            aria-label="Close"
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              fontSize: 18,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(10px)",
            }}
          >
            ×
          </button>
        </div>
      )}
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
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Permanent+Marker&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      <div style={{ minHeight: "100vh", overflowX: "hidden" }}>
        <LiquidGlassNavbar onSignIn={() => setShowAuthModal(true)} />
        <HeroSection />
        <HeroDemoVideoSection />
        <PillarsSection />
        <CopilotSection />
        <FourCardsSection />
        <div className="dark-zone">
          <div className="noise-overlay" aria-hidden="true" />
          <FounderSection />
          <FAQSection />
          <PricingSection />
          <Footer />
        </div>
      </div>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
