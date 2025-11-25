import type { TMDBExternalLink } from "../models/externalLink";
import type { Require } from "../utils/utils";
import WebUtil from "../utils/webUtil";
import { tmdbClientId } from "./auth/tmdbAuth";
import TMDBErrorHandler from "./errorHandlers/tmdbErrorHandler";
import BadResponse from "./responses/badResponse";
import type TMDBCreateRequestTokenResponse from "./responses/tmdbCreateRequestTokenResponse";
import type TMDBCreateSessionResponse from "./responses/tmdbCreateSessionResponse";
import type TMDBSeasonResponse from "./responses/tmdbSeasonResponse";
import type TMDBShowResponse from "./responses/tmdbShowResponse";

const TMDBRequest = {
	async getDetails(externalLink: TMDBExternalLink) {
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
	},

	async getSeasonDetails(
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
					<span>
						Failed getting season <b>{seasonId}</b> details for id=
						<b>
							<i>TMDB{id}</i>
						</b>
					</span>,
				),
			})) as TMDBSeasonResponse | BadResponse;
		});
	},

	async createRequestToken() {
		const url = new URL(
			"https://api.themoviedb.org/3/authentication/token/new",
		);
		const request = new Request(url);
		request.headers.set("Authorization", `Bearer ${tmdbClientId}`);

		return (await WebUtil.fetch(request, "GET", {
			errorHandler: new TMDBErrorHandler(
				<span>Failed creating request token</span>,
			),
		})) as TMDBCreateRequestTokenResponse | BadResponse;
	},

	async createSession(requestToken: string) {
		const url = new URL(
			"https://api.themoviedb.org/3/authentication/session/new",
		);
		const request = new Request(url);
		request.headers.set("Authorization", `Bearer ${tmdbClientId}`);
		request.headers.set("content-type", "application/json");

		return (await WebUtil.fetch(request, "POST", {
			bodyObj: { request_token: requestToken },
		})) as TMDBCreateSessionResponse | BadResponse;
	},
};

export default TMDBRequest;
