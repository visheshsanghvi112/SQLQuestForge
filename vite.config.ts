import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// removed replit runtime error overlay plugin

export default defineConfig({
  plugins: [
    react(),
    // replit-specific plugins removed
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
