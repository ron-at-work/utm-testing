import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Browser → same-origin /v1/... → Vite proxies to api-dev (avoids CORS)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/v1": {
        target: "http://api-dev.houseofapps.ai",
        changeOrigin: true,
      },
    },
  },
});
