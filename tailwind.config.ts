import type { Config } from "tailwindcss";

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "exalidraw-surface-low": "var(--color-surface-low)",
      },
    },
  },
  plugins: [],
} satisfies Config;
