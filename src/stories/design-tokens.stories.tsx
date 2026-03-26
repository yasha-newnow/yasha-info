import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const COLORS = [
  { name: "Accent (Lime)", hex: "#C5F640" },
  { name: "Foreground", hex: "#0E0E0E" },
  { name: "Tangerine", hex: "#FF6B35" },
  { name: "Electric Violet", hex: "#7B61FF" },
  { name: "Mint", hex: "#00D4AA" },
  { name: "Hot Pink", hex: "#FF3F8E" },
  { name: "Golden Yellow", hex: "#FFD93D" },
  { name: "Sky Blue", hex: "#4CC9F0" },
  { name: "Amber", hex: "#FF9F1C" },
];

function DesignTokens() {
  return (
    <div style={{ padding: "32px", fontFamily: "Inter Tight, system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "24px" }}>
        Design Tokens
      </h1>

      <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>
        Colors
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        {COLORS.map((color) => (
          <div key={color.hex}>
            <div
              style={{
                width: "100%",
                height: "80px",
                background: color.hex,
                borderRadius: "12px",
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            />
            <p style={{ marginTop: "8px", fontSize: "14px", fontWeight: 600 }}>
              {color.name}
            </p>
            <code style={{ fontSize: "12px", color: "#666" }}>{color.hex}</code>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>
        Glass Effect
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            padding: "24px",
            borderRadius: "24px",
            background: "linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.05)), rgba(197,246,64,0.7)",
            backdropFilter: "blur(50px)",
            minHeight: "120px",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "4px" }}>Sidebar / Menu Glass</p>
          <code style={{ fontSize: "11px", color: "#333" }}>
            accent 70% + black 5% + blur(50px)
          </code>
        </div>
        <div
          style={{
            padding: "24px",
            borderRadius: "24px",
            background: "rgba(255,255,255,0.1)",
            border: "2px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
            boxShadow: "0px 4px 10px rgba(13,13,13,0.12)",
            minHeight: "120px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "4px" }}>Palette Button Glass</p>
          <code style={{ fontSize: "11px", color: "#333" }}>
            white 10% + border white 20% + blur(10px)
          </code>
        </div>
      </div>

      <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>
        Fonts
      </h2>
      <table style={{ borderCollapse: "collapse", width: "100%", marginBottom: "40px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #eee" }}>
            <th style={{ textAlign: "left", padding: "8px" }}>Font</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Usage</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Weights</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
            <td style={{ padding: "8px", fontWeight: 600 }}>Inter Tight</td>
            <td style={{ padding: "8px" }}>Primary — headings, body, links</td>
            <td style={{ padding: "8px", fontFamily: "monospace", fontSize: "13px" }}>
              400 / 500 / 700
            </td>
          </tr>
          <tr>
            <td style={{ padding: "8px", fontWeight: 600 }}>Roboto Mono</td>
            <td style={{ padding: "8px" }}>Monospace — local time</td>
            <td style={{ padding: "8px", fontFamily: "monospace", fontSize: "13px" }}>400</td>
          </tr>
        </tbody>
      </table>

      <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>
        Spacing
      </h2>
      <ul style={{ lineHeight: "2", fontSize: "14px" }}>
        <li>
          Page padding: <code>16px</code> (p-4)
        </li>
        <li>
          Sidebar padding: <code>24px</code> (p-6)
        </li>
        <li>
          Content padding: <code>40px</code> (p-10)
        </li>
        <li>
          Border radius: <code>24px</code> (rounded-3xl)
        </li>
      </ul>
    </div>
  );
}

const meta: Meta = {
  title: "Design System/Design Tokens",
  component: DesignTokens,
};

export default meta;

type Story = StoryObj;

export const Overview: Story = {};
