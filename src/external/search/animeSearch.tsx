import {
	SeasonDetails,
	type MALSeasonDetailsRequireId,
	type TMDBSeasonDetailsRequireId,
} from "../responses/SeasonDetails";
import MALSearch from "./malSearch";
import BadResponse from "../responses/badResponse";
import { showError, sleepFor } from "../../utils/utils";
import type { ExternalLinkType } from "../../models/externalLink";
import TMDBSearch from "./tmdbSearch";

let abortController = new AbortController();

export default class AnimeSearch {
	public static async search(
		query: string,
		callback: (params: {
			seasons: SeasonDetails[];
			externalType?: ExternalLinkType;
		}) => void,
		limit: number = 9,
	) {
		abortController.abort();
		abortController = new AbortController();

		if (query === "") {
			callback({ seasons: [] });
			return;
		}

		if ((await sleepFor(1000, abortController.signal)).wasAborted) {
			return;
		}

		const malSearch = MALSearch.getResults(query, limit);
		const tmdbSearch = TMDBSearch.getResults(query);

		malSearch.catch((results) => {
			showError(results);
			callback({ seasons: [], externalType: "MAL" });
		});
		tmdbSearch.catch((results) => {
			showError(results);
			callback({ seasons: [], externalType: "TMDB" });
		});

		malSearch.then((results) => {
			if (results instanceof BadResponse) {
				showError(results);
				callback({ seasons: [], externalType: "MAL" });
				return;
			}

			if (results.some((result) => result.mal_id === undefined)) {
				showError("An anime is missing an id");
				callback({ seasons: [], externalType: "MAL" });
				return;
			}

			callback({
				seasons: results.map((result) =>
					SeasonDetails.createFromMal(result as MALSeasonDetailsRequireId),
				),
				externalType: "MAL",
			});
		});
		tmdbSearch.then((results) => {
			if (results instanceof BadResponse || !results.results) {
				showError(results);
				callback({ seasons: [], externalType: "TMDB" });
				return;
			}

			if (results.results.some((results) => results.id === undefined)) {
				showError("A show is missing an id");
				callback({ seasons: [], externalType: "MAL" });
				return;
			}

			callback({
				seasons: results.results
					.slice(0, limit)
					.map((result) =>
						SeasonDetails.createFromTmdb(result as TMDBSeasonDetailsRequireId),
					)
					.sort((lhs, rhs) => {
						if (
							lhs.popularity &&
							rhs.popularity &&
							lhs.popularity > rhs.popularity
						) {
							return -1;
						}
						return 1;
					}),
				externalType: "TMDB",
			});
		});
	}
}
