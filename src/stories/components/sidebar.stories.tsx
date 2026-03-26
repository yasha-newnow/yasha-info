import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Sidebar } from "../../components/sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Components/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "lime", values: [{ name: "lime", value: "#C5F640" }] },
    viewport: { defaultViewport: "desktop" },
  },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh", padding: "16px", display: "flex" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Sidebar>;

export const Visible: Story = {
  args: {
    show: true,
    delay: 0,
  },
};

export const Hidden: Story = {
  args: {
    show: false,
  },
};
