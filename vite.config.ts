import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// CSP del servidor de vista previa (npm run preview). En desarrollo Vite
// inyecta scripts en línea para recargar módulos, por eso no se aplica ahí.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://*.googleapis.com wss://*.firebaseio.com https://*.firebaseio.com",
  "worker-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // El SDK de Firebase (Auth + Firestore) mide unos 560 kB sin comprimir.
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        // Firebase y MSW pesan más que la app: van en archivos aparte para
        // que el navegador los guarde en caché entre versiones.
        codeSplitting: {
          groups: [
            { name: "firebase", test: /node_modules[\\/]@?firebase/ },
            { name: "msw", test: /node_modules[\\/](msw|@mswjs)/ },
            { name: "vendor", test: /node_modules/ },
          ],
        },
      },
    },
  },
  preview: {
    headers: {
      "Content-Security-Policy": contentSecurityPolicy,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "X-Frame-Options": "DENY",
    },
  },
});
