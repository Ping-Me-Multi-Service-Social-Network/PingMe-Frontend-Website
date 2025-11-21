import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // react: path.resolve(__dirname, "./node_modules/react"),
      // "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
  server: {
    open: true,
    port: 3000,
  },
});
