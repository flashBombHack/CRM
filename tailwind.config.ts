import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#0072CE",
          50: "#E6F2FA",
          100: "#CCE5F5",
          200: "#99CBEB",
          300: "#66B1E1",
          400: "#3397D7",
          500: "#0072CE",
          600: "#005BA5",
          700: "#00447C",
          800: "#002D52",
          900: "#001629",
        },
      },
      fontFamily: {
        sans: ["var(--font-albert-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;




