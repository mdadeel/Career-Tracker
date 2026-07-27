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
