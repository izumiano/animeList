import type { TMDBMediaType } from "../../models/externalLink";
import { showError } from "../../utils/utils";
import WebUtil from "../../utils/webUtil";
import { tmdbClientId } from "../auth/tmdbAuth";
import BadResponse from "../responses/badResponse";
import type TMDBSearchResponse from "../responses/tmdbSearchResponse";
import type TMDBSeasonResponse from "../responses/tmdbSeasonResponse";
import TMDBRequest from "../tmdbRequest";

type MatchResult =
	| { matches: true; id: number; mediaType: TMDBMediaType }
	| { matches: false };

const TMDBSearch = {
	async getResults(query: string, matchResult: MatchResult) {
		const searchResponse = await TMDBSearch.getResultsAsync(query, matchResult);
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

	matchLink(query: string): MatchResult {
		const tmdbTvUrlMatch = /themoviedb\.org\/tv\/(?<tmdbId>\d+)/g.exec(query);
		if (tmdbTvUrlMatch?.groups) {
			return {
				matches: true,
				id: parseInt(tmdbTvUrlMatch.groups.tmdbId),
				mediaType: "tv",
			};
		}

		const tmdbMovieUrlMatch = /themoviedb\.org\/movie\/(?<tmdbId>\d+)/g.exec(
			query,
		);
		if (tmdbMovieUrlMatch?.groups) {
			return {
				matches: true,
				id: parseInt(tmdbMovieUrlMatch.groups.tmdbId),
				mediaType: "movie",
			};
		}

		return { matches: false };
	},

	async getResultsAsync(
		query: string,
		matchResult: MatchResult,
	): Promise<BadResponse | TMDBSearchResponse> {
		let idSearches: { id: number; mediaType: TMDBMediaType }[] | null = null;
		if (matchResult.matches && !Number.isNaN(matchResult.id)) {
			idSearches = [{ id: matchResult.id, mediaType: matchResult.mediaType }];
		} else {
			const queryId = parseInt(query);
			if (!Number.isNaN(queryId)) {
				if (queryId < 1) {
					return { data: null, statusCode: 200, results: [] };
				}

				idSearches = [
					{ id: queryId, mediaType: "tv" },
					{ id: queryId, mediaType: "movie" },
				];
			}
		}

		if (idSearches && idSearches.length > 0) {
			const responsePromises = [];

			for (const search of idSearches) {
				responsePromises.push(
					TMDBRequest.getDetails({
						type: "TMDB",
						id: search.id,
						mediaType: search.mediaType,
					}),
				);
			}

			const responses = await Promise.allSettled(responsePromises);

			for (const response of responses) {
				if (response.status === "rejected") {
					showError(new BadResponse(response.reason));
				} else if (response.value instanceof BadResponse) {
					const data = response.value.data?.data as {
						status_code?: number;
						status_message?: string;
					};
					!(
						data.status_code === 34 &&
						data.status_message ===
							"The resource you requested could not be found."
					) && showError(response.value);
				}
			}

			return {
				data: null,
				statusCode: 200,
				results: responses
					.filter(
						(response) =>
							response.status === "fulfilled" &&
							!(response.value instanceof BadResponse),
					)
					.map(
						(response) =>
							(response as PromiseFulfilledResult<TMDBSeasonResponse>).value,
					),
			};
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
