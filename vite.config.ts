import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {biomePlugin} from "@pbr1111/vite-plugin-biome"

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), biomePlugin()],
	base: "/",
	resolve: {
		alias: {
			csstype: "csstype/index.d.ts",
			assets: "/src/assets",
		},
	},
});
