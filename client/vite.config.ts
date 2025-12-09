import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: "../certs/key.pem",
      cert: "../certs/cert.pem",
    },
    port: 5173,
  },
});
