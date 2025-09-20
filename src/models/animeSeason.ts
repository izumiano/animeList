import AppData from "../appData";
import AnimeEpisode from "./animeEpisode";
import ExternalLink from "./externalLink";

type MediaType = "tv" | "movie" | "ona" | "ova" | "tv_special" | "special";

export default class AnimeSeason {
  title: string;
  episodes: AnimeEpisode[];
  watched: boolean;
  seasonNumber: number;
  mediaType: MediaType;
  externalLink: ExternalLink | null;
  dateStarted: Date | null;
  dateFinished: Date | null;

  constructor(
    animeDbId: string,
    title: string,
    episodes: AnimeEpisode[],
    watched: boolean,
    seasonNumber: number,
    mediaType: MediaType,
    externalLink: ExternalLink | null,
    dateStarted: Date | number | null,
    dateFinished: Date | number | null
  ) {
    this.title = title;
    this.episodes = episodes;
    this.watched = watched;
    this.seasonNumber = seasonNumber;
    this.mediaType = mediaType;
    this.externalLink = externalLink;

    this.dateStarted = !dateStarted ? null : new Date(dateStarted);
    this.dateFinished = !dateFinished ? null : new Date(dateFinished);

    return new Proxy(this, {
      set: function (
        target: AnimeSeason,
        property: keyof AnimeSeason,
        value: any
      ) {
        if (target[property] !== value) {
          console.debug(
            `AnimeSeason Property in '${title}' '${property}' changed from'`,
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

  public checkWatchedAll(season: AnimeSeason | null = null) {
    season ??= this;

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

  public toIndexedDBObj() {
    const objCopy: { [key: string]: any } = {};
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        if (key === "animeDbId") continue;

        if (key === "episodes") {
          const episodes = [];
          for (const episode of this[key] as AnimeEpisode[]) {
            episodes.push(episode.toIndexedDBObj());
          }
          objCopy[key] = episodes;
          continue;
        }
        if (key === "externalLink") {
          objCopy[key] = this.externalLink?.toIndexedDBObj();
          continue;
        }

        objCopy[key] = this[key];
      }
    }
    return objCopy;
  }
}
