import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "accent", value: "#C5F640" },
        { name: "dark", value: "#0E0E0E" },
      ],
    },
    a11y: {
      test: "todo",
    },
  },
};

export default preview;
