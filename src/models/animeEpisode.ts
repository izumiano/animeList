import AppData from "../appData";
import ExternalSync from "../external/externalSync";
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
		seasonInfo?: { season: AnimeSeason; animeTitle?: string };
	}) {
		this.title = title;
		this.episodeNumber = episodeNumber;
		this.watched = watched;

		if (animeDbId) {
			return new Proxy(this, {
				set: function (
					target: AnimeEpisode,
					property: keyof AnimeEpisode,
					value: any,
				) {
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
							AppData.animes.get(animeDbId!)?.saveToDb();

							if (property === "watched" && seasonInfo) {
								seasonInfo.season.updateDate();
								ExternalSync.updateAnimeSeasonStatus(
									seasonInfo.season,
									seasonInfo.animeTitle,
								);
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
		const objCopy: { [key: string]: any } = {};
		for (const key in this) {
			if (Object.prototype.hasOwnProperty.call(this, key)) {
				if (key === "animeDbId" || key === "pauseAutoSave") continue;

				objCopy[key] = this[key];
			}
		}
		return objCopy;
	}
}
