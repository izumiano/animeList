import AppData from "../appData";

export default class AnimeEpisode {
  title: string;
  episodeNumber: number;
  watched: boolean;

  constructor(
    animeDbId: string,
    title: string,
    episodeNumber: number,
    watched: boolean
  ) {
    this.title = title;
    this.episodeNumber = episodeNumber;
    this.watched = watched;

    return new Proxy(this, {
      set: function (
        target: AnimeEpisode,
        property: keyof AnimeEpisode,
        value: any
      ) {
        if (target[property] !== value) {
          console.debug(
            `AnimeEpisode Property in '${title}' '${property}' changed from'`,
            target[property],
            "to",
            value
          );
          Reflect.set(target, property, value);
          AppData.animes.get(animeDbId)?.saveToDb();
        }
        return true;
      },
    });
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
