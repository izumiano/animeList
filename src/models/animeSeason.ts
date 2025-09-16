import type AnimeEpisode from "./animeEpisode";
import type ExternalLink from "./externalLink";

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
  }
}
