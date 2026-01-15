import path from "path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig, UserConfig } from "vite";
import compression from "vite-plugin-compression";
// import { VitePWA } from "vite-plugin-pwa";
// import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  base: "/",
  preview: {
    allowedHosts: ["app.meelio.io"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          charts: ["recharts"],
          animation: ["framer-motion", "gsap"],
          i18n: ["i18next", "react-i18next"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    react(),
    compression({ algorithm: "gzip" }),
    compression({ algorithm: "brotliCompress", ext: ".br" }),
    // viteStaticCopy({
    //   targets: [
    //     {
    //       src: "public/manifest.json",
    //       dest: ".",
    //     },
    //   ],
    // }),
    // VitePWA(
    //   env.NODE_ENV === "development"
    //     ? {}
    //     : {
    //         registerType: "prompt",
    //         includeAssets: [
    //           "favicon.ico",
    //           "favicon-break.ico",
    //           "robots.txt",
    //           "img/*.webp",
    //           "sounds/*.mp3",
    //           "fonts/*.woff2",
    //         ],
    //         manifest: {
    //           name: "Meelio",
    //           short_name: "Meelio",
    //           start_url: "/",
    //           theme_color: "#f3742d",
    //           background_color: "#202020",
    //           icons: [
    //             {
    //               src: "/android-chrome-64x64.png",
    //               sizes: "64x64",
    //               type: "image/png",
    //             },
    //             {
    //               src: "/android-chrome-192x192.png",
    //               sizes: "192x192",
    //               type: "image/png",
    //             },
    //             {
    //               src: "maskable-512x512.png",
    //               sizes: "512x512",
    //               type: "image/png",
    //               purpose: "maskable",
    //             },
    //             {
    //               src: "/android-chrome-512x512.png",
    //               sizes: "512x512",
    //               type: "image/png",
    //             },
    //           ],
    //         },
    //       }
    // ),
  ] as UserConfig["plugins"],
});
