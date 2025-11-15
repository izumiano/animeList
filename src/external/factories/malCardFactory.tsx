import Anime from "../../models/anime";
import AnimeEpisode from "../../models/animeEpisode";
import AnimeSeason from "../../models/animeSeason";
import { newExternalLink } from "../../models/externalLink";
import ActivityTask from "../../utils/activityTask";
import WebUtil from "../../utils/webUtil";
import JikanErrorHandler from "../errorHandlers/jikanErrorHandler";
import BadResponse from "../responses/badResponse";
import type EpisodesResponse from "../responses/MALEpisodesResponse";
import type { EpisodeDetails } from "../responses/MALEpisodesResponse";
import { MALSeasonDetails } from "../responses/MALSeasonDetails";
import { SeasonDetails } from "../responses/SeasonDetails";
import MALSearch from "../search/malSearch";
import React from "react";

export default class MALCardFactory {
	public static create({
		id,
		order,
		getSequels,
	}: {
		id: number;
		order: number;
		getSequels: boolean;
	}) {
		return new ActivityTask({
			label: (
				<span>
					Creating anime from <b>MAL</b> with id: <b>{id}</b>
				</span>
			),
			maxProgress: 3,
			task: async ({ addProgress, addMaxProgress }) => {
				const animeData = await this.getAnimeData(id);
				addProgress();
				if (animeData == null) {
					return new BadResponse("animeData was null or undefined");
				}
				if (animeData instanceof BadResponse) {
					return animeData;
				}

				let seasonsData: MALSeasonDetails[] | BadResponse;
				if (getSequels) {
					seasonsData = await this.getSeasons(animeData);
				} else {
					seasonsData = [animeData];
				}
				addProgress();

				if (seasonsData instanceof BadResponse) {
					return seasonsData;
				}

				return await this.createAnimeCard({
					seasonsData: seasonsData,
					order: order,
					id: id,
					isGettingSequels: getSequels,
					addProgress: addProgress,
					addMaxProgress: addMaxProgress,
				});
			},
		});
	}

	private static async createAnimeCard({
		seasonsData,
		order,
		id,
		isGettingSequels,
		addProgress,
		addMaxProgress,
	}: {
		seasonsData: MALSeasonDetails[];
		order: number;
		id: number;
		isGettingSequels: boolean;
		addProgress: () => void;
		addMaxProgress: (count: number) => void;
	}) {
		const seasonOne = seasonsData.at(0);
		if (!seasonOne) {
			return new BadResponse(`${id} has no seasons`);
		}

		const animeTitle = SeasonDetails.getTitle({
			title_english: seasonOne.title_english,
			title: seasonOne.title,
		});

		if (!animeTitle) {
			return new BadResponse(
				(
					<span>
						Missing title for id <b>{id}</b>
					</span>
				),
			);
		}

		const imageLink = seasonOne.images?.jpg?.large_image_url;

		addMaxProgress(seasonsData.length);

		const seasons = [];
		let minSeasonNumber = 1;
		for (const [index, seasonData] of seasonsData.entries()) {
			const seasonId = seasonData.mal_id;
			if (!seasonId) {
				return new BadResponse("did not find season mal_id");
			}

			const episodes = [];

			const episodesData = await this.getPaginatedEpisodes(seasonData);
			if (episodesData instanceof BadResponse) {
				return episodesData;
			}

			episodesData.forEach((episodeInfo) => {
				episodes.push(
					new AnimeEpisode({
						episodeNumber: episodeInfo.mal_id - 1,
						title: episodeInfo.title,
						watched: false,
					}),
				);
			});

			if (
				episodes.length === 0 &&
				(seasonData.type === "movie" || seasonData.status === "Finished Airing")
			) {
				const title = SeasonDetails.getTitle({
					title_english: seasonData.title_english,
					title: seasonData.title,
				});
				if (!title) {
					return new BadResponse(
						(
							<span>
								Missing title for episode in season <b>{index}</b> of id{" "}
								<b>{id}</b>
							</span>
						),
					);
				}
				episodes.push(
					new AnimeEpisode({
						episodeNumber: 0,
						title: title,
						watched: false,
					}),
				);
			}

			let seasonTitle: string | undefined | null = SeasonDetails.getTitle({
				title: seasonData.title,
				title_english: seasonData.title_english,
			});
			if (isGettingSequels) {
				const inferredSeasonNumberInfo =
					SeasonDetails.getInferredSeasonNumberInfo({
						title: seasonTitle,
						animeTitle: animeTitle,
						minSeasonNumber: minSeasonNumber,
					});
				const inferredSeasonNumber = inferredSeasonNumberInfo.seasonNumber;

				if (inferredSeasonNumber != null) {
					minSeasonNumber = inferredSeasonNumber;
				}

				seasonTitle = inferredSeasonNumberInfo.title;
			}

			seasons.push(
				new AnimeSeason({
					title: seasonTitle,
					seasonNumber: index + 1,
					episodes: episodes,
					watched: false,
					externalLink: newExternalLink({ type: "MAL", id: seasonId }),
					mediaType: seasonData.type ?? "tv",
					score: null,
					dateStarted: null,
					dateFinished: null,
				}),
			);

			addProgress();
		}

		addProgress();

		const animeToSave: Anime = new Anime({
			title: animeTitle,
			seasons: seasons,
			watched: false,
			imageLink: imageLink,
			externalLink: newExternalLink({ type: "MAL", id: id }),
			order: order,
			dateStarted: null,
			dateFinished: null,
		});

		return animeToSave;
	}

