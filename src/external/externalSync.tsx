import { toast } from "react-toastify";
import { externalSyncEnabled } from "../appData";
import type Anime from "../models/anime";
import type AnimeSeason from "../models/animeSeason";
import {
	type ExternalLink,
	externalLinkEq,
	externalLinkId,
} from "../models/externalLink";
import ActivityTask, { pushTask } from "../utils/activityTask";
import {
	CanceledOperation as AbortedOperation,
	roundToNearestDecimal,
	sleepFor,
} from "../utils/utils";
import { MALAuth } from "./auth/malAuth";
import { TMDBAuth } from "./auth/tmdbAuth";
import BadResponse from "./responses/badResponse";

const abortControllers: Map<string, AbortController> = new Map();

const ExternalSync = {
	async updateSeasonStatus(
		season: AnimeSeason,
		anime: Anime | undefined,
		params?: {
			showToastOnSuccess?: boolean;
			allowAbort?: boolean;
			doPushTask?: boolean;
		},
	) {
		if (!this.isConnected(season.externalLink)) {
			return;
		}

		params ??= {};
		params.showToastOnSuccess ??= true;
		params.allowAbort ??= true;
		params.doPushTask ??= true;

		const task = new ActivityTask({
			label: (
				<span>
					Updating{" "}
					<b>
						{anime?.title} <i>[{season.title}]</i>
					</b>
				</span>
			),
			task: async () => {
				if (params.allowAbort) {
					const id = externalLinkId(
						season.externalLink,
						anime?.title ?? season.title,
					);
					abortControllers.get(id)?.abort();
					const abortController = new AbortController();
					abortControllers.set(id, abortController);

					if ((await sleepFor(2000, abortController.signal)).wasAborted) {
						return new AbortedOperation();
					}

					abortControllers.delete(id);
				}

				const externalLink = season.externalLink;
				switch (externalLink.type) {
					case "MAL":
						console.log("here");
						return MALAuth.instance.userToken?.updateAnimeSeasonStatus(
							season,
							anime?.title,
						);
					case "TMDB": {
						if (!anime) {
							return new BadResponse(
								"'anime' cannot be null when external type is tmdb",
							);
						}

						const userToken = TMDBAuth.instance.userToken;

						const scores = anime.seasons
							.filter((season) =>
								externalLinkEq(season.externalLink, externalLink),
							)
							.map((season) => season.score);

						let score: number;
						if (scores.some((score) => !score)) {
							score = 0;
							const response = await userToken?.setIsInWatchlist(
								externalLink,
								true,
							);
							if (response instanceof BadResponse) {
								return response;
							}
						} else {
							score = roundToNearestDecimal(
								2 *
									((scores as number[]).reduce((prev, curr) => prev + curr) /
										scores.length),
								0.5,
							);
						}

						return userToken?.updateStatus(externalLink, {
							score: score,
						});
					}
					default:
						return new BadResponse(
							`Invalid external link type [${externalLink.type}]`,
						);
				}
			},
		});

		try {
			if (params.doPushTask) {
				return await pushTask(task);
			}

			await task.start();

			return task;
		} finally {
			if (params.showToastOnSuccess) {
				toast.info(
					<span>
						Successfully updated{" "}
						<b>
							{anime?.title} <i>[{season.title}]</i>
						</b>
					</span>,
				);
			}
		}
	},

	async deleteAnimeSeason(
		season: AnimeSeason,
		anime: Anime,
		params?: {
			showToastOnSuccess?: boolean;
			doPushTask?: boolean;
			forceDelete?: boolean;
		},
	) {
		if (!ExternalSync.isConnected(season.externalLink)) return;

		params ??= {};
		params.showToastOnSuccess ??= true;
		params.doPushTask ??= true;
		params.forceDelete ??= false;

		const task = new ActivityTask({
			label: (
				<span>
					Deleting{" "}
					<b>
						{anime.title} <i>[{season.title}]</i>
					</b>
				</span>
			),
			task: async () => {
				const id = `${season.externalLink.type}${season.externalLink.id}`;
				abortControllers.get(id)?.abort();
				abortControllers.delete(id);

				try {
					const externalLink = season.externalLink;
					switch (externalLink.type) {
						case "MAL":
							return await MALAuth.instance.userToken?.deleteSeason(
								season,
								anime.title,
							);
						case "TMDB": {
							const userToken = TMDBAuth.instance.userToken;

							const scores = anime.seasons
								.filter(
									(checkSeason) =>
										checkSeason !== season &&
										externalLinkEq(checkSeason.externalLink, externalLink),
								)
								.map((season) => season.score);

							let score = 0;
							if (!scores.some((score) => !score)) {
								score = roundToNearestDecimal(
									2 *
										((scores as number[]).reduce(
											(prev, curr) => prev + curr,
											0,
										) /
											scores.length),
									0.5,
								);
							}

							const inWatchlist = scores.length > 1 && score === 0;

							const statusResponse = userToken?.updateStatus(externalLink, {
								score: params.forceDelete ? 0 : score,
							});
							if (statusResponse instanceof BadResponse) {
								return statusResponse;
							}

							return await userToken?.setIsInWatchlist(
								externalLink,
								params.forceDelete ? false : inWatchlist,
							);
						}

						default:
							break;
					}
				} finally {
					if (params.showToastOnSuccess) {
						toast.info(
							<span>
								Successfully Deleted{" "}
								<b>
									{anime.title} <i>[{season.title}]</i>
								</b>
							</span>,
						);
					}
				}
			},
		});

		if (params.doPushTask) {
			return await pushTask(task);
		}

		await task.start();

		return task;
	},

	isConnected(externalLink: ExternalLink) {
		if (!externalSyncEnabled) return false;

		switch (externalLink.type) {
			case "MAL":
				return MALAuth.instance.userToken != null;
			case "TMDB":
				return TMDBAuth.instance.userToken != null;
			default:
				return false;
		}
	},
};

export default ExternalSync;
