import { ImageResponse } from "next/og";

// Social link-preview card (Telegram/LinkedIn/Slack/X). Deterministic (not the
// site's random accent) so it caches cleanly. Uses ImageResponse's built-in
// font — verified to render Latin text; swap in a custom TTF later if desired.
export const alt = "Yasha Petrunin — Product Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#002096",
          color: "#FFFFFF",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, opacity: 0.7 }}>
          yasha.info
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 700, letterSpacing: "-3px", lineHeight: 1.05 }}>
            Yasha Petrunin
          </div>
          <div style={{ display: "flex", fontSize: 52, opacity: 0.9, marginTop: 12 }}>
            Product Designer
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 28, opacity: 0.6 }}>
          10+ years · FinTech · B2B · Consumer · Architect by training
        </div>
      </div>
    ),
    { ...size },
  );
}
