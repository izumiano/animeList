import Anime from "../../models/anime";
import AnimeEpisode from "../../models/animeEpisode";
import AnimeSeason from "../../models/animeSeason";
import type { ExternalLink } from "../../models/externalLink";
import ActivityTask from "../../utils/activityTask";
import BadResponse from "../responses/badResponse";
import TMDBRequest from "../tmdbRequest";

export default class TMDBCardFactory {
	public static create({
		externalLink,
		order,
		getSequels,
	}: {
		externalLink: ExternalLink;
		order: number;
		getSequels: boolean;
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
					const season = await this.getSeason(id, externalLink.seasonId);
					if (season instanceof BadResponse) {
						return season;
					}

					return new Anime({
						title: "",
						seasons: [season],
						watched: false,
						imageLink: undefined,
						externalLink: { type: "TMDB", id: id },
						order: order,
						dateStarted: null,
						dateFinished: null,
					});
				}

				const showDetails = await TMDBRequest.getShowDetails(id);
				addProgress();

				if (showDetails instanceof BadResponse) {
					return showDetails;
				}

				addMaxProgress(showDetails.seasons?.length);

				const seasonPromises =
					showDetails.seasons?.map(async (season) => {
						const seasonResponse = await this.getSeason(
							id,
							season.season_number,
						);
						addProgress();
						return { seasonNumber: season.season_number, seasonResponse };
					}) ?? [];

				const seasonsResponses = await Promise.all(seasonPromises);

				const failedSeasons = seasonsResponses.filter(
					(seasonInfo) => seasonInfo.seasonResponse instanceof BadResponse,
				);
				if (failedSeasons.length > 0) {
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

				seasons.forEach((season, index) => {
					season.seasonNumber = index + 1;
				});

				const imagePath = showDetails.poster_path;
				return new Anime({
					title: showDetails.name ?? "",
					seasons: seasons,
					watched: false,
					imageLink: imagePath
						? `https://image.tmdb.org/t/p/original${imagePath}`
						: undefined,
					externalLink: { type: "TMDB", id: id },
					order: order,
					dateStarted: null,
					dateFinished: null,
				});
			},
		});
	}

	private static async getSeason(id: number, seasonNumber: number | undefined) {
		if (seasonNumber == null) {
			return new BadResponse("Missing season number");
		}

		const seasonResponse = await TMDBRequest.getSeasonDetails(id, seasonNumber);

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
			seasonNumber: seasonNumber,
			episodes: episodes,
			watched: false,
			externalLink: { type: "TMDB", id: id, seasonId: seasonNumber },
			title: seasonResponse.name,
			dateStarted: null,
			dateFinished: null,
			mediaType: "tv",
		});
	}
}
