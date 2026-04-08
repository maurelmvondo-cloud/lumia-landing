"use client";

import React, { useState, useEffect, useRef } from "react";

// ─── Vanilla spring / interpolate ─────────────────────────────────────────────
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const interpolate = (f: number, [a, b]: number[], [x, y]: number[]) =>
  x + (y - x) * clamp((f - a) / (b - a), 0, 1);
const spring = ({ frame, config = { stiffness: 100, damping: 10 } }: { frame: number; config?: { stiffness: number; damping: number } }) => {
  const { stiffness, damping } = config;
  const dampingRatio = damping / (2 * Math.sqrt(stiffness));
  const t = clamp(frame * (1 / 30) * 30, 0, 1);
  return 1 - Math.exp(-dampingRatio * t * 3) * Math.cos(t * Math.PI * 2);
};

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  bg: '#0F0F1A', blue: '#567EFC', white: '#FFFFFF',
  textPri: 'rgba(255,255,255,1)', textSec: 'rgba(255,255,255,0.45)',
  border: 'rgba(86,126,252,0.18)', borderExp: 'rgba(86,126,252,0.30)',
  chipOff: 'rgba(255,255,255,0.07)', chipBorder: 'rgba(255,255,255,0.14)',
  pill: '#000000', checkPurple: '#A78BFA',
  gradient: 'linear-gradient(to right, #567EFC, #EB5E5E)',
};

// ─── Timeline ─────────────────────────────────────────────────────────────
const T = {
  idle: [0, 72], expand: [68, 112], typing: [158, 308],
  hold: [308, 352], think1: [346, 432], formIn: [426, 468],
  act1: [514, 548], act2: [544, 592], act3: [588, 624],
  hold2: [624, 642], think2: [636, 694], toast: [688, 720],
};
const TOTAL_FRAMES = 720;

// ─── Helpers ─────────────────────────────────────────────────────────────
const lp = (f: number, [a, b]: number[], [x, y]: number[]) => x + (y - x) * clamp((f - a) / (b - a), 0, 1);
const fadeIn  = (f: number, s: number, d = 14) => clamp((f - s) / d, 0, 1);
const fadeOut = (f: number, e: number, d = 14) => clamp((e - f) / d, 0, 1);
const xfade   = (f: number, [s, e]: number[], d = 14) => Math.min(fadeIn(f, s, d), fadeOut(f, e, d));

// ─── Reference sizes (at 400px container width) ─────────────────────────────────
const REF_W = 400;
const sizes = {
  barH: 52, barR: 22, barPadV: 14, clipW: 36, rightW: 76, textFont: 16,
  sendSz: 28,
  btn: 52, kbW: 76, kbH: 52, btnGap: 10, ctrlVGap: 6,
  handleW: 32, handleH: 4, handleR: 2,
  micIconSz: 18, kbIconSz: 16, rstIconSz: 16,
  pillPadH: 14, pillPadV: 10, pillFont: 13,
  dotSz: 5, dotGap: 4, hGap: 8,
  toastPadH: 16, toastIconSz: 14, toastFont: 13,
  formW: 360, formR: 20, formPadH: 18, formPadV: 18, formVGap: 16,
  sectionFont: 13, chipPadH: 12, chipPadV: 7, chipFont: 12,
  tfPadH: 12, tfPadV: 10, tfFont: 13, tfR: 10,
  actR: 12, actPadV: 12, actFont: 12, actIconSz: 10, actGap: 6, actBtnGap: 10,
};

