/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#17324d",
          sky: "#5fa8d3",
          clay: "#c97b63",
          mist: "#eef4f7",
        },
      },
      boxShadow: {
        float: "0 20px 40px -24px rgba(23, 50, 77, 0.45)",
      },
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"],
      },
    },
  },
  plugins: [],
};
