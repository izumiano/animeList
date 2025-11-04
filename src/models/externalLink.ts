import MALRequest from "../external/malRequest";
import BadResponse from "../external/responses/badResponse";
import { SeasonDetails } from "../external/responses/SeasonDetails";
import TMDBRequest from "../external/tmdbRequest";
import type AnimeSeason from "./animeSeason";

export const ExternalLinkTypeValues = ["MAL", "TMDB", undefined] as const;
export type ExternalLinkType = (typeof ExternalLinkTypeValues)[number];

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
	switch (externalLink.type) {
		case "MAL":
			return `https://myanimelist.net/anime/${externalLink.id}`;
		case "TMDB":
			return `https://www.themoviedb.org/tv/${externalLink.id}`;
		default:
			return null;
	}
}

export function externalLinkId(externalLink: ExternalLink, title: string) {
	switch (externalLink.type) {
		case "MAL":
			return `MAL${externalLink.id}`;

		case "TMDB":
			return `TMDB${externalLink.id}${externalLink.seasonId ?? ""}`;
		default:
			return `NONE${title}`;
	}
}

export async function getSeasonDetails(season: AnimeSeason, fields: string[]) {
	const externalLink = season.externalLink;
	switch (externalLink.type) {
		case "MAL":
			return await MALRequest.getSeasonDetails(season, fields);
		case "TMDB": {
			const detailsResponse = await TMDBRequest.getShowDetails(externalLink.id);
			if (detailsResponse instanceof BadResponse) {
				return detailsResponse;
			}

			const airedDate = detailsResponse?.seasons?.find(
				(seasonToCheck) =>
					seasonToCheck.season_number === externalLink.seasonId,
			)?.air_date;
			return new SeasonDetails({
				synopsis: detailsResponse?.overview,
				started_date: airedDate ? new Date(airedDate) : undefined,
			});
		}
	}
}
