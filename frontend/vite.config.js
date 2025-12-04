import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      // Proxy `/api/*` to the Flask backend running on port 5000
      // Requests to `/api/auth/login` -> forwarded to `http://127.0.0.1:5000/auth/login`
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
        // Rewrite response headers so the browser never sees backend absolute URLs
        // This prevents the browser from following redirects directly to 127.0.0.1:5000
        configure: (proxy) => {
          proxy.on("proxyRes", (proxyRes) => {
            const loc = proxyRes.headers && proxyRes.headers.location;
            if (loc && typeof loc === "string") {
              // Make redirects relative so the browser stays on the dev server origin
              proxyRes.headers.location = loc.replace(
                "http://127.0.0.1:5000",
                ""
              );
            }
          });
        },
        // Ensure cookie domains returned by the backend are rewritten to localhost
        // so the browser stores them for the dev origin
        cookieDomainRewrite: "localhost",
      },
    },
  },
});
