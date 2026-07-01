import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#003180",
        "primary-container": "#0046b0",
        secondary: "#00677d",
        "secondary-container": "#50d9fe",
        background: "#f7f9fb",
        surface: "#f7f9fb",
        "surface-bright": "#f7f9fb",
        "surface-dim": "#d8dadc",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "surface-container": "#eceef0",
        "surface-container-high": "#e6e8ea",
        "surface-container-highest": "#e0e3e5",
        "surface-variant": "#e0e3e5",
        outline: "#737784",
        "outline-variant": "#c3c6d5",
        "on-surface": "#191c1e",
        "on-surface-variant": "#434653",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "secondary-fixed": "#b3ebff",
        "on-secondary-fixed": "#001f27",
        "secondary-fixed-dim": "#4cd6fb",
      },
      fontFamily: {
        headline: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        panel: "0 32px 48px -4px rgba(25, 28, 30, 0.06)",
      },
      backgroundImage: {
        kinetic: "linear-gradient(135deg, #003180 0%, #0046b0 100%)",
        danger: "linear-gradient(135deg, #ba1a1a 0%, #93000a 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
