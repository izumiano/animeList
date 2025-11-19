import AppData from "../appData";
import type Anime from "./anime";
import type { MediaType } from "./anime";
import AnimeEpisode from "./animeEpisode";
import type { ExternalLink } from "./externalLink";

export default class AnimeSeason {
	title: string;
	episodes: AnimeEpisode[];
	watched: boolean;
	seasonNumber: number;
	mediaType: MediaType | undefined;
	externalLink: ExternalLink;
	score: number | null;
	dateStarted: Date | null;
	dateFinished: Date | null;

	private anime: Anime | undefined;

	pauseAutoSave = false;

	constructor(params: {
		animeDbId?: string;
		title?: string | null;
		episodes: AnimeEpisode[];
		watched: boolean;
		seasonNumber: number;
		mediaType: MediaType | undefined;
		externalLink: ExternalLink;
		score: number | null;
		dateStarted: Date | number | null;
		dateFinished: Date | number | null;
		anime?: Anime;
	}) {
		this.anime = params.anime;

		this.title = params.title ?? `Season ${params.seasonNumber}`;
		this.externalLink = params.externalLink;
		this.episodes = params.episodes.map((episode) => {
			return new AnimeEpisode({
				...episode,
				...{
					animeDbId: params.animeDbId,
					seasonInfo: { season: this, animeTitle: params.anime?.title },
				},
			});
		});
		this.watched = params.watched;
		this.seasonNumber = params.seasonNumber;
		this.mediaType = params.mediaType;
		this.score = params.score;

		this.dateStarted = !params.dateStarted
			? null
			: new Date(params.dateStarted);
		this.dateFinished = !params.dateFinished
			? null
			: new Date(params.dateFinished);

		if (params.animeDbId) {
			return new Proxy(this, {
				set: function (
					target: AnimeSeason,
					property: keyof AnimeSeason,
					value: any,
				) {
					if (target[property] !== value) {
						const prevValue = target[property];
						Reflect.set(target, property, value);
						if (!target.pauseAutoSave && property !== "pauseAutoSave") {
							console.debug(
								`AnimeSeason Property in '${params.title}' '${property}' changed from'`,
								prevValue,
								"to",
								value,
							);
							AppData.animes.get(params.animeDbId!)?.saveToDb();
						}
					}
					return true;
				},
			});
		}
	}

	public runWithoutUpdatingDb(action: () => void) {
		this.pauseAutoSave = true;
		action();
		this.pauseAutoSave = false;
	}

	public checkWatchedAll(season: AnimeSeason | null = null) {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		season ??= this;

		if (season.episodes.length === 0) {
			season.watched = false;
			return false;
		}

		for (const episode of season.episodes) {
			if (!episode.watched) {
				season.watched = false;
				console.debug("not watched episode", episode, season.title);
				return false;
			}
		}
		season.watched = true;
		console.debug("watched", "season", season.title);
		return true;
	}

	public addEpisodes(
		newEpisodes: AnimeEpisode[],
		params?: { atIndex?: number },
	) {
		if (newEpisodes.length === 0) return;

		params ??= {};
		const atIndex = params.atIndex ?? this.episodes.length;

		this.episodes
			.filter((episode) => episode.episodeNumber > atIndex)
			.forEach((episode) =>
				episode.runWithoutUpdatingDb(
					() => (episode.episodeNumber += newEpisodes.length),
				),
			);

		newEpisodes = newEpisodes
			.sort((lhs, rhs) => {
				if (lhs.episodeNumber < rhs.episodeNumber) {
					return -1;
				}
				return 1;
			})
			.map((episode, index) => {
				return new AnimeEpisode({
					...episode,
					...{
						episodeNumber: index + atIndex,
						animeDbId: this.anime?.getAnimeDbId(),
						seasonInfo: { season: this, animeTitle: this.anime?.title },
					},
				});
			});

		this.runWithoutUpdatingDb(() => {
			this.episodes.splice(atIndex, 0, ...newEpisodes);
			this.episodes = [...this.episodes];
			this.watched = false;
			this.dateFinished = null;

			this.anime?.runWithoutUpdatingDb((anime) => {
				anime.dateFinished = null;
				anime.watched = false;
			});
		});

		this.anime?.saveToDb();
	}

	public removeEpisodeAtIndex(index: number) {
		this.episodes
			.filter((episode) => episode.episodeNumber > index)
			.forEach((episode) =>
				episode.runWithoutUpdatingDb(() => (episode.episodeNumber -= 1)),
			);

		this.runWithoutUpdatingDb(() => {
			this.episodes.splice(index, 1);
			this.episodes = [...this.episodes];
			if (this.checkWatchedAll()) {
				this.updateDate();

				this.anime?.runWithoutUpdatingDb((anime) => {
					anime.checkWatchedAll();
				});
			}
			if (this.episodes.length === 0) {
				this.dateStarted = null;
				this.dateFinished = null;
			}
		});

		this.anime?.saveToDb();
	}

	public updateDate() {
		const watchedEpisodes = this.episodes.filter(
			(episode) => episode.watched,
		).length;

		if (watchedEpisodes === 0) {
			return;
		}

		let updateAnimeDate = false;
		if (watchedEpisodes > 0 && !this.dateStarted) {
			this.dateStarted = new Date();
			updateAnimeDate = true;
		}
		if (watchedEpisodes === this.episodes.length && !this.dateFinished) {
			this.dateFinished = new Date();
			updateAnimeDate = true;
		}

		if (updateAnimeDate) {
			this.anime?.updateDate();
		}
	}

	public toIndexedDBObj() {
		const objCopy: { [key: string]: any } = {};
		for (const key in this) {
			if (Object.prototype.hasOwnProperty.call(this, key)) {
				if (key === "animeDbId" || key === "anime" || key === "pauseAutoSave")
					continue;

				if (key === "episodes") {
					const episodes = [];
					for (const episode of this[key] as AnimeEpisode[]) {
						episodes.push(episode.toIndexedDBObj());
					}
					objCopy[key] = episodes;
					continue;
				}

				objCopy[key] = this[key];
			}
		}
		return objCopy;
	}
}
