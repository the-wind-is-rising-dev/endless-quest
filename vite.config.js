import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === "github-io" ? "/endless-quest/" : "",
  server: {
    proxy: {
      "/chat/completions": {
        target: "https://api.deepseek.com",
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
});
