import WebUtil from "../../utils/webUtil";
import { tmdbClientId } from "../auth/tmdbAuth";
import BadResponse from "../responses/badResponse";
import type TMDBSearchResponse from "../responses/tmdbSearchResponse";
import TMDBRequest from "../tmdbRequest";

const TMDBSearch = {
	async getResults(query: string) {
		const searchResponse = await TMDBSearch.getResultsAsync(query);
		if (searchResponse instanceof BadResponse) {
			return searchResponse;
		}

		if (searchResponse.statusCode !== 200) {
			return new BadResponse(
				<span>
					Getting search results failed with status code:{" "}
					<b>{searchResponse.statusCode}</b>
				</span>,
				{ data: searchResponse },
			);
		}

		return searchResponse;
	},

	async getResultsAsync(
		query: string,
	): Promise<BadResponse | TMDBSearchResponse> {
		let _query = query;
		const tmdbUrlMatch = /themoviedb\.org\/tv\/(?<tmdbId>\d+)/g.exec(query);
		if (tmdbUrlMatch?.groups) {
			_query = tmdbUrlMatch.groups.tmdbId;
		}
		const id = parseInt(_query);
		if (!Number.isNaN(id)) {
			const showDetailsResponse = TMDBRequest.getDetails({
				type: "TMDB",
				id: id,
				mediaType: "tv",
			});
			const movieDetailsResponse = TMDBRequest.getDetails({
				type: "TMDB",
				id: id,
				mediaType: "movie",
			});

			const responses = await Promise.allSettled([
				showDetailsResponse,
				movieDetailsResponse,
			]);

			if (
				responses.every(
					(response) =>
						response.status === "rejected" ||
						response.value instanceof BadResponse ||
						response.value.statusCode !== 200,
				)
			) {
				responses.map((response) => {
					if (response.status === "rejected") {
						return new BadResponse(response.reason);
					}
					return new BadResponse(response.value.name, { ...response.value });
				});
			}

			return {
				data: null,
				statusCode: 200,
				results: responses
					.filter((response) => response.status === "fulfilled")
					.map((response) => response.value),
			} as TMDBSearchResponse;
		}

		const url = new URL(
			`https://api.themoviedb.org/3/search/multi?query=${query}`,
		);
		const request = new Request(url);
		request.headers.set("Authorization", `Bearer ${tmdbClientId}`);

		return await WebUtil.ratelimitRetryFunc(
			async () =>
				(await WebUtil.fetch(request, "GET")) as
					| TMDBSearchResponse
					| BadResponse,
		);
	},
};

export default TMDBSearch;
