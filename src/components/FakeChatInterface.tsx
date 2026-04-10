"use client";

import React from "react";

// ─── Prompt Lumia generates ───────────────────────────────────────────────────
const PASTE_TEXT =
  "Act as a SaaS growth strategist. Context: 100 users · $20 MRR · organic channels. Build a precise 90-day roadmap to reach $1K MRR with weekly milestones.";

const PASTE_FRAME = 688;    // matches T.toast[0] in LumiaAnimation
const HIGHLIGHT_FRAMES = 10;

// ─── Real Claude dark-mode palette ───────────────────────────────────────────
const C = {
  bg:          "#1c1c1c",
  headerBg:    "#1c1c1c",
  border:      "rgba(255,255,255,0.08)",
  userBubble:  "#2d2d2d",
  text:        "#e5e5e5",
  textMuted:   "#737373",
  inputBg:     "#2a2a2a",
  inputBorder: "#3d3d3d",
  inputFocus:  "rgba(86,126,252,0.40)",
  placeholder: "rgba(255,255,255,0.30)",
  footer:      "rgba(255,255,255,0.25)",
  // Claude brand: terracotta/orange
  claude:      "linear-gradient(135deg, #C96442 0%, #D4845E 100%)",
  sendBtn:     "linear-gradient(135deg, #C96442 0%, #D4845E 100%)",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const SendIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M1 7h12M7 1l6 6-6 6" stroke="white" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Anthropic "A" mark — matches real Claude logo shape
const ClaudeMark = ({ size = 26 }: { size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: C.claude,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  }}>
    <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 18 18" fill="none">
      {/* Simplified Anthropic "A" shape */}
      <path d="M9 2L3.5 14.5h2.8L9 8.2l2.7 6.3h2.8L9 2z" fill="white" opacity="0.93"/>
    </svg>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
export const FakeChatInterface: React.FC<{ frame: number }> = ({ frame }) => {
  const caretOn = Math.floor(frame / 14) % 2 === 0;
  const isPasted = frame >= PASTE_FRAME;
  const pasteAlpha = isPasted ? Math.min((frame - PASTE_FRAME) / 6, 1) : 0;
  const isHighlighted = isPasted && frame < PASTE_FRAME + HIGHLIGHT_FRAMES;

  const inputBg     = isHighlighted ? "rgba(86,126,252,0.12)" : C.inputBg;
  const inputBorder = isHighlighted ? C.inputFocus             : C.inputBorder;

  return (
    // Fill the absolute-positioned parent (top:-50, right:-100) entirely
    <div style={{
      width: "100%", height: "100%",
      borderRadius: 18,
      overflow: "hidden",
      background: C.bg,
      boxShadow: "0 20px 60px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.35)",
      border: `1px solid ${C.border}`,
      display: "flex",
      flexDirection: "column",
      fontFamily: "DM Sans, sans-serif",
    }}>

      {/* ── Title bar (macOS-style) ───────────────────────────────────────── */}
      <div style={{
        padding: "12px 16px 10px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: C.headerBg,
        flexShrink: 0,
      }}>
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 6, marginRight: 4 }}>
          {(["#FF5F57", "#FEBC2E", "#28C840"] as const).map((c, i) => (
            <div key={i} style={{
              width: 11, height: 11, borderRadius: "50%",
              background: c, opacity: 0.75,
            }} />
          ))}
        </div>

        <ClaudeMark size={22} />

        <div style={{ lineHeight: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text, letterSpacing: "-0.01em" }}>
            Claude
          </span>
          <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 6 }}>
            Sonnet 4.5
          </span>
        </div>

        {/* New chat icon placeholder */}
        <div style={{ marginLeft: "auto", opacity: 0.35 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="2.5" stroke={C.text} strokeWidth="1.4"/>
            <path d="M8 5.5v5M5.5 8h5" stroke={C.text} strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        padding: "20px 18px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        overflow: "hidden",
      }}>
        {/* User message — right side */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{
            background: C.userBubble,
            borderRadius: "18px 18px 4px 18px",
            padding: "10px 15px",
            maxWidth: "72%",
          }}>
            <span style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>
              How do I grow my SaaS to $1K MRR?
            </span>
          </div>
        </div>

        {/* Claude response — left side, no bubble */}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <ClaudeMark size={22} />
          <div style={{ paddingTop: 2, maxWidth: "82%" }}>
            <span style={{ fontSize: 13, color: C.text, lineHeight: 1.65, opacity: 0.88 }}>
              To give you a precise roadmap, I need some context — your current
              MRR, user base size, and whether you prefer organic or paid
              growth channels...
            </span>
          </div>
        </div>
      </div>

      {/* ── Input area ───────────────────────────────────────────────────── */}
      <div style={{ padding: "8px 14px 12px", flexShrink: 0 }}>
        <div style={{
          background: inputBg,
          border: `1px solid ${inputBorder}`,
          borderRadius: 14,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          minHeight: 46,
          transition: "background 0.15s ease, border-color 0.15s ease",
          boxShadow: isHighlighted ? `0 0 0 3px rgba(86,126,252,0.15)` : "none",
        }}>
          <div style={{ flex: 1, overflow: "hidden" }}>
            {isPasted ? (
              <span style={{
                fontSize: 13,
                color: isHighlighted ? "#93b4ff" : C.text,
                lineHeight: 1.5,
                opacity: pasteAlpha,
                background: isHighlighted ? "rgba(86,126,252,0.15)" : "transparent",
                borderRadius: 3,
                transition: "color 0.25s ease, background 0.25s ease",
                display: "inline",
              }}>
                {PASTE_TEXT}
                {!isHighlighted && caretOn && (
                  <span style={{
                    display: "inline-block", width: 2, height: 14,
                    background: "#93b4ff", borderRadius: 1,
                    marginLeft: 1, verticalAlign: "text-bottom",
                  }} />
                )}
              </span>
            ) : (
              <span style={{ fontSize: 13, color: C.placeholder }}>
                Reply to Claude...
              </span>
            )}
          </div>

          {isPasted && (
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: C.sendBtn,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              opacity: pasteAlpha,
              transition: "opacity 0.2s ease",
            }}>
              <SendIcon />
            </div>
          )}
        </div>

        <p style={{
          fontSize: 10, color: C.footer,
          textAlign: "center", margin: "7px 0 0",
          letterSpacing: "0.01em",
        }}>
          Claude can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};

export default FakeChatInterface;
