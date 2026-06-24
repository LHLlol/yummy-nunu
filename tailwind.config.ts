import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17110d",
        yolk: "#ffe13b",
        chili: "#e93620",
        flame: "#ff7a1a",
        cream: "#fff8df",
        paper: "#fffdf2",
        pickle: "#4f8f3a",
        plum: "#4f2d3a",
      },
      boxShadow: {
        sketch: "7px 7px 0 #17110d",
        "sketch-sm": "4px 4px 0 #17110d",
        "hot-pop": "0 18px 0 -9px rgba(233, 54, 32, 0.45)",
      },
      fontFamily: {
        display: [
          "Arial Black",
          "Impact",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
        body: [
          "Gill Sans",
          "Trebuchet MS",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      keyframes: {
        popIn: {
          "0%": { transform: "translateY(16px) scale(0.96)", opacity: "0" },
          "70%": { transform: "translateY(-4px) scale(1.02)", opacity: "1" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        flameJump: {
          "0%, 100%": { transform: "translateY(0) rotate(-2deg) scale(1)" },
          "45%": { transform: "translateY(-8px) rotate(3deg) scale(1.05)" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "pop-in": "popIn 420ms cubic-bezier(.2,.9,.2,1.2) both",
        "flame-jump": "flameJump 900ms ease-in-out infinite",
        bob: "bob 2.5s ease-in-out infinite",
        wiggle: "wiggle 1.4s ease-in-out infinite",
        ticker: "ticker 18s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
