import type Anime from "./models/anime";

const AppData: { animes: Map<string, Anime> } = {
	animes: new Map(),
};

export default AppData;

export const externalSyncEnabled =
	import.meta.env.VITE_EXTERNAL_SYNC_ENABLED === "true";

export const isInDev = import.meta.env.DEV;

export let devUtils: typeof import("./utils/devUtils") | undefined = undefined;
if (isInDev) {
	if (import.meta.env.VITE_DEV_UTILS_ENABLED === "true") {
		console.info("DEV UTILS ENABLED");

		if (import.meta.env.VITE_FORCE_MOCK_DATA === "true") {
			console.warn("FORCING MOCK DATA!");
		}

		(async () => {
			devUtils = await import("./utils/devUtils");
		})();
	} else {
		console.info("DEV UTILS DISABLED");
	}
}
