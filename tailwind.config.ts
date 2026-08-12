import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blush: "#f7c2dd",
        rose: "#f4b1c2",
        periwinkle: "#818bbe",
        offwhite: "#f7fbfe",
        marigold: "#fbbd53",
      },
    },
  },
  plugins: [],
} satisfies Config;