import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Optional: specify dev server port
    open: true, // Optional: open browser on start
  },
  resolve: {
    alias: {
      // If you have path aliases, define them here
      // '@/': '/src/',
    },
  },
});
