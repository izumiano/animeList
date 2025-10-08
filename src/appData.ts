import type Anime from "./models/anime";

export default class AppData {
  static animes: Map<string, Anime>;
}

export const externalSyncEnabled =
  import.meta.env.VITE_EXTERNAL_SYNC_ENABLED === "true";
