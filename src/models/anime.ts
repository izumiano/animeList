import LocalDB from "../indexedDb/indexedDb";
import AnimeEpisode from "./animeEpisode";
import AnimeSeason from "./animeSeason";
import { newExternalLink, type ExternalLink } from "./externalLink";

export const MediaTypeValues = [
	"tv",
	"movie",
	"ona",
	"ova",
	"tv_special",
	"special",
] as const;

export type MediaType = (typeof MediaTypeValues)[number];

export default class Anime {
	title: string;
	seasons: AnimeSeason[];
	watched: boolean;
	imageLink: string | null;
	externalLink: ExternalLink;
	order: number;

	justAdded: boolean;

	dateStarted: Date | null;
	dateFinished: Date | null;

	pauseAutoSave = false;

	get watching() {
		return (
			!this.watched &&
			this.seasons.some((season) => {
				return (
					season.watched || season.episodes.some((episode) => episode.watched)
				);
			})
		);
	}

	constructor(params: {
		title: string;
		seasons: AnimeSeason[];
		watched: boolean;
		imageLink: string | null | undefined;
		externalLink: ExternalLink;
		order: number;
		dateStarted: Date | number | null;
		dateFinished: Date | number | null;
		justAdded?: boolean;
		autoSave?: boolean;
	}) {
		this.title = params.title;
		this.watched = params.watched;
		this.imageLink = params.imageLink ?? null;
		this.externalLink = params.externalLink;
		this.order = params.order;

		this.dateStarted = !params.dateStarted
			? null
			: new Date(params.dateStarted);
		this.dateFinished = !params.dateFinished
			? null
			: new Date(params.dateFinished);

		this.justAdded = params.justAdded ?? true;

		this.seasons = params.seasons.map((season) => {
			return new AnimeSeason({
				...season,
				...{
					animeDbId: params.autoSave ? this.getAnimeDbId() : undefined,
					anime: this,
				},
			});
		});

		if (params.autoSave ?? false) {
			return new Proxy(this, {
				set: function (target: Anime, property: keyof Anime, value: any) {
					if (target[property] !== value) {
						Reflect.set(target, property, value);

						if (
							!target.pauseAutoSave &&
							property !== "justAdded" &&
							property !== "pauseAutoSave"
						) {
							console.debug(
								`Anime Property in '${params.title}' '${property}' changed from'`,
								target[property],
								"to",
								value,
							);
							target.saveToDb();
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

	public getAnimeDbId() {
		return Anime.getAnimeDbId(this.externalLink, this.title);
	}

	public getFirstSeasonNotWatched() {
		for (const season of this.seasons) {
			if (!season.watched) {
				return season;
			}
		}
		return this.seasons[0];
	}

	public addSeasons(
		newSeasons: AnimeSeason[],
		{ atIndex }: { atIndex: number },
	) {
		this.seasons
			.filter((season) => season.seasonNumber > atIndex)
			.forEach((season) =>
				season.runWithoutUpdatingDb(
					() => (season.seasonNumber += newSeasons.length),
				),
			);

		newSeasons = newSeasons
			.sort((lhs, rhs) => {
				if (lhs.seasonNumber < rhs.seasonNumber) {
					return -1;
				}
				return 1;
			})
			.map(
				(season, index) =>
					new AnimeSeason({
						...season,
						...{
							seasonNumber: index + atIndex + 1,
							animeDbId: this.getAnimeDbId(),
							anime: this,
						},
					}),
			);

		this.runWithoutUpdatingDb(() => {
			this.seasons.splice(atIndex, 0, ...newSeasons);
			this.seasons = [...this.seasons];
			this.watched = false;
			this.dateFinished = null;
		});

		this.saveToDb();
	}

	public updateDate() {
		const firstSeason = this.seasons.at(0);
		if (!this.dateStarted && firstSeason && firstSeason.dateStarted) {
			this.dateStarted = firstSeason.dateStarted;
		}
		const lastSeason = this.seasons.at(-1);
		if (!this.dateFinished && lastSeason && lastSeason.dateFinished) {
			this.dateFinished = lastSeason.dateFinished;
		}
	}

	public static getAnimeDbId(externalLink: ExternalLink, title: string) {
		return `${externalLink?.type ?? "NONE"}${externalLink?.id ?? title}`;
	}

	public static Load({
		animeData,
		justAdded,
		autoSave,
	}: {
		animeData: any;
		justAdded: boolean;
		autoSave?: boolean;
	}) {
		const seasons: AnimeSeason[] = [];
		const animeDbId = autoSave
			? this.getAnimeDbId(animeData.externalLink, animeData.title)
			: undefined;

		for (const season of animeData.seasons) {
			const seasonExternalLink = newExternalLink({
				type: season.externalLink?.type,
				id: season.externalLink?.id,
				seasonId: season.externalLink?.seasonId,
			});

			const episodes: AnimeEpisode[] = [];

			for (const episode of season.episodes) {
				episodes.push(
					new AnimeEpisode({
						animeDbId: animeDbId,
						title: episode.title,
						episodeNumber: episode.episodeNumber,
						watched: episode.watched,
					}),
				);
			}

			episodes.sort((lhs, rhs) => {
				if (lhs.episodeNumber > rhs.episodeNumber) {
					return 1;
				}
				return -1;
			});

			seasons.push(
				new AnimeSeason({
					animeDbId: animeDbId,
					title: season.title,
					episodes: episodes,
					watched: season.watched,
					seasonNumber: season.seasonNumber,
					mediaType: season.mediaType,
					externalLink: seasonExternalLink,
					dateStarted: season.dateStarted,
					dateFinished: season.dateFinished,
				}),
			);
		}

		seasons.sort((lhs, rhs) => {
			if (lhs.seasonNumber > rhs.seasonNumber) {
				return 1;
			}
			return -1;
		});

		return new Anime({
			title: animeData.title,
			seasons: seasons,
			watched: animeData.watched,
			imageLink: animeData.imageLink,
			externalLink: newExternalLink({
				type: animeData.externalLink?.type,
				id: animeData.externalLink?.id,
			}),
			order: animeData.order,
			dateStarted: animeData.dateStarted,
			dateFinished: animeData.dateFinished,
			justAdded: justAdded,
			autoSave: autoSave,
		});
	}

	public saveToDb() {
		const db = LocalDB.Instance;
		db?.doTransaction((store) => {
			return db.saveAnime(this, store);
		});
	}

	toIndexedDBObj() {
		const objCopy: { [key: string]: any } = {};
		for (const key in this) {
			if (Object.prototype.hasOwnProperty.call(this, key)) {
				if (key === "justAdded") {
					continue;
				}

				if (key === "seasons") {
					const seasons = [];
					for (const season of this[key] as AnimeSeason[]) {
						seasons.push(season.toIndexedDBObj());
					}
					objCopy[key] = seasons;
					continue;
				}

				objCopy[key] = this[key];
			}
		}
		return objCopy;
	}

	checkWatchedAll() {
		for (const season of this.seasons) {
			if (!season.checkWatchedAll()) {
				this.watched = false;
				return false;
			}
		}
		this.watched = true;
		return true;
	}
}
