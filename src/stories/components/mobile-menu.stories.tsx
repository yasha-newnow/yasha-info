import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MobileMenu } from "../../components/mobile-menu";

const meta: Meta<typeof MobileMenu> = {
  title: "Components/Mobile Menu",
  component: MobileMenu,
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "accent",
      values: [{ name: "accent", value: "#C5F640" }],
    },
    viewport: { defaultViewport: "mobile1" },
  },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh", position: "relative", background: "#C5F640" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof MobileMenu>;

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
  },
};
