import WebUtil from "../utils/webUtil";
import { tmdbClientId } from "./auth/tmdbAuth";
import TMDBErrorHandler from "./errorHandlers/tmdbErrorHandler";
import BadResponse from "./responses/badResponse";
import type TMDBSeasonResponse from "./responses/tmdbSeasonResponse";
import type TMDBShowResponse from "./responses/tmdbShowResponse";

export default class TMDBRequest {
	public static async getShowDetails(id: number) {
		const url = new URL(`https://api.themoviedb.org/3/tv/${id}`);
		const request = new Request(url);
		request.headers.set("Authorization", `Bearer ${tmdbClientId}`);
		return await WebUtil.ratelimitRetryFunc(async () => {
			return (await WebUtil.fetch(request, "GET", {
				errorHandler: new TMDBErrorHandler("Failed getting show details"),
			})) as TMDBShowResponse | BadResponse;
		});
	}

	public static async getSeasonDetails(id: number, seasonNumber: number) {
		const url = new URL(
			`https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}`,
		);
		const request = new Request(url);
		request.headers.set("Authorization", `Bearer ${tmdbClientId}`);
		return await WebUtil.ratelimitRetryFunc(async () => {
			return (await WebUtil.fetch(request, "GET", {
				errorHandler: new TMDBErrorHandler(
					(
						<span>
							Failed getting season <b>{seasonNumber}</b> details for id=
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