// ─── Icons ───────────────────────────────────────────────────────────────
const IconMic = ({ sz }: { sz: number }) => (
  <svg width={sz} height={sz * 1.15} viewBox="0 0 19 22" fill="none">
    <rect x="5.5" y="1" width="8" height="13" rx="4" stroke={C.textSec} strokeWidth="1.7"/>
    <path d="M2 11C2 15.42 5.13 19 9.5 19s7.5-3.58 7.5-8" stroke={C.textSec} strokeWidth="1.7" strokeLinecap="round"/>
    <line x1="9.5" y1="19" x2="9.5" y2="22" stroke={C.textSec} strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
);
const IconKeyboard = ({ sz, color }: { sz: number; color: string }) => (
  <svg width={sz * 1.3} height={sz} viewBox="0 0 28 18" fill="none">
    <rect x="1" y="1" width="26" height="16" rx="3" stroke={color} strokeWidth="1.5" opacity="0.9"/>
    {[3.5, 7.5, 11.5, 15.5, 19.5].map(x => <rect key={`t${x}`} x={x} y="4.5" width="2.5" height="2.5" rx="0.6" fill={color} opacity="0.9"/>)}
    {[5, 9.5, 14, 18.5].map(x => <rect key={`m${x}`} x={x} y="8.5" width="2.5" height="2.5" rx="0.6" fill={color} opacity="0.9"/>)}
    <rect x="8" y="13" width="12" height="2" rx="1" fill={color} opacity="0.9"/>
  </svg>
);
const IconReset = ({ sz }: { sz: number }) => (
  <svg width={sz} height={sz} viewBox="0 0 20 20" fill="none">
    <path d="M18 10A8 8 0 1 1 13.2 2.8" stroke={C.textSec} strokeWidth="1.7" strokeLinecap="round"/>
    <path d="M13.2 0.5v2.3h2.3" stroke={C.textSec} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconPaperclip = ({ sz }: { sz: number }) => (
  <svg width={sz * 0.7} height={sz} viewBox="0 0 14 20" fill="none">
    <path d="M12.5 8L5.5 15A4 4 0 0 1 0 15a4 4 0 0 1 0-5.66L8 1.5a2.5 2.5 0 0 1 3.54 3.54L4 12.6a1 1 0 0 1-1.41-1.41L9.5 4"
      stroke={C.textSec} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconArrowUp = ({ sz }: { sz: number }) => (
  <svg width={sz * 0.9} height={sz} viewBox="0 0 12 14" fill="none">
    <line x1="6" y1="12" x2="6" y2="2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M2 6L6 2L10 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconForward = ({ sz, color }: { sz: number; color: string }) => (
  <svg width={sz * 1.2} height={sz} viewBox="0 0 14 12" fill="none">
    <path d="M1 1.5L6 6L1 10.5V1.5Z" fill={color}/><path d="M8 1.5L13 6L8 10.5V1.5Z" fill={color}/>
  </svg>
);
const IconArrowRight = ({ sz, color }: { sz: number; color: string }) => (
  <svg width={sz} height={sz * 0.8} viewBox="0 0 14 12" fill="none">
    <line x1="1" y1="6" x2="13" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 2L13 6L8 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCheckCircle = ({ sz }: { sz: number }) => (
  <svg width={sz} height={sz} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9.5" fill={C.checkPurple}/>
    <path d="M5.5 10L8.5 13L14.5 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Sub-components ──────────────────────────────────────────────────────
interface S { barH: number; barR: number; barPadV: number; clipW: number; rightW: number; textFont: number; sendSz: number; btn: number; kbW: number; kbH: number; btnGap: number; ctrlVGap: number; handleW: number; handleH: number; handleR: number; micIconSz: number; kbIconSz: number; rstIconSz: number; pillPadH: number; pillPadV: number; pillFont: number; dotSz: number; dotGap: number; hGap: number; toastPadH: number; toastIconSz: number; toastFont: number; formW: number; formR: number; formPadH: number; formPadV: number; formVGap: number; sectionFont: number; chipPadH: number; chipPadV: number; chipFont: number; tfPadH: number; tfPadV: number; tfFont: number; tfR: number; actR: number; actPadV: number; actFont: number; actIconSz: number; actGap: number; actBtnGap: number; }

const ControlBar: React.FC<{ kbActive: boolean; s: S }> = ({ kbActive, s }) => {
  const c: React.CSSProperties = { width: s.btn, height: s.btn, borderRadius: '50%', background: C.bg, border: `1px solid ${C.chipBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
  const k: React.CSSProperties = { width: s.kbW, height: s.kbH, borderRadius: '9999px', background: kbActive ? C.gradient : C.bg, border: kbActive ? 'none' : `1px solid ${C.chipBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s.ctrlVGap }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: s.btnGap }}>
        <div style={c}><IconMic sz={s.micIconSz} /></div>
        <div style={k}><IconKeyboard sz={s.kbIconSz} color={kbActive ? C.white : C.textSec} /></div>
        <div style={c}><IconReset sz={s.rstIconSz} /></div>
      </div>
      <div style={{ marginTop: 2, width: s.handleW, height: s.handleH, borderRadius: s.handleR, background: '#000000', border: `1px solid rgba(255,255,255,0.32)` }}/>
    </div>
  );
};

const ChatBar: React.FC<{ text: string; showSend: boolean; caretOn: boolean; s: S; fW: number }> = ({ text, showSend, caretOn, s, fW }) => {
  const empty = text.length === 0;
  const barH = Math.max(s.barH, s.barPadV * 2 + s.textFont + 6);
  const fieldW = fW - s.clipW - s.rightW;
  return (
    <div style={{ width: fW, height: barH, flexShrink: 0, background: C.bg, borderRadius: s.barR, border: `1px solid ${C.borderExp}`, boxShadow: `0 6px 20px rgba(86,126,252,0.10)`, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
      <div style={{ width: s.clipW, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconPaperclip sz={s.clipW * 0.4} /></div>
      <div style={{ width: fieldW, flexShrink: 0, overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', paddingLeft: 6, paddingRight: 4 }}>
        <span style={{ fontFamily: '"Instrument Sans", sans-serif', fontSize: s.textFont, fontWeight: 400, letterSpacing: '-0.01em', color: empty ? 'rgba(255,255,255,0.3)' : C.textPri, whiteSpace: 'nowrap' }}>{empty ? 'Ask Lumia...' : text}</span>
        {!empty && caretOn && <span style={{ display: 'inline-block', flexShrink: 0, width: 2, height: s.textFont + 4, background: C.blue, borderRadius: 1, marginLeft: 2 }}/>}
      </div>
      <div style={{ width: s.rightW, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {showSend && <div style={{ width: s.sendSz, height: s.sendSz, borderRadius: '50%', background: C.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconArrowUp sz={s.sendSz * 0.4} /></div>}
      </div>
    </div>
  );
};

const ThinkingPill: React.FC<{ frame: number; s: S }> = ({ frame, s }) => {
  const phase = Math.floor(frame / 11) % 3;
  const dots = '...'.slice(0, Math.floor(frame / 16) % 4);
  return (
    <div style={{ borderRadius: '9999px', background: C.pill, paddingLeft: s.pillPadH, paddingRight: s.pillPadH, paddingTop: s.pillPadV, paddingBottom: s.pillPadV, display: 'flex', alignItems: 'center', gap: s.hGap, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: s.dotGap }}>
        {[0, 1, 2].map(i => {
          const active = i === phase;
          return <div key={i} style={{ width: s.dotSz, height: s.dotSz, borderRadius: '50%', background: C.white, transform: `scale(${active ? 1.5 : 0.7})`, opacity: active ? 1.0 : 0.3, transition: 'transform 0.3s ease, opacity 0.3s ease' }}/>;
        })}
      </div>
      <span style={{ fontFamily: '"Instrument Sans", sans-serif', fontSize: s.pillFont, fontWeight: 500, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }}>Lumia is thinking{dots}</span>
    </div>
  );
};

const ToastEl: React.FC<{ s: S }> = ({ s }) => (
  <div style={{ borderRadius: '9999px', background: C.pill, paddingLeft: s.toastPadH, paddingRight: s.toastPadH, paddingTop: s.pillPadV, paddingBottom: s.pillPadV, display: 'flex', alignItems: 'center', gap: s.hGap, flexShrink: 0, whiteSpace: 'nowrap' }}>
    <IconCheckCircle sz={s.toastIconSz} />
    <span style={{ fontFamily: '"Instrument Sans", sans-serif', fontSize: s.toastFont, fontWeight: 500, color: C.white }}>Prompt copied — <strong style={{ fontWeight: 700 }}>Cmd+V</strong> to paste</span>
  </div>
);

const QuestionCard: React.FC<{ yesSelected: boolean; answer: string; organicSelected: boolean; answerFocused: boolean; caretOn: boolean; s: S; fW: number }> = ({ yesSelected, answer, organicSelected, answerFocused, caretOn, s, fW }) => {
  const l: React.CSSProperties = { fontFamily: '"Instrument Sans", sans-serif', fontSize: s.sectionFont, fontWeight: 600, color: C.textPri, margin: 0, lineHeight: 1.35 };
  const chip = (active: boolean): React.CSSProperties => ({ borderRadius: '9999px', paddingLeft: s.chipPadH, paddingRight: s.chipPadH, paddingTop: s.chipPadV, paddingBottom: s.chipPadV, fontFamily: '"Instrument Sans", sans-serif', fontSize: s.chipFont, fontWeight: active ? 600 : 400, color: active ? C.white : C.textPri, background: active ? C.gradient : C.chipOff, border: active ? 'none' : `1px solid ${C.chipBorder}`, flexShrink: 0, display: 'inline-flex', alignItems: 'center' });
  const tfInH = s.tfPadV * 2 + s.tfFont;
  return (
    <div style={{ width: Math.min(s.formW, fW - 40), background: C.bg, borderRadius: s.formR, border: `1px solid ${C.border}`, boxShadow: `0 8px 24px rgba(86,126,252,0.15)`, padding: `${s.formPadV}px ${s.formPadH}px`, display: 'flex', flexDirection: 'column', gap: s.formVGap }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={l}>Is this for Lumia (getlumia.ca)?</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><div style={chip(yesSelected)}>Yes, that&apos;s it</div><div style={chip(false)}>No, different project</div></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={l}>What is your current MRR and user count?</p>
        <div style={{ height: tfInH, borderRadius: s.tfR, background: answerFocused ? 'rgba(86,126,252,0.08)' : C.chipOff, border: `1px solid ${answerFocused ? 'rgba(86,126,252,0.50)' : C.chipBorder}`, paddingLeft: s.tfPadH, paddingRight: s.tfPadH, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <span style={{ fontFamily: '"Instrument Sans", sans-serif', fontSize: s.tfFont, fontWeight: 400, color: answer.length > 0 ? C.textPri : C.textSec, whiteSpace: 'nowrap' }}>{answer}</span>
          {answerFocused && caretOn && <span style={{ display: 'inline-block', flexShrink: 0, width: 2, height: s.tfFont + 4, background: C.blue, borderRadius: 1, marginLeft: 2 }}/>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={l}>Do you prefer focusing on organic social growth or paid channels?</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{(['Organic & Social', 'Paid Ads', 'Both'] as const).map(opt => <div key={opt} style={chip(opt === 'Organic & Social' && organicSelected)}>{opt}</div>)}</div>
      </div>
      <div style={{ display: 'flex', gap: s.actBtnGap, marginTop: 4 }}>
        <div style={{ flex: 1, borderRadius: s.actR, background: C.chipOff, border: `1px solid ${C.chipBorder}`, paddingTop: s.actPadV, paddingBottom: s.actPadV, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: s.actGap, fontFamily: '"Instrument Sans", sans-serif', fontSize: s.actFont, fontWeight: 500, color: C.textSec }}><IconForward sz={s.actIconSz} color={C.textSec} />Skip</div>
        <div style={{ flex: 2, borderRadius: s.actR, background: C.gradient, paddingTop: s.actPadV, paddingBottom: s.actPadV, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: s.actGap, fontFamily: '"Instrument Sans", sans-serif', fontSize: s.actFont, fontWeight: 600, color: C.white }}>Continue<IconArrowRight sz={s.actIconSz} color={C.white} /></div>
      </div>
    </div>
  );
};

// ─── Main ───────────────────────────────────────────────────────────────
const PROMPT = 'Roadmap to take my SaaS to 1K MRR';
const ANSWER  = '100 for 20$ MRR';

const useCurrentFrame = (fps: number, totalFrames: number) => {
  const [frame, setFrame] = useState(0);
  const startRef = useRef(0);
  useEffect(() => {
    startRef.current = performance.now();
    let lastTime = 0;
    const interval = 1000 / fps;
    const tick = (now: number) => {
      if (now - lastTime >= interval) {
        lastTime = now - ((now - lastTime) % interval);
        setFrame(Math.floor((now - startRef.current) / interval) % totalFrames);
      }
      requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fps, totalFrames]);
  return frame;
};

// Scale sizes proportionally to container width
const scale = (v: number, refW: number, actualW: number) => Math.round(v * (actualW / refW));

export const LumiaAnimation: React.FC = () => {
  const [containerW, setContainerW] = useState(REF_W);
  const containerRef = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame(30, TOTAL_FRAMES);
  const caretOn  = Math.floor(frame / 14) % 2 === 0;
  const kbActive = frame >= T.expand[0];

  // Measure container width
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) setContainerW(containerRef.current.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const W = Math.max(containerW, 100);
  const p = (v: number) => scale(v, REF_W, W);
  const s: S = {
    barH: p(sizes.barH), barR: p(sizes.barR), barPadV: p(sizes.barPadV), clipW: p(sizes.clipW), rightW: p(sizes.rightW), textFont: p(sizes.textFont), sendSz: p(sizes.sendSz),
    btn: p(sizes.btn), kbW: p(sizes.kbW), kbH: p(sizes.kbH), btnGap: p(sizes.btnGap), ctrlVGap: p(sizes.ctrlVGap),
    handleW: p(sizes.handleW), handleH: p(sizes.handleH), handleR: p(sizes.handleR),
    micIconSz: p(sizes.micIconSz), kbIconSz: p(sizes.kbIconSz), rstIconSz: p(sizes.rstIconSz),
    pillPadH: p(sizes.pillPadH), pillPadV: p(sizes.pillPadV), pillFont: p(sizes.pillFont),
    dotSz: p(sizes.dotSz), dotGap: p(sizes.dotGap), hGap: p(sizes.hGap),
    toastPadH: p(sizes.toastPadH), toastIconSz: p(sizes.toastIconSz), toastFont: p(sizes.toastFont),
    formW: Math.min(p(sizes.formW), W - 40), formR: p(sizes.formR), formPadH: p(sizes.formPadH), formPadV: p(sizes.formPadV), formVGap: p(sizes.formVGap),
    sectionFont: p(sizes.sectionFont), chipPadH: p(sizes.chipPadH), chipPadV: p(sizes.chipPadV), chipFont: p(sizes.chipFont),
    tfPadH: p(sizes.tfPadH), tfPadV: p(sizes.tfPadV), tfFont: p(sizes.tfFont), tfR: p(sizes.tfR),
    actR: p(sizes.actR), actPadV: p(sizes.actPadV), actFont: p(sizes.actFont), actIconSz: p(sizes.actIconSz), actGap: p(sizes.actGap), actBtnGap: p(sizes.actBtnGap),
  };

  // Positions - all centered vertically
  const centerY = 0;
  const ctrlAlpha = fadeIn(frame, 0, 20);
  const ctrlY = Math.round(lp(spring({ frame }), [0, 1], [p(14), 0]));
  const barProg = frame >= T.expand[0] ? spring({ frame: frame - T.expand[0] }) : 0;
  const barAlpha = (() => {
    if (frame < T.expand[0]) return 0;
    if (frame < T.think1[0]) return barProg;
    return fadeOut(frame, T.think1[0] + 16, 16);
  })();
  const barY = Math.round(lp(barProg, [0, 1], [p(14), 0]));
  const charIdx = frame < T.typing[0] ? 0 : frame >= T.typing[1] ? PROMPT.length : Math.round(lp(frame, T.typing, [0, PROMPT.length]));
  const typedText = PROMPT.slice(0, charIdx);
  const showSend = charIdx >= 5 && barAlpha > 0.05 && frame < T.think1[0];
  const th1Alpha = (frame >= T.think1[0] && frame < T.formIn[0]) ? xfade(frame, T.think1, 16) : 0;
  const formProg = frame >= T.formIn[0] ? spring({ frame: frame - T.formIn[0] }) : 0;
  const formAlpha = (() => {
    if (frame < T.formIn[0] || frame >= T.think2[0]) return 0;
    return Math.min(formProg, fadeOut(frame, T.think2[0] + 8, 16));
  })();
  const formY = Math.round(lp(formProg, [0, 1], [p(20), 0]));
  const yesSelected = frame >= T.act1[0] + 5;
  const answerFocused = frame >= T.act2[0] - 4 && frame < T.act3[0];
  const ansCharIdx = frame < T.act2[0] ? 0 : frame >= T.act2[1] ? ANSWER.length : Math.round(lp(frame, T.act2, [0, ANSWER.length]));
  const typedAnswer = ANSWER.slice(0, ansCharIdx);
  const organicSelected = frame >= T.act3[0] + 5;
  const th2Alpha = (frame >= T.think2[0] && frame < T.toast[0]) ? xfade(frame, T.think2, 16) : 0;
  const toastProg = frame >= T.toast[0] ? spring({ frame: frame - T.toast[0] }) : 0;
  const toastAlpha = frame >= T.toast[0] ? toastProg : 0;
  const toastY = Math.round(lp(toastProg, [0, 1], [p(12), 0]));
  // ControlBar sits at the bottom; ChatBar/pills/form appear ABOVE it
  const ctrlBottom = p(18);
  const ctrlTotalH = s.btn + s.ctrlVGap + s.handleH; // buttons row + gap + handle
  const aboveCtrl  = ctrlBottom + ctrlTotalH + p(10); // 10px gap above control bar

  const pos = (bottom: number, alpha: number, y: number): React.CSSProperties => ({
    position: 'absolute', bottom, left: '50%',
    transform: `translateX(-50%) translateY(${y}px)`,
    opacity: alpha,
    display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%',
  });

  const barW = Math.round(W * 0.95);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', paddingBottom: '115%', overflow: 'hidden' }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'transparent',
        fontFamily: '"Instrument Sans", sans-serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* ControlBar always at the very bottom */}
        {ctrlAlpha > 0.01 && (
          <div style={{ ...pos(ctrlBottom, ctrlAlpha, ctrlY) }}>
            <ControlBar kbActive={kbActive} s={s} />
          </div>
        )}
        {/* ChatBar, pills, form all sit ABOVE the control bar */}
        {barAlpha > 0.01 && (
          <div style={{ ...pos(aboveCtrl, barAlpha, barY) }}>
            <ChatBar text={typedText} showSend={showSend} caretOn={caretOn} s={s} fW={barW} />
          </div>
        )}
        {th1Alpha > 0.01 && (
          <div style={{ ...pos(aboveCtrl, th1Alpha, 0) }}>
            <ThinkingPill frame={frame} s={s} />
          </div>
        )}
        {formAlpha > 0.01 && (
          <div style={{ ...pos(aboveCtrl, formAlpha, formY) }}>
            <QuestionCard yesSelected={yesSelected} answer={typedAnswer} organicSelected={organicSelected} answerFocused={answerFocused} caretOn={caretOn} s={s} fW={barW} />
          </div>
        )}
        {th2Alpha > 0.01 && (
          <div style={{ ...pos(aboveCtrl, th2Alpha, 0) }}>
            <ThinkingPill frame={frame} s={s} />
          </div>
        )}
        {toastAlpha > 0.01 && (
          <div style={{ ...pos(aboveCtrl, toastAlpha, toastY) }}>
            <ToastEl s={s} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LumiaAnimation;

// ─── HeroAnimation — simplified loop: type → think → toast (no form) ────────
const HERO_PROMPT = 'Roadmap to 1K MRR for my SaaS';
const HERO_T: Record<string, [number, number]> = {
  ctrlIn:  [0,   25],
  barIn:   [20,  50],
  typing:  [45,  205],
  think:   [200, 280],
  toast:   [275, 320],
  hold:    [320, 370],
};
const HERO_TOTAL = 370;

export const HeroAnimation: React.FC = () => {
  const [containerW, setContainerW] = useState(REF_W);
  const containerRef = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame(30, HERO_TOTAL);
  const caretOn  = Math.floor(frame / 14) % 2 === 0;
  const kbActive = frame >= HERO_T.barIn[0];

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) setContainerW(containerRef.current.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const W = Math.max(containerW, 100);
  const p = (v: number) => scale(v, REF_W, W);
  const s: S = {
    barH: p(sizes.barH), barR: p(sizes.barR), barPadV: p(sizes.barPadV),
    clipW: p(sizes.clipW), rightW: p(sizes.rightW), textFont: p(sizes.textFont),
    sendSz: p(sizes.sendSz), btn: p(sizes.btn), kbW: p(sizes.kbW), kbH: p(sizes.kbH),
    btnGap: p(sizes.btnGap), ctrlVGap: p(sizes.ctrlVGap), handleW: p(sizes.handleW),
    handleH: p(sizes.handleH), handleR: p(sizes.handleR), micIconSz: p(sizes.micIconSz),
    kbIconSz: p(sizes.kbIconSz), rstIconSz: p(sizes.rstIconSz), pillPadH: p(sizes.pillPadH),
    pillPadV: p(sizes.pillPadV), pillFont: p(sizes.pillFont), dotSz: p(sizes.dotSz),
    dotGap: p(sizes.dotGap), hGap: p(sizes.hGap), toastPadH: p(sizes.toastPadH),
    toastIconSz: p(sizes.toastIconSz), toastFont: p(sizes.toastFont),
    formW: Math.min(p(sizes.formW), W - 40), formR: p(sizes.formR),
    formPadH: p(sizes.formPadH), formPadV: p(sizes.formPadV), formVGap: p(sizes.formVGap),
    sectionFont: p(sizes.sectionFont), chipPadH: p(sizes.chipPadH), chipPadV: p(sizes.chipPadV),
    chipFont: p(sizes.chipFont), tfPadH: p(sizes.tfPadH), tfPadV: p(sizes.tfPadV),
    tfFont: p(sizes.tfFont), tfR: p(sizes.tfR), actR: p(sizes.actR), actPadV: p(sizes.actPadV),
    actFont: p(sizes.actFont), actIconSz: p(sizes.actIconSz), actGap: p(sizes.actGap),
    actBtnGap: p(sizes.actBtnGap),
  };

  const ctrlAlpha = fadeIn(frame, 0, 20);
  const ctrlY = Math.round(lp(spring({ frame }), [0, 1], [p(14), 0]));

  const barProg  = frame >= HERO_T.barIn[0] ? spring({ frame: frame - HERO_T.barIn[0] }) : 0;
  const barAlpha = (() => {
    if (frame < HERO_T.barIn[0]) return 0;
    if (frame < HERO_T.think[0]) return barProg;
    return fadeOut(frame, HERO_T.think[0], 16);
  })();
  const barY = Math.round(lp(barProg, [0, 1], [p(14), 0]));

  const charIdx   = frame < HERO_T.typing[0] ? 0
    : frame >= HERO_T.typing[1] ? HERO_PROMPT.length
    : Math.round(lp(frame, HERO_T.typing, [0, HERO_PROMPT.length]));
  const typedText = HERO_PROMPT.slice(0, charIdx);
  const showSend  = charIdx >= 5 && barAlpha > 0.05 && frame < HERO_T.think[0];

  const thinkAlpha = frame >= HERO_T.think[0] && frame < HERO_T.toast[0]
    ? xfade(frame, HERO_T.think, 16) : 0;

  const toastProg  = frame >= HERO_T.toast[0] ? spring({ frame: frame - HERO_T.toast[0] }) : 0;
  const toastAlpha = frame >= HERO_T.toast[0]
    ? Math.min(toastProg, fadeOut(frame, HERO_T.hold[1] - 15, 15)) : 0;
  const toastY = Math.round(lp(toastProg, [0, 1], [p(12), 0]));

  const barW        = Math.round(W * 0.95);
  const ctrlBottom  = p(18);
  const ctrlTotalH  = s.btn + s.ctrlVGap + s.handleH;
  const aboveCtrl   = ctrlBottom + ctrlTotalH + p(10);

  const pos = (bottom: number, alpha: number, y: number): React.CSSProperties => ({
    position: 'absolute', bottom, left: '50%',
    transform: `translateX(-50%) translateY(${y}px)`,
    opacity: alpha,
    display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%',
  });

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', paddingBottom: '42%', overflow: 'hidden', minHeight: 140 }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'transparent',
        fontFamily: '"Instrument Sans", sans-serif',
      }}>
        {/* ControlBar at the very bottom */}
        {ctrlAlpha > 0.01 && (
          <div style={pos(ctrlBottom, ctrlAlpha, ctrlY)}>
            <ControlBar kbActive={kbActive} s={s} />
          </div>
        )}
        {/* ChatBar, thinking, toast all sit ABOVE the control bar */}
        {barAlpha > 0.01 && (
          <div style={pos(aboveCtrl, barAlpha, barY)}>
            <ChatBar text={typedText} showSend={showSend} caretOn={caretOn} s={s} fW={barW} />
          </div>
        )}
        {thinkAlpha > 0.01 && (
          <div style={pos(aboveCtrl, thinkAlpha, 0)}>
            <ThinkingPill frame={frame} s={s} />
          </div>
        )}
        {toastAlpha > 0.01 && (
          <div style={pos(aboveCtrl, toastAlpha, toastY)}>
            <ToastEl s={s} />
          </div>
        )}
      </div>
    </div>
  );
};
