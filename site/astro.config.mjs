import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://roboshamanai.com",
  output: "static",
  trailingSlash: "always",
  prefetch: false,
  integrations: [mdx()],
  build: {
    format: "directory",
    inlineStylesheets: "never",
  },
  markdown: {
    syntaxHighlight: false,
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
      cssCodeSplit: false,
    },
  },
});
