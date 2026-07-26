import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import {biomePlugin} from "@pbr1111/vite-plugin-biome"
import logPlugin from "@izumiano/vite-plugin-logger";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig(({mode}) => 
{
		const { VITE_TRACE, VITE_DO_SERVER_LOG, VITE_LOG_URL } = loadEnv(
		mode,
		path.resolve(__dirname),
	);

	return {
		plugins: [
			biomePlugin(),
			logPlugin({
				mode,
				traceEnabled: VITE_TRACE === "true",
				doServerLog: VITE_DO_SERVER_LOG === "true",
				logUrl: VITE_LOG_URL,
			}), 
			react(), 
		],
		base: "/",
		resolve: {
			alias: {
				csstype: "csstype/index.d.ts",
				assets: "/src/assets",
			},
		}
	}
});
