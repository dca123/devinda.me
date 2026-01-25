import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: "static",

  prefetch: {
    prefetchAll: true,
  },

  image: {
    domains: ["images.unsplash.com", "res.cloudinary.com", "picsum.photos"],
  },

  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    imageService: true,
    imagesConfig: {
      sizes: [320, 640, 1080, 1280],
      domains: [
        "images.unsplash.com",
        "res.cloudinary.com",
        "source.unsplash.com",
      ],
    },
  }),

  vite: {
    plugins: [tailwindcss()],
  },
});
