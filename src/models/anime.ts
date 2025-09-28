import LocalDB from "../indexedDb/indexedDb";
import AnimeEpisode from "./animeEpisode";
import AnimeSeason from "./animeSeason";
import ExternalLink, { type ExternalLinkType } from "./externalLink";

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
  externalLink: ExternalLink | null;
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
    externalLink: ExternalLink | null;
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
        ...{ animeDbId: params.autoSave ? this.getAnimeDbId() : undefined },
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
                value
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
    return Anime.getAnimeDbId(
      this.externalLink?.type,
      this.externalLink?.id,
      this.title
    );
  }

  public getFirstSeasonNotWatched() {
    for (const season of this.seasons) {
      if (!season.watched) {
        return season;
      }
    }
    return this.seasons[0];
  }

  public static getAnimeDbId(
    externalLinkType: ExternalLinkType | null | undefined,
    externalLinkId: number | null | undefined,
    title: string
  ) {
    return `${externalLinkType ?? "NONE"}${externalLinkId ?? title}`;
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
      ? this.getAnimeDbId(
          animeData.externalLink ? animeData.externalLink.type : null,
          animeData.externalLink ? animeData.externalLink.id : null,
          animeData.title
        )
      : undefined;

    for (const season of animeData.seasons) {
      const episodes: AnimeEpisode[] = [];

      for (const episode of season.episodes) {
        episodes.push(
          new AnimeEpisode({
            animeDbId: animeDbId,
            title: episode.title,
            episodeNumber: episode.episodeNumber,
            watched: episode.watched,
          })
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
          externalLink: season.externalLink
            ? new ExternalLink({
                animeDbId: animeDbId,
                id: season.externalLink.id,
                type: season.externalLink.type,
              })
            : null,
          dateStarted: season.dateStarted,
          dateFinished: season.dateFinished,
        })
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
      externalLink: animeData.externalLink
        ? new ExternalLink({
            animeDbId: animeDbId,
            id: animeData.externalLink.id,
            type: animeData.externalLink.type,
          })
        : null,
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
