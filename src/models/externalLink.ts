import MALRequest from "../external/malRequest";
import type AnimeSeason from "./animeSeason";

export type ExternalLinkType = "MAL" | "TMDB" | undefined;

export type ExternalLink = { type: ExternalLinkType } & (
	| { type: "MAL"; id: number }
	| { type: "TMDB"; id: number; seasonId?: number }
	| { type: undefined; id?: undefined }
);

export function newExternalLink(
	params: ExternalLink | undefined,
): ExternalLink {
	switch (params?.type) {
		case "MAL":
			return { type: "MAL", id: params.id };
		case "TMDB":
			return { type: "TMDB", id: params.id, seasonId: params.seasonId };
		default:
			return { type: undefined };
	}
}

export function getUrlFromExternalLink(externalLink: ExternalLink) {
	if (externalLink.type === undefined) {
		return null;
	}

	switch (externalLink.type) {
		case "MAL":
			return `https://myanimelist.net/anime/${externalLink.id}`;
		case "TMDB":
			return `https://www.themoviedb.org/tv/${externalLink.id}`;
	}
}

export async function getSeasonDetails(season: AnimeSeason, fields: string[]) {
	switch (season.externalLink.type) {
		case "MAL":
			return await MALRequest.getSeasonDetails(season, fields);

		// return SeasonDetails.create(synopsis: detailsResponse?.synopsis, airedDate: detailsResponse?.airedDate)
		// case "TMDB":
		//     let detailsResponse = await TMDBRequest.getShowDetails(anime, title: title)
		//     let airedDate = detailsResponse?.seasons.first{ seasonToCheck in
		//         seasonToCheck.season_number == season.seasonNumber
		//     }?.airedDate
		//     return SeasonDetails(synopsis: detailsResponse?.overview, airedDate: airedDate ?? detailsResponse?.airedDate)
	}
}
