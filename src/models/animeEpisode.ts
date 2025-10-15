import AppData from "../appData";
import ExternalSync from "../external/externalSync";
import type AnimeSeason from "./animeSeason";

export default class AnimeEpisode {
	title: string;
	episodeNumber: number;
	watched: boolean;

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
						console.debug(
							`AnimeEpisode Property in '${title}' '${property}' changed from'`,
							target[property],
							"to",
							value,
						);
						Reflect.set(target, property, value);
						AppData.animes.get(animeDbId!)?.saveToDb();

						if (property === "watched" && seasonInfo) {
							seasonInfo.season.updateDate();
							ExternalSync.updateAnimeSeasonStatus(
								seasonInfo.season,
								seasonInfo.animeTitle,
							);
						}
					}
					return true;
				},
			});
		}
	}

	toIndexedDBObj() {
		const objCopy: { [key: string]: any } = {};
		for (const key in this) {
			if (Object.prototype.hasOwnProperty.call(this, key)) {
				if (key === "animeDbId") continue;

				objCopy[key] = this[key];
			}
		}
		return objCopy;
	}
}
