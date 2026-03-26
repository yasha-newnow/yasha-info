import type { Meta, StoryObj } from "@storybook/nextjs-vite";

function TypographyShowcase() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        padding: "24px",
        background: "#C5F640",
        borderRadius: "16px",
        fontFamily: "Inter Tight, system-ui, sans-serif",
      }}
    >
      <div>
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px", fontFamily: "monospace" }}>
          Hero Heading — Inter Tight Bold 64px/72px
        </p>
        <h1 style={{ fontSize: "64px", fontWeight: 700, lineHeight: "72px", color: "#000" }}>
          I&apos;m Yasha.
        </h1>
      </div>

      <div>
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px", fontFamily: "monospace" }}>
          Nav Items — Inter Tight Bold 40px/48px
        </p>
        <span style={{ fontSize: "40px", fontWeight: 700, lineHeight: "48px", color: "#000" }}>
          Works
        </span>
      </div>

      <div>
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px", fontFamily: "monospace" }}>
          Name — Inter Tight Bold 24px/32px
        </p>
        <span style={{ fontSize: "24px", fontWeight: 700, lineHeight: "32px", color: "#0E0E0E" }}>
          Yasha Petrunin
        </span>
      </div>

      <div>
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px", fontFamily: "monospace" }}>
          Body / Description — Inter Tight Regular 20px/32px
        </p>
        <p style={{ fontSize: "20px", fontWeight: 400, lineHeight: "32px", color: "#000" }}>
          Designer and educator with two decades of experience specialized in
          designing products, digital experiences, and building overpowered
          teams obsessed with craft.
        </p>
      </div>

      <div>
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px", fontFamily: "monospace" }}>
          Links — Inter Tight Medium 16px/24px
        </p>
        <span style={{ fontSize: "16px", fontWeight: 500, lineHeight: "24px", color: "#0E0E0E" }}>
          yashapetrunin@gmail.com
        </span>
      </div>

      <div>
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px", fontFamily: "monospace" }}>
          Local Time — Roboto Mono Regular 12px/24px
        </p>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 400,
            lineHeight: "24px",
            color: "#0E0E0E",
            fontFamily: "Roboto Mono, monospace",
          }}
        >
          Local time 20:40 • Valencia, Spain.
        </span>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Design System/Typography",
  component: TypographyShowcase,
};

export default meta;

type Story = StoryObj;

export const AllStyles: Story = {};
