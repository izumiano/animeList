import type { TMDBExternalLink } from "../models/externalLink";
import type { Require } from "../utils/utils";
import WebUtil from "../utils/webUtil";
import { tmdbClientId } from "./auth/tmdbAuth";
import TMDBErrorHandler from "./errorHandlers/tmdbErrorHandler";
import BadResponse from "./responses/badResponse";
import type TMDBSeasonResponse from "./responses/tmdbSeasonResponse";
import type TMDBShowResponse from "./responses/tmdbShowResponse";

export default class TMDBRequest {
	public static async getDetails(externalLink: TMDBExternalLink) {
		const mediaType = externalLink.mediaType === "movie" ? "movie" : "tv";
		const url = new URL(
			`https://api.themoviedb.org/3/${mediaType}/${externalLink.id}`,
		);
		const request = new Request(url);
		request.headers.set("Authorization", `Bearer ${tmdbClientId}`);
		const response = await WebUtil.ratelimitRetryFunc(async () => {
			return (await WebUtil.fetch(request, "GET", {
				errorHandler: new TMDBErrorHandler("Failed getting show details"),
			})) as TMDBShowResponse | BadResponse;
		});

		if (response instanceof BadResponse) {
			return response;
		}

		return {
			...response,
			name:
				response.name ??
				response.title ??
				response.original_name ??
				response.original_title,
		} as Omit<TMDBShowResponse, "title" | "original_name" | "original_title">;
	}

	public static async getSeasonDetails(
		externalLink: Require<TMDBExternalLink, "seasonId" | "mediaType">,
	) {
		const id = externalLink.id;
		const seasonId = externalLink.seasonId;

		const url = new URL(
			`https://api.themoviedb.org/3/tv/${id}/season/${seasonId}`,
		);
		const request = new Request(url);
		request.headers.set("Authorization", `Bearer ${tmdbClientId}`);
		return await WebUtil.ratelimitRetryFunc(async () => {
			return (await WebUtil.fetch(request, "GET", {
				errorHandler: new TMDBErrorHandler(
					(
						<span>
							Failed getting season <b>{seasonId}</b> details for id=
							<b>
								<i>TMDB{id}</i>
							</b>
						</span>
					),
				),
			})) as TMDBSeasonResponse | BadResponse;
		});
	}
}
