"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

interface LiquidGlassNavbarProps {
  onSignIn?: () => void;
}

export default function LiquidGlassNavbar({ onSignIn }: LiquidGlassNavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: "12px 16px",
      display: "flex",
      justifyContent: "center",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 1040,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        borderRadius: 16,
        background: scrolled ? "rgba(5,5,10,0.80)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        border: scrolled ? "0.5px solid rgba(255,255,255,0.10)" : "0.5px solid transparent",
        transition: "background 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease",
      }}>

        {/* Wordmark */}
        <span style={{
          fontFamily: "var(--font-bricolage), sans-serif",
          fontWeight: 800,
          fontSize: 36,
          color: "#fff",
          letterSpacing: "-0.8px",
        }}>Lumia</span>

        {/* CTA */}
        <a
          href="/LumiaAI-Installer.dmg"
          download
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px 8px 18px",
            borderRadius: 999,
            background: "transparent",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "var(--font-bricolage), sans-serif",
            textDecoration: "none",
            letterSpacing: "-0.2px",
            whiteSpace: "nowrap",
          }}
        >
          Try the beta
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "#D6F23C",
            color: "#0A0A0F",
          }}>
            <ArrowRight size={15} strokeWidth={2.5} />
          </span>
        </a>
      </div>
    </nav>
  );
}
