import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

function stripConsole(): Plugin {
  return {
    name: "strip-console",
    apply: "build",
    enforce: "pre",
    transform(code, id) {
      if (process.env.NODE_ENV !== "production") return;
      if (id.includes("node_modules")) return;
      if (!/\.(ts|tsx|js|jsx)$/.test(id)) return;

      const result = code.replace(
        /console\.(log|warn|info|debug)\s*\([\s\S]*?\);?/g,
        ""
      );
      if (result !== code) {
        return { code: result, map: null };
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), stripConsole()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    open: true,
    port: 3000,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          const chunks: Record<string, string[]> = {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "redux-vendor": [
              "@reduxjs/toolkit",
              "react-redux",
              "redux-persist",
            ],
            "ui-vendor": [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-select",
              "@radix-ui/react-avatar",
              "@radix-ui/react-tooltip",
            ],
            "framer-motion": ["framer-motion"],
            zego: ["@zegocloud/zego-uikit-prebuilt"],
            socket: ["@stomp/stompjs", "sockjs-client"],
          };
          for (const [chunkName, deps] of Object.entries(chunks)) {
            if (deps.some((dep) => id.includes(`node_modules/${dep}`))) {
              return chunkName;
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
