import WebUtil from "../../utils/webUtil";
import JikanErrorHandler from "../errorHandlers/jikanErrorHandler";
import BadResponse from "../responses/badResponse";
import MALSearchResponse from "../responses/MALSearchResponse";
import { MALSeasonDetails } from "../responses/MALSeasonDetails";
import MALSeasonResponse from "../responses/MALSeasonResponse";
import { SeasonDetails } from "../responses/SeasonDetails";

export default class MALSearch {
	public static async getResults(
		query: string,
		limit: number = 9,
	): Promise<MALSeasonDetails[] | BadResponse> {
		const searchResultsData = await this.getResultsAsyncRetry(query, limit);

		if (searchResultsData instanceof BadResponse) {
			return searchResultsData;
		}

		const result = await this.getResultsAsync(searchResultsData);

		return result;
	}

	private static async getResultsAsync(
		data: MALSearchResponse | MALSeasonResponse,
	): Promise<MALSeasonDetails[] | BadResponse> {
		if (data.statusCode !== 200) {
			return new BadResponse(
				(
					<span>
						Getting search results failed with status code:{" "}
						<b>{data.statusCode}</b>
					</span>
				),
				{ data: data },
			);
		}

		const seasons = data.data;
		if (!seasons) {
			return [];
		}

		if (!Array.isArray(seasons)) {
			return [seasons];
		}

		const searchResults: MALSeasonDetails[] = [];
		for (const season of seasons) {
			const seasonMalId = season.mal_id;
			if (!seasonMalId) {
				throw new Error("mal_id not found");
			}
			const approved = season.approved;
			if (approved === undefined) {
				throw new Error("approved not found");
			}
			if (!approved) {
				console.debug(`${seasonMalId} not approved`);
				continue;
			}
			if (searchResults.some((result) => result.mal_id === seasonMalId)) {
				console.debug("mal_id already added");
				continue;
			}

			searchResults.push(season);
		}
		return searchResults.sort((resultA, resultB) => {
			if (
				(resultA.popularity ?? Number.POSITIVE_INFINITY) <
				(resultB.popularity ?? Number.POSITIVE_INFINITY)
			) {
				return -1;
			}
			return 1;
		});
	}

	private static async getResultsAsyncRetry(query: string, limit: number) {
		let _query = query;
		const malUrlMatch =
			/https:\/\/myanimelist\.net\/anime\/(?<malId>\d+)/g.exec(query);
		if (malUrlMatch && malUrlMatch.groups) {
			_query = malUrlMatch.groups.malId;
		}
		const id = parseInt(_query);
		if (!Number.isNaN(id)) {
			return await WebUtil.ratelimitRetryFunc(async () => {
				return await this.getAnimeDataRetry(id);
			});
		}

		return await WebUtil.ratelimitRetryFunc(async () => {
			return await this.myAnimeListSearch(query, limit);
		});
	}

	private static async myAnimeListSearch(query: string, limit: number) {
		query = encodeURIComponent(query);
		const animeDataResponse: MALSearchResponse | BadResponse =
			await WebUtil.fetch(
				`https://api.jikan.moe/v4/anime?q=${query}&limit=${limit}&sfw`,
			);

		if (animeDataResponse instanceof BadResponse) {
			return animeDataResponse;
		}

		if (!animeDataResponse.statusCode) {
			throw new BadResponse("Season data did not return with a status code");
		}

		return animeDataResponse;
	}

	public static async getAnimeDataRetry(id: number) {
		try {
			const response = (await WebUtil.fetch(
				`https://api.jikan.moe/v4/anime/${id}/full`,
				"GET",
				{
					errorHandler: new JikanErrorHandler("Failed getting anime data"),
				},
			)) as MALSeasonResponse | BadResponse;

			if (!(response instanceof BadResponse) && response.data) {
				response.data.type = SeasonDetails.getTypeName(response.data.type);
			}

			return response;
		} catch (ex) {
			if (ex instanceof BadResponse) {
				return ex;
			}
			const err = ex as Error;
			return new BadResponse(err.message, { data: err });
		}
	}
}
