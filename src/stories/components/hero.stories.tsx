import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Hero } from "../../components/hero";

const meta: Meta<typeof Hero> = {
  title: "Components/Hero",
  component: Hero,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "lime", values: [{ name: "lime", value: "#C5F640" }] },
  },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh", display: "flex" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Hero>;

export const Default: Story = {};
