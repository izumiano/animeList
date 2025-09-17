import LocalDB from "../localDb/localDb";
import AnimeEpisode from "./animeEpisode";
import AnimeSeason from "./animeSeason";
import ExternalLink, { type ExternalLinkType } from "./externalLink";

class Anime {
  title: string;
  seasons: AnimeSeason[];
  watched: boolean;
  imageLink: string | null;
  externalLink: ExternalLink | null;
  order: number;

  // var dateStarted: Date?
  // var dateStartedSet = false
  // var dateFinished: Date?
  // var dateFinishedSet = false

  constructor(
    title: string,
    seasons: AnimeSeason[],
    watched: boolean,
    imageLink: string | null,
    externalLink: ExternalLink | null,
    order: number
  ) {
    this.title = title;
    this.seasons = seasons;
    this.watched = watched;
    this.imageLink = imageLink;
    this.externalLink = externalLink;
    this.order = order;

    return new Proxy(this, {
      set: function (target: Anime, property: keyof Anime, value: any) {
        if (target[property] !== value) {
          console.debug(
            `Anime Property in '${title}' '${property}' changed from'`,
            target[property],
            "to",
            value
          );
          Reflect.set(target, property, value);
          target.saveToDb();
        }
        return true;
      },
    });
  }

  public getAnimeDbId() {
    return `${this.externalLink?.type ?? "NONE"}${
      this.externalLink?.id ?? this.title
    }`;
  }

  public static getAnimeDbId(
    externalLinkType: ExternalLinkType | null,
    externalLinkId: number | null,
    title: string
  ) {
    return `${externalLinkType ?? "NONE"}${externalLinkId ?? title}`;
  }

  public static Load(animeData: any) {
    const seasons: AnimeSeason[] = [];
    const animeDbId = this.getAnimeDbId(
      animeData.externalLink ? animeData.externalLink.type : null,
      animeData.externalLink ? animeData.externalLink.id : null,
      animeData.title
    );

    for (const season of animeData.seasons) {
      const episodes: AnimeEpisode[] = [];

      for (const episode of season.episodes) {
        episodes.push(
          new AnimeEpisode(
            animeDbId,
            episode.title,
            episode.episodeNumber,
            episode.watched
          )
        );
      }

      episodes.sort((lhs, rhs) => {
        if (lhs.episodeNumber > rhs.episodeNumber) {
          return 1;
        }
        return -1;
      });

      seasons.push(
        new AnimeSeason(
          animeDbId,
          season.title,
          episodes,
          season.watched,
          season.seasonNumber,
          season.externalLink
            ? new ExternalLink(
                animeDbId,
                season.externalLink.id,
                season.externalLink.type
              )
            : null
        )
      );
    }

    seasons.sort((lhs, rhs) => {
      if (lhs.seasonNumber > rhs.seasonNumber) {
        return 1;
      }
      return -1;
    });

    return new Anime(
      animeData.title,
      seasons,
      animeData.watched,
      animeData.imageLink,
      animeData.externalLink
        ? new ExternalLink(
            animeDbId,
            animeData.externalLink.id,
            animeData.externalLink.type
          )
        : null,
      animeData.order
    );
  }

  public saveToDb() {
    const db = LocalDB.Instance;
    db?.doTransaction((store) => {
      db.saveAnime(this, store);
    });
  }

  toIndexedDBObj() {
    const objCopy: { [key: string]: any } = {};
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        if (key === "seasons") {
          const seasons = [];
          for (const season of this[key] as AnimeSeason[]) {
            seasons.push(season.toIndexedDBObj());
          }
          objCopy[key] = seasons;
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

export default Anime;
