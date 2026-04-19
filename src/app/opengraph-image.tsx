import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Lumia — Think once. Execute everywhere.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <svg width="72" height="72" viewBox="0 0 24 24" fill="#fff" style={{ marginBottom: 28 }}>
          <path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07L19.07 4.93" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-1.5px",
            marginBottom: 16,
          }}
        >
          Lumia
        </div>
        <div
          style={{
            fontSize: 78,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-3px",
            lineHeight: 1.05,
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          Think once. Execute everywhere.
        </div>
        <div
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.65)",
            letterSpacing: "-0.3px",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Raw idea in. Expert prompt out. Your context is already loaded.
        </div>
      </div>
    ),
    { ...size },
  );
}
