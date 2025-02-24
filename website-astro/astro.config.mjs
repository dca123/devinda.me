import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

// https://astro.build/config
import prefetch from "@astrojs/prefetch";

// https://astro.build/config
import vercel from "@astrojs/vercel/static";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react(), prefetch()],
  output: "static",
  image: {
    domains: [
      "images.unsplash.com",
      "res.cloudinary.com",
      "source.unsplash.com",
    ],
  },
  adapter: vercel({
    analytics: true,
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
});
