import { toast } from "react-toastify";
import AnimeCardFactory from "../external/factories/animeCardFactory";
import BadResponse from "../external/responses/badResponse";
import LocalDB from "../indexedDb/indexedDb";
import Anime from "../models/anime";
import type { ExternalLink } from "../models/externalLink";

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

	const anime = await thing({ type: "MAL", id: 52991 }, 0);
	if (!anime) {
		return;
	}
	const anime2 = await thing({ type: "MAL", id: 5 }, 1);
	if (!anime2) {
		return;
	}
	setAnimesState(
		new Map([
			[anime.getAnimeDbId(), anime],
			[anime2.getAnimeDbId(), anime2],
		]),
	);
}

async function thing(
	externalLink: ExternalLink,
	order?: number,
	count?: number,
) {
	const response = AnimeCardFactory.create({
		order: 0,
		getSequels: true,
		externalLink: {
			...externalLink,
			type: externalLink.type ?? "MAL",
			id: externalLink.id ?? 1,
		},
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
	if (count != null) {
		anime.seasons.forEach((season) => {
			season.episodes.splice(count);
		});
	}
	anime.order = order ?? 0;
	anime = new Anime({ ...anime, autoSave: true });
	anime.saveToDb();
	return anime;
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
