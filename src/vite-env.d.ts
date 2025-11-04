/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_MAL_CLIENT_ID: string;
	readonly VITE_TMDB_CLIENT_ID: string;
	readonly VITE_EXTERNAL_SYNC_ENABLED: string;
	readonly VITE_DEV_UTILS_ENABLED: string;
	readonly VITE_USE_MOCK_DATA: string;
	readonly VITE_FORCE_MOCK_DATA: string;
	readonly VITE_DELETE_ALL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
