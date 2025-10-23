import { toast } from "react-toastify";
import BadResponse from "../external/responses/badResponse";

import Anime from "../models/anime";
import AnimeCardFactory from "../external/factories/animeCardFactory";
import LocalDB from "../indexedDb/indexedDb";

export async function setAnimesToTestState(
	animes: Map<string, Anime>,
	setAnimesState: (animes: Map<string, Anime>) => void,
) {
	if (
		(animes.size !== 0 || import.meta.env.VITE_USE_MOCK_DATA !== "true") &&
		import.meta.env.VITE_FORCE_MOCK_DATA === "false"
	)
		return;

	console.info("Adding mock data");

	const response = AnimeCardFactory.create({
		animeExternalLink: { id: 52991, type: "MAL" },
		order: 0,
		getSequels: false,
	});
	if (response instanceof BadResponse) {
		toast.error("Failed adding anime");
		return;
	}
	let anime = await response.start();
	if (!anime || anime instanceof Error) {
		toast.error("Failed adding anime");
		return;
	}
	anime.seasons.forEach((season) => {
		season.episodes.splice(2);
		season.title = "Season 1";
	});
	anime = new Anime({ ...anime, autoSave: true });
	setAnimesState(
		new Map([[anime.getAnimeDbId(), new Anime({ ...anime, autoSave: true })]]),
	);
	anime.saveToDb();
}

export function deleteAllAnimes(
	animes: Map<string, Anime>,
	setAnimesState: (animes: Map<string, Anime>) => void,
) {
	if (import.meta.env.VITE_DELETE_ALL !== "true") return;

	console.warn("DELETING ALL ANIMES");

	LocalDB.Instance?.doTransaction(
		(store) => {
			return Array.from(animes.values()).map((anime) => {
				return store.delete(anime.getAnimeDbId());
			});
		},
		{
			onError: () => toast.error("Failed deleting all"),
			onSuccess: () => {
				setAnimesState(new Map());
			},
		},
	);
}
