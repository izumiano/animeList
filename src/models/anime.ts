import type AnimeSeason from "./animeSeason";
import type ExternalLink from "./externalLink";

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
  }
}

export default Anime;
