import { Fragment, type ReactNode } from "react";
import { SeasonDetails } from "../external/responses/SeasonDetails";
import LocalDB from "../indexedDb/indexedDb";
import AnimeEpisode from "./animeEpisode";
import AnimeSeason from "./animeSeason";
import {
	externalLinkId,
	newExternalLink,
	type ExternalLink,
} from "./externalLink";
import { v4 as uuid } from "uuid";

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

	public runWithoutUpdatingDb(action: (anime: Anime) => void) {
		this.pauseAutoSave = true;
		action(this);
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
		return this.seasons.at(0);
	}

	public addSeasons(newSeasons: AnimeSeason[], params?: { atIndex?: number }) {
		if (newSeasons.length === 0) return;

		params ??= {};
		const atIndex = params.atIndex ?? this.seasons.length;

		this.seasons
			.filter((season) => season.seasonNumber > atIndex)
			.forEach((season) =>
				season.runWithoutUpdatingDb(
					() => (season.seasonNumber += newSeasons.length),
				),
			);

		let minSeasonNumber = 1;
		newSeasons = newSeasons
			.sort((lhs, rhs) => {
				if (lhs.seasonNumber < rhs.seasonNumber) {
					return -1;
				}
				return 1;
			})
			.map((season, index) => {
				let seasonTitle = season.title;
				const inferredSeasonNumberInfo =
					SeasonDetails.getInferredSeasonNumberInfo({
						title: season.title,
						animeTitle: this.title,
						minSeasonNumber: minSeasonNumber,
					});
				const inferredSeasonNumber = inferredSeasonNumberInfo.seasonNumber;

				if (inferredSeasonNumber != null) {
					minSeasonNumber = inferredSeasonNumber;
				}
				seasonTitle = inferredSeasonNumberInfo.title ?? seasonTitle;
				return new AnimeSeason({
					...season,
					...{
						title: seasonTitle,
						seasonNumber: index + atIndex + 1,
						animeDbId: this.getAnimeDbId(),
						anime: this,
					},
				});
			});

		this.runWithoutUpdatingDb(() => {
			this.seasons.splice(atIndex, 0, ...newSeasons);
			this.seasons = [...this.seasons];
			this.watched = false;
			this.dateFinished = null;
		});

		this.saveToDb();
	}

	public removeSeasonAtIndex(index: number) {
		this.seasons
			.filter((season) => season.seasonNumber > index + 1)
			.forEach((season) =>
				season.runWithoutUpdatingDb(() => (season.seasonNumber -= 1)),
			);

		this.runWithoutUpdatingDb(() => {
			this.seasons.splice(index, 1);
			this.seasons = [...this.seasons];
			if (this.checkWatchedAll()) {
				this.updateDate();
			}
			if (this.seasons.length === 0) {
				this.dateStarted = null;
				this.dateFinished = null;
			}
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
		return externalLinkId(externalLink, title);
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
		const validatationResult = validate(animeData);

		if (!validatationResult.valid) {
			return validatationResult;
		}

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
		if (this.seasons.length === 0) {
			this.watched = false;
			return false;
		}

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

function validate(
	animeData: any,
): { valid: true } | { valid: false; error: ReactNode } {
	const errors: {
		hasError: boolean;
		anime: ReactNode[];
		seasons: {
			title?: string | number;
			errors: ReactNode[];
			episodes: { title?: string | number; errors: ReactNode[] }[];
		}[];
	} = {
		hasError: false,
		anime: [],
		seasons: [],
	};

	let animeTitle = animeData.title as string | undefined;
	if (!animeData.title) {
		const externalLink = animeData?.externalLink as ExternalLink | undefined;
		if (externalLink) {
			animeTitle = `${externalLink.type}${externalLink.id}`;
		}
		errors.hasError = true;
		errors.anime.push(
			<span>
				Missing{" "}
				<b>
					<i>"title"</i>
				</b>{" "}
			</span>,
		);
	}

	if (!animeData.seasons) {
		errors.hasError = true;
		errors.anime.push(
			<span>
				Missing{" "}
				<b>
					<i>"seasons"</i>
				</b>{" "}
			</span>,
		);
	}

	const seasons = animeData.seasons as Array<any> | undefined;
	for (const season of seasons ?? []) {
		const seasonErrors = [];
		let seasonTitle = season.title as string | number | undefined;

		if (!season.title) {
			errors.hasError = true;
			seasonErrors.push(
				<span>
					Missing{" "}
					<b>
						<i>"title"</i>
					</b>{" "}
				</span>,
			);
			seasonTitle = season.seasonNumber;
		}

		if (!season.seasonNumber) {
			errors.hasError = true;
			seasonErrors.push(
				<span>
					Missing{" "}
					<b>
						<i>"seasonNumber"</i>
					</b>{" "}
				</span>,
			);

			const externalLink = animeData.externalLink as ExternalLink;
			seasonTitle ??= externalLink
				? `${externalLink.type}${externalLink.id}${externalLink.type === "TMDB" ? `_${externalLink.seasonId}` : ""}`
				: undefined;
		}

		const seasonData = {
			title: seasonTitle,
			errors: seasonErrors,
			episodes: [] as { title?: string | number; errors: ReactNode[] }[],
		};

		if (!season.episodes) {
			errors.hasError = true;
			seasonErrors.push(
				<span>
					Missing{" "}
					<b>
						<i>"episodes"</i>
					</b>
				</span>,
			);
		}

		const episodes = season.episodes as Array<any> | undefined;
		for (const episode of episodes ?? []) {
			const episodeErrors: ReactNode[] = [];

			let episodeTitle = episode.title as string | number | undefined;

			if (!episode.title) {
				errors.hasError = true;
				episodeErrors.push(
					<span>
						Missing{" "}
						<b>
							<i>"title"</i>
						</b>{" "}
					</span>,
				);

				episodeTitle = episode.episodeNumber;
			}

			if (episode.episodeNumber == null) {
				errors.hasError = true;
				episodeErrors.push(
					<span>
						Missing{" "}
						<b>
							<i>"episodeNumber"</i>
						</b>{" "}
					</span>,
				);
			}

			if (episodeErrors.length > 0) {
				seasonData.episodes.push({
					title: episodeTitle,
					errors: episodeErrors,
				});
			}
		}

		if (seasonData.errors.length > 0 || seasonData.episodes.length > 0) {
			errors.seasons.push(seasonData);
		}
	}

	if (errors.hasError) {
		return {
			valid: false,
			error: (
				<span>
					<b>Anime: {animeTitle}</b>
					<div className="indentRoot flexColumn">
						{errors.anime.map((error) => (
							<Fragment key={uuid()}>{error}</Fragment>
						))}
						{errors.seasons.map((season) => (
							<span key={uuid()} className="flexColumn">
								<b>Season: {season.title}</b>
								<div className="indent flexColumn">
									{season.errors.map((error) => (
										<Fragment key={uuid()}>{error}</Fragment>
									))}
									{season.episodes.map((episode) => (
										<Fragment key={uuid()}>
											<b>Episode: {episode.title}</b>
											<div className="indent">
												{episode.errors.map((error) => (
													<Fragment key={uuid()}>{error}</Fragment>
												))}
											</div>
										</Fragment>
									))}
								</div>
							</span>
						))}
					</div>
				</span>
			),
		};
	}

	return { valid: true };
}
