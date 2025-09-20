import AppData from "../appData";
import AnimeEpisode from "./animeEpisode";
import ExternalLink from "./externalLink";

export default class AnimeSeason {
  title: string;
  episodes: AnimeEpisode[];
  watched: boolean;
  seasonNumber: number;
  // mediaType : "ona",
  externalLink: ExternalLink | null;
  // "dateStarted" : 753062400,
  // "dateFinished" : 773452800,

  constructor(
    animeDbId: string,
    title: string,
    episodes: AnimeEpisode[],
    watched: boolean,
    seasonNumber: number,
    externalLink: ExternalLink | null
  ) {
    this.title = title;
    this.episodes = episodes;
    this.watched = watched;
    this.seasonNumber = seasonNumber;
    this.externalLink = externalLink;

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
