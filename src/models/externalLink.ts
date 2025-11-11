import { toast } from "react-toastify";
import MALRequest from "../external/malRequest";
import BadResponse from "../external/responses/badResponse";
import { SeasonDetails } from "../external/responses/SeasonDetails";
import TMDBRequest from "../external/tmdbRequest";
import type AnimeSeason from "./animeSeason";
import malLogo from "assets/malLogo.png";
import tmdbLogo from "assets/tmdbLogo.png";

export const ExternalLinkTypeValues = ["MAL", "TMDB", undefined] as const;
export type ExternalLinkType = (typeof ExternalLinkTypeValues)[number];

export type TMDBExternalLink = {
	type: `TMDB`;
	id: number;
	mediaType?: "tv" | "movie";
	seasonId?: number;
};

export type MALExternalLink = { type: "MAL"; id: number };

export type ExternalLink = { type: ExternalLinkType } & (
	| MALExternalLink
	| TMDBExternalLink
	| { type: undefined; id?: undefined }
);

export function newExternalLink(
	externalLink: ExternalLink | undefined,
): ExternalLink {
	switch (externalLink?.type) {
		case "MAL":
			return externalLink;
		case "TMDB":
			return { ...externalLink, mediaType: externalLink.mediaType ?? "tv" };
		default:
			return { type: undefined };
	}
}

export function getUrlFromExternalLink(externalLink: ExternalLink) {
	switch (externalLink.type) {
		case "MAL":
			return `https://myanimelist.net/anime/${externalLink.id}`;
		case "TMDB": {
			const mediaType = externalLink.mediaType === "movie" ? "movie" : "tv";
			return `https://www.themoviedb.org/${mediaType}/${externalLink.id}`;
		}
		default:
			toast.error("Invalid external link type in getUrlFromExternalLink");
			return null;
	}
}

export function externalLinkId(externalLink: ExternalLink, title: string) {
	switch (externalLink.type) {
		case "MAL":
			return `MAL${externalLink.id}`;

		case "TMDB":
			if (!externalLink.mediaType) {
				console.warn(externalLink);
				console.warn(
					`TMDB_${externalLink.mediaType}${externalLink.id}${externalLink.seasonId ?? ""}`,
				);
			}
			return `TMDB${externalLink.mediaType}${externalLink.id}${externalLink.seasonId ?? ""}`;
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
			const detailsResponse = await TMDBRequest.getDetails(externalLink);
			if (detailsResponse instanceof BadResponse) {
				return detailsResponse;
			}

			const airedDate =
				detailsResponse?.seasons?.find(
					(seasonToCheck) =>
						seasonToCheck.season_number === externalLink.seasonId,
				)?.air_date ?? detailsResponse.release_date;
			return new SeasonDetails({
				synopsis: detailsResponse?.overview,
				started_date: airedDate ? new Date(airedDate) : undefined,
			});
		}
	}
}

export function getExternalLogo(externalLinkType: ExternalLinkType) {
	switch (externalLinkType) {
		case "MAL":
			return malLogo;
		case "TMDB":
			return tmdbLogo;

		default:
			return;
	}
}

export function getExternalHomepage(externalLinkType: ExternalLinkType) {
	switch (externalLinkType) {
		case "MAL":
			return "https://myanimelist.net";
		case "TMDB":
			return "https://www.themoviedb.org";

		default:
			return;
	}
}

export type ExternalLinkToValueType<T> = {
	[K in Exclude<ExternalLinkType, undefined>]: T;
};
