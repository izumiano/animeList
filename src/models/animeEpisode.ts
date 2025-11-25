import AppData from "../appData";
import ExternalSync from "../external/externalSync";
import type Anime from "./anime";
import type AnimeSeason from "./animeSeason";

export default class AnimeEpisode {
	title: string;
	episodeNumber: number;
	watched: boolean;

	pauseAutoSave = false;

	constructor({
		animeDbId,
		title,
		episodeNumber,
		watched,
		seasonInfo,
	}: {
		animeDbId?: string;
		title: string;
		episodeNumber: number;
		watched: boolean;
		seasonInfo?: { season: AnimeSeason; anime: Anime | undefined };
	}) {
		this.title = title;
		this.episodeNumber = episodeNumber;
		this.watched = watched;

		if (animeDbId) {
			return new Proxy(this, {
				set: (
					target: AnimeEpisode,
					property: keyof AnimeEpisode,
					value: unknown,
				) => {
					if (target[property] !== value) {
						const prevValue = target[property];
						Reflect.set(target, property, value);
						if (!target.pauseAutoSave && property !== "pauseAutoSave") {
							console.debug(
								`AnimeEpisode Property in '${title}' '${property}' changed from'`,
								prevValue,
								"to",
								value,
							);
							AppData.animes.get(animeDbId)?.saveToDb();

							if (property === "watched" && seasonInfo) {
								seasonInfo.season.updateDate();

								if (seasonInfo.season.externalLink.type === "MAL") {
									ExternalSync.updateSeasonStatus(
										seasonInfo.season,
										seasonInfo.anime,
									).then((task) => {
										if (task.failed) {
											task.showError();
										}
									});
								}
							}
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

	toIndexedDBObj() {
		const objCopy: { [key: string]: unknown } = {};
		for (const key in this) {
			if (Object.hasOwn(this, key)) {
				if (key === "animeDbId" || key === "pauseAutoSave") continue;

				objCopy[key] = this[key];
			}
		}
		return objCopy;
	}
}
