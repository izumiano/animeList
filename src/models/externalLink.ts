export type ExternalLinkType = "MAL" | "TMDB";

export default class ExternalLink {
  id: number;
  type: ExternalLinkType;

  constructor(id: number, type: ExternalLinkType) {
    this.id = id;
    this.type = type;
  }
}