	private static async getAnimeData(id: number) {
		const season = await WebUtil.ratelimitRetryFunc(async () => {
			return await MALSearch.getAnimeDataRetry(id);
		});

		if (season instanceof BadResponse) {
			return season;
		}

		const animeStatus = season.data?.status;
		if (!animeStatus) {
			return new BadResponse("Did not find anime status");
		}
		return season.data;
	}

	private static async getSeasons(season: MALSeasonDetails) {
		const seasonData = [];
		seasonData.push(season);

		let currentAnimeData: MALSeasonDetails | BadResponse | null = season;
		while ((currentAnimeData = await this.getSequel(currentAnimeData))) {
			if (currentAnimeData instanceof BadResponse) {
				return currentAnimeData;
			}
			seasonData.push(currentAnimeData);
		}
		console.debug(`found ${seasonData.length} seasons`);

		return seasonData;
	}

	private static async getSequel(season: MALSeasonDetails) {
		const sequelId = this.getSequelId(season);
		if (!sequelId) {
			console.debug("no sequel");
			return null;
		}
		return await this.getAnimeData(sequelId);
	}

	private static getSequelId(season: MALSeasonDetails) {
		const relations = season.relations;
		if (!relations) {
			console.warn("did not find relations");
			return null;
		}

		for (const relationData of relations) {
			const relation = relationData.relation;
			if (!relation) {
				console.warn("did not find relation type");
				continue;
			}

			if (relation !== "Sequel") {
				continue;
			}

			const entry = relationData.entry;
			if (!entry) {
				console.warn("did not find entry");
				continue;
			}

			for (const season of entry) {
				const sequelType = season.type;
				if (!sequelType) {
					console.warn("did not find sequel type");
					continue;
				}
				if (sequelType !== "anime") {
					continue;
				}
				const malId = season.mal_id;
				if (!malId) {
					console.warn("did not find mal_id");
					continue;
				}

				return malId;
			}
		}

		return null;
	}

	private static async getPaginatedEpisodes(season: MALSeasonDetails) {
		const id = season.mal_id;
		if (!id) {
			return new BadResponse("did not find mal_id");
		}

		const episodeCount = season.episodes ?? 0;
		let pageCount = Math.ceil(episodeCount / 100);
		let pageStartIndex = 1;
		let possiblePageOne: EpisodeDetails[] = [];
		if (pageCount < 1) {
			const pageData = await this.getPaginatedEpisodesSlow(id);
			if (pageData instanceof BadResponse) {
				return pageData;
			}
			possiblePageOne = pageData.data;
			pageCount = pageData.lastVisiblePage;
			pageStartIndex = 2;
		}

		const episodePromises = [];
		for (let i = pageStartIndex; i < pageCount + 1; i++) {
			episodePromises.push(
				new Promise<EpisodeDetails[]>((resolve, reject) => {
					(async () => {
						const episodeResponse = await this.getEpisodesPage({
							id: id,
							pageIndex: i,
						});

						if (episodeResponse instanceof Error) {
							reject(episodeResponse);
							return;
						}

						const data = episodeResponse.data;
						if (!data) {
							reject("Missing data in GetPaginatedEpisodes");
							return;
						}

						resolve(data ?? []);
					})();
				}),
			);
		}

		try {
			return (await Promise.all(episodePromises))
				.flat()
				.concat(possiblePageOne)
				.sort((lhs, rhs) => {
					if (lhs.mal_id < rhs.mal_id) {
						return -1;
					}
					return 1;
				});
		} catch (ex) {
			if (ex instanceof BadResponse) {
				return ex;
			}
			if (typeof ex === "string") {
				return new BadResponse(ex);
			}
			if (React.isValidElement(ex)) {
				return new BadResponse(ex);
			}
			const err = ex as Error;
			return new BadResponse(err.message, { data: err });
		}
	}

	private static async getPaginatedEpisodesSlow(id: number) {
		const episodeResponse = await this.getEpisodesPage({
			id: id,
			pageIndex: 1,
		});
		if (episodeResponse instanceof BadResponse) {
			return episodeResponse;
		}

		const data = episodeResponse.data;
		if (!data) {
			return new BadResponse("Missing data in GetPaginatedEpisodes");
		}
		const lastVisiblePage = episodeResponse.pagination?.last_visible_page;
		if (!lastVisiblePage) {
			return new BadResponse(
				"Missing last_visible_page in GetPaginatedEpisodes",
			);
		}

		return { data: data, lastVisiblePage: lastVisiblePage };
	}

	private static async getEpisodesPage({
		id,
		pageIndex,
	}: {
		id: number;
		pageIndex: number;
	}) {
		return await WebUtil.ratelimitRetryFunc(async () => {
			return (await WebUtil.fetch(
				`https://api.jikan.moe/v4/anime/${id}/episodes?page=${pageIndex}`,
				"GET",
				{
					errorHandler: new JikanErrorHandler(
						"Failed getting paginated episodes",
					),
				},
			)) as EpisodesResponse | BadResponse;
		});
	}
}
