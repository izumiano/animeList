import { tokeiUrl } from "../../appData";
import WebUtil from "../../utils/webUtil";
import TokeiErrorHandler from "../errorHandlers/tokeiErrorHandler";
import BadResponse from "../responses/badResponse";
import type MALSearchResponse from "../responses/MALSearchResponse";
import type { MALSeasonDetails } from "../responses/MALSeasonDetails";
import type { MALSeasonResponse } from "../responses/MALSeasonResponse";
import { SeasonDetails } from "../responses/SeasonDetails";
import { trace } from "@izumiano/vite-logger";

type MatchResult = { matches: true; id: number } | { matches: false };

const MALSearch = {
	async getResults(
		query: string,
		limit: number = 9,
		matchResult: MatchResult,
	): Promise<MALSeasonDetails[] | BadResponse> {
		const searchResultsData = await MALSearch.getResultsAsyncRetry(
			query,
			limit,
			matchResult,
		);

		if (searchResultsData instanceof BadResponse) {
			return searchResultsData;
		}

		const result = MALSearch.parseResults(
			searchResultsData.results,
			searchResultsData.statusCode,
		);

		return result;
	},

	parseResults(
		seasons: MALSeasonDetails[] | MALSeasonResponse,
		statusCode: number | undefined,
	): MALSeasonDetails[] | BadResponse {
		if (statusCode == null || statusCode !== 200) {
			return new BadResponse(
				<span>
					Getting search results failed with status code: <b>{statusCode}</b>
				</span>,
				{ data: seasons },
			);
		}

		trace({ seasons });

		if (!Array.isArray(seasons)) {
			return [seasons];
		}

		const searchResults: MALSeasonDetails[] = [];
		for (const season of seasons) {
			const seasonMalId = season.mal_id;
			if (!seasonMalId) {
				throw new Error("mal_id not found");
			}
			if (searchResults.some((result) => result.mal_id === seasonMalId)) {
				console.debug("mal_id already added");
				continue;
			}

			searchResults.push(season);
		}
		return searchResults;
	},

	matchLink(query: string): MatchResult {
		const malUrlMatch = /myanimelist\.net\/anime\/(?<malId>\d+)/g.exec(query);
		if (malUrlMatch?.groups) {
			return { matches: true, id: parseInt(malUrlMatch.groups.malId) };
		}
		return { matches: false };
	},

	async getResultsAsyncRetry(
		query: string,
		limit: number,
		matchResult: MatchResult,
	): Promise<MALSearchResponse | BadResponse> {
		let id: number | null = null;
		if (matchResult.matches && !Number.isNaN(matchResult.id)) {
			id = matchResult.id;
		} else {
			const queryId = parseInt(query);
			if (!Number.isNaN(queryId)) {
				if (queryId < 1) {
					return { data: null, statusCode: 200 } as MALSearchResponse;
				}

				id = queryId;
			}
		}

		if (id != null) {
			const anime = await WebUtil.ratelimitRetryFunc(async () => {
				return await MALSearch.getAnimeDataRetry(id);
			});
			if (anime instanceof BadResponse) {
				return anime;
			}
			return { statusCode: anime.statusCode, results: [anime], data: null };
		}

		return await WebUtil.ratelimitRetryFunc(async () => {
			return await MALSearch.myAnimeListSearch(query, limit);
		});
	},

	async myAnimeListSearch(
		query: string,
		_limit: number,
	): Promise<MALSearchResponse | BadResponse> {
		query = encodeURIComponent(query);
		const animeDataResponse: MALSearchResponse | BadResponse =
			await WebUtil.fetch(`${tokeiUrl}/search/mal?q=${query}`, "GET", {
				errorHandler: new TokeiErrorHandler(
					"Failed getting MAL search results",
				),
			});

		if (animeDataResponse instanceof BadResponse) {
			return animeDataResponse;
		}

		if (!animeDataResponse.statusCode) {
			throw new BadResponse("Season data did not return with a status code");
		}

		trace({ animeDataResponse });

		return animeDataResponse;
	},

	async getAnimeDataRetry(id: number) {
		try {
			const response = (await WebUtil.fetch(
				`${tokeiUrl}/anime/mal/${id}`,
				"GET",
				{
					errorHandler: new TokeiErrorHandler("Failed getting anime data"),
				},
			)) as MALSeasonResponse | BadResponse;

			// TODO: fix this for tokei
			if (response instanceof BadResponse) {
				const data = response.data?.data as { type?: string; message?: string };
				if (
					data.type === "BadResponseException" &&
					data.message === "Resource does not exist"
				) {
					return { statusCode: 200, data: null };
				}
			} else {
				response.type = SeasonDetails.getTypeName(response.type);
			}

			return response;
		} catch (ex) {
			if (ex instanceof BadResponse) {
				return ex;
			}
			const err = ex as Error;
			return new BadResponse(err.message, { data: err });
		}
	},
};

export default MALSearch;
