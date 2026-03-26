import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Logo } from "../components/icons/logo";
import { ArrowUpRight } from "../components/icons/arrow-up-right";
import { CopyIcon } from "../components/icons/copy";
import { PaletteIcon } from "../components/icons/palette";

const SIZES = [20, 24, 48] as const;

function IconGrid() {
  const icons = [
    { name: "Logo", Component: Logo },
    { name: "Arrow Up Right", Component: ArrowUpRight },
    { name: "Copy", Component: CopyIcon },
    { name: "Palette", Component: PaletteIcon },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px 16px", borderBottom: "1px solid #eee" }}>
              Icon
            </th>
            {SIZES.map((size) => (
              <th
                key={size}
                style={{
                  textAlign: "center",
                  padding: "8px 16px",
                  borderBottom: "1px solid #eee",
                  fontFamily: "monospace",
                }}
              >
                {size}px
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {icons.map(({ name, Component }) => (
            <tr key={name}>
              <td style={{ padding: "12px 16px", borderBottom: "1px solid #f5f5f5", fontWeight: 500 }}>
                {name}
              </td>
              {SIZES.map((size) => (
                <td
                  key={size}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f5f5f5",
                    textAlign: "center",
                  }}
                >
                  <div style={{ display: "inline-flex", padding: "8px", background: "#C5F640", borderRadius: "8px" }}>
                    <Component size={size} />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "32px" }}>
        <h3 style={{ marginBottom: "12px", fontWeight: 600 }}>Animated Icons</h3>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
          Plus (with rotation) and Wave Hand (with wave animation) are client components and shown in component stories.
        </p>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Design System/Icons",
  component: IconGrid,
};

export default meta;

type Story = StoryObj;

export const AllIcons: Story = {};
