import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/animeList/",
  resolve: {
    alias: {
      csstype: "csstype/index.d.ts",
    },
  },
});
