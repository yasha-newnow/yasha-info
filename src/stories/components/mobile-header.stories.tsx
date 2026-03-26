import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MobileHeader } from "../../components/mobile-header";

const meta: Meta<typeof MobileHeader> = {
  title: "Components/Mobile Header",
  component: MobileHeader,
  parameters: {
    backgrounds: { default: "lime", values: [{ name: "lime", value: "#C5F640" }] },
    viewport: { defaultViewport: "mobile1" },
  },
};

export default meta;

type Story = StoryObj<typeof MobileHeader>;

export const Closed: Story = {
  args: {
    isMenuOpen: false,
    onToggleMenu: () => {},
  },
};

export const Open: Story = {
  args: {
    isMenuOpen: true,
    onToggleMenu: () => {},
  },
};
