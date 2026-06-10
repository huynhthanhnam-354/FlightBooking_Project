/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#074A7C",   // Deep Aviation Blue
          secondary: "#F2994A", // professional CTA Orange
          accent: "#E7F0F7",    // Sophisticated light blue tint
          surface: "#F8FAFC",   // Clean background
        },
        // Sophisticated gray scale for trustworthy UI
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        }
      },
      spacing: {
        small: "8px",     // Decisive spacing
        standard: "16px",  // Decisive spacing
        large: "24px",     // Decisive spacing
      },
      borderRadius: {
        'soft-sm': "8px",    // Trustworthy soft edges
        'soft-lg': "12px",   // Approachable premium feel
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        'premium': "0 10px 30px -5px rgba(7, 74, 124, 0.1), 0 4px 6px -2px rgba(7, 74, 124, 0.05)",
        'cta': "0 10px 15px -3px rgba(242, 153, 74, 0.3), 0 4px 6px -2px rgba(242, 153, 74, 0.1)",
      }
    },
  },
  plugins: [],
}
