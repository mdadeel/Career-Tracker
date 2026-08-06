import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import compress from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    react(),
    compress({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024, // Only compress files > 1KB
      deleteOriginFile: false,
    }),
    compress({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ],
  build: {
    // No source maps in production: they expose source to anyone who asks
    // and add transfer weight. Add back only when debugging a prod-only bug.
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@sentry")) return "sentry";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("@phosphor-icons")) return "icons";
          if (
            id.includes("react") ||
            id.includes("react-router") ||
            id.includes("react-helmet")
          )
            return "react-vendor";
          return "vendor";
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
