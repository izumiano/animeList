import WebUtil from "../../utils/webUtil";
import { tmdbClientId } from "../auth/tmdbAuth";
import BadResponse from "../responses/badResponse";
import type TMDBSearchResponse from "../responses/tmdbSearchResponse";
import TMDBRequest from "../tmdbRequest";

export default class TMDBSearch {
	public static async getResults(query: string) {
		const searchResponse = await this.getResultsAsync(query);
		if (searchResponse instanceof BadResponse) {
			return searchResponse;
		}

		if (searchResponse.statusCode !== 200) {
			return new BadResponse(
				(
					<span>
						Getting search results failed with status code:{" "}
						<b>{searchResponse.statusCode}</b>
					</span>
				),
				{ data: searchResponse },
			);
		}

		return searchResponse;
	}

	private static async getResultsAsync(
		query: string,
	): Promise<BadResponse | TMDBSearchResponse> {
		let _query = query;
		const tmdbUrlMatch = /themoviedb\.org\/tv\/(?<tmdbId>\d+)/g.exec(query);
		if (tmdbUrlMatch && tmdbUrlMatch.groups) {
			_query = tmdbUrlMatch.groups.tmdbId;
		}
		const id = parseInt(_query);
		if (!Number.isNaN(id)) {
			const showDetailsResponse = await TMDBRequest.getShowDetails(id);

			if (showDetailsResponse instanceof BadResponse) {
				return showDetailsResponse;
			}

			return {
				data: null,
				statusCode: showDetailsResponse.statusCode,
				results: showDetailsResponse.seasons,
			} as TMDBSearchResponse;
		}

		const url = new URL(
			`https://api.themoviedb.org/3/search/tv?query=${query}`,
		);
		const request = new Request(url);
		request.headers.set("Authorization", `Bearer ${tmdbClientId}`);

		return await WebUtil.ratelimitRetryFunc(
			async () =>
				(await WebUtil.fetch(request, "GET")) as
					| TMDBSearchResponse
					| BadResponse,
		);
	}
}
