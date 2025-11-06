import Anime from "../../models/anime";
import AnimeEpisode from "../../models/animeEpisode";
import AnimeSeason from "../../models/animeSeason";
import type { TMDBExternalLink } from "../../models/externalLink";
import ActivityTask from "../../utils/activityTask";
import type { Require } from "../../utils/utils";
import BadResponse from "../responses/badResponse";
import TMDBRequest from "../tmdbRequest";

export default class TMDBCardFactory {
	public static create({
		externalLink,
		order,
		getSequels,
	}: {
		order: number;
		getSequels: boolean;
		externalLink: TMDBExternalLink;
	}) {
		if (externalLink.type !== "TMDB") {
			return new BadResponse(`Wrong external link type [${externalLink.type}]`);
		}

		const id = externalLink.id;

		return new ActivityTask({
			label: `Creating show from [TMDB] with id [${id})]`,
			maxProgress: 1,
			task: async ({ addProgress, addMaxProgress }) => {
				if (!getSequels) {
					const season = await this.getSeasonOrMovie(externalLink);
					if (season instanceof BadResponse) {
						return season;
					}

					return new Anime({
						title: "",
						seasons: [season],
						watched: false,
						imageLink: undefined,
						externalLink: externalLink,
						order: order,
						dateStarted: null,
						dateFinished: null,
					});
				}

				const showDetails = await TMDBRequest.getDetails(externalLink);
				addProgress();

				if (showDetails instanceof BadResponse) {
					return showDetails;
				}

				addMaxProgress(showDetails.seasons?.length);

				const seasonPromises =
					showDetails.seasons?.map(async (season) => {
						if (season.season_number == null) {
							return {
								seasonNumber: null,
								seasonResponse: new BadResponse("Missing season number"),
							};
						}

						const seasonResponse = await this.getSeason({
							...externalLink,
							seasonId: season.season_number,
						});
						addProgress();
						return { seasonNumber: season.season_number, seasonResponse };
					}) ?? [];

				const seasonsResponses = await Promise.all(seasonPromises);

				const failedSeasons = seasonsResponses.filter(
					(seasonInfo) => seasonInfo.seasonResponse instanceof BadResponse,
				);
				if (failedSeasons.length > 0) {
					console.error(
						`Could not get date for every season for id=TMDB${externalLink.id}`,
						{ failedSeasons },
					);
					return new BadResponse(
						(
							<span>
								Could not get data for every season for id=
								<b>TMDB{externalLink.id}</b>
							</span>
						),
						{
							data: failedSeasons
								.map((ex) => {
									const data = (ex.seasonResponse as BadResponse).data;
									return (
										<span className="flexColumn">
											<b>Season {ex.seasonNumber}</b>
											<span>{JSON.stringify(data, null, 2)}</span>
										</span>
									);
								})
								.reduce((prev, curr) => {
									return (
										<>
											{prev}
											<hr />
											{curr}
										</>
									);
								}),
						},
					);
				}
				const seasons = (
					seasonsResponses.map(
						(response) => response.seasonResponse,
					) as AnimeSeason[]
				).sort((lhs, rhs) => {
					if (lhs.seasonNumber < rhs.seasonNumber) {
						return -1;
					}
					return 1;
				});

				const showTitle = showDetails.name ?? "";

				if (seasons.length === 0) {
					seasons.push(
						new AnimeSeason({
							title: showTitle,
							episodes: [
								new AnimeEpisode({
									title: showTitle,
									episodeNumber: 0,
									watched: false,
								}),
							],
							watched: false,
							seasonNumber: 1,
							mediaType: externalLink.mediaType,
							externalLink: externalLink,
							dateStarted: null,
							dateFinished: null,
						}),
					);
				}

				seasons.forEach((season, index) => {
					season.seasonNumber = index + 1;
				});

				const imagePath = showDetails.poster_path;
				return new Anime({
					title: showTitle,
					seasons: seasons,
					watched: false,
					imageLink: imagePath
						? `https://image.tmdb.org/t/p/original${imagePath}`
						: undefined,
					externalLink: externalLink,
					order: order,
					dateStarted: null,
					dateFinished: null,
				});
			},
		});
	}

	private static async getSeasonOrMovie(externalLink: TMDBExternalLink) {
		switch (externalLink.mediaType) {
			case "tv":
				if (externalLink.seasonId == null) {
					return new BadResponse("Missing season id");
				}
				return await this.getSeason({
					...externalLink,
					seasonId: externalLink.seasonId,
				});
			case "movie":
				return await this.getMovie(externalLink);
			default:
				return new BadResponse(`Invalid media type ${externalLink.mediaType}`);
		}
	}

	private static async getMovie(
		externalLink: Omit<TMDBExternalLink, "seasonId">,
	) {
		const mediaType = externalLink.mediaType;
		if (mediaType !== "movie") {
			return new BadResponse(
				`Incorrect mediaType ${mediaType} for movie in getMovie`,
			);
		}

		const movieResponse = await TMDBRequest.getDetails(externalLink);

		if (movieResponse instanceof BadResponse) {
			return movieResponse;
		}

		return new AnimeSeason({
			title: movieResponse.name ?? "",
			episodes: [
				new AnimeEpisode({
					title: movieResponse.name ?? "",
					episodeNumber: 0,
					watched: false,
				}),
			],
			watched: false,
			seasonNumber: 1,
			mediaType: "movie",
			externalLink: externalLink,
			dateStarted: null,
			dateFinished: null,
		});
	}

	private static async getSeason(
		externalLink: Require<TMDBExternalLink, "seasonId">,
	) {
		const seasonId = externalLink.seasonId;
		if (seasonId == null) {
			return new BadResponse("Missing season id in getSeason");
		}
		const mediaType = externalLink.mediaType;
		if (mediaType !== "tv") {
			return new BadResponse(
				`Incorrect mediaType ${mediaType} for season in getSeason`,
			);
		}

		const seasonResponse = await TMDBRequest.getSeasonDetails({
			...externalLink,
			seasonId,
			mediaType,
		});

		if (seasonResponse instanceof BadResponse) {
			return seasonResponse;
		}

		const episodes =
			seasonResponse.episodes?.map(
				(episode) =>
					new AnimeEpisode({
						episodeNumber: episode.episode_number
							? episode.episode_number - 1
							: -1,
						title: episode.name ?? "",
						watched: false,
					}),
			) ?? [];

		return new AnimeSeason({
			seasonNumber: seasonId,
			episodes: episodes,
			watched: false,
			externalLink: externalLink,
			title: seasonResponse.name,
			dateStarted: null,
			dateFinished: null,
			mediaType: "tv",
		});
	}
}
