"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image
            src="/lumia-logo-white.png"
            alt="Lumia"
            width={64}
            height={64}
            style={{ objectFit: "contain" }}
          />
          <span style={{
            fontFamily: "var(--font-bricolage), sans-serif",
            fontWeight: 800,
            fontSize: 36,
            color: "#fff",
            letterSpacing: "-0.8px",
          }}>Lumia</span>
        </div>

        {/* CTA */}
        <a
          href="#waitlist"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "10px 22px",
            borderRadius: 12,
            background: "#fff",
            color: "#000",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "var(--font-bricolage), sans-serif",
            textDecoration: "none",
            letterSpacing: "-0.2px",
            whiteSpace: "nowrap",
            transition: "opacity 0.15s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          Join waitlist
        </a>
      </div>
    </nav>
  );
}
