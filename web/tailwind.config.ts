import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      colors: {
        bg: {
          base: "#0e1014",
          card: "#14171e",
          deep: "#0b0d11",
        },
        border: {
          subtle: "#1c1f27",
          card: "#232730",
          input: "#2a2e38",
        },
        txt: {
          primary: "#e8eaed",
          muted: "#9aa0ab",
          dim: "#6b7280",
          ghost: "#5b616b",
        },
        accent: {
          green: "oklch(0.8 0.16 150)",
          yellow: "oklch(0.8 0.14 70)",
          red: "oklch(0.7 0.15 25)",
          dark: "#4b515c",
        },
      },
    },
  },
  plugins: [],
};

export default config;
