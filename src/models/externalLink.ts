export type ExternalLinkType = "MAL" | "TMDB" | undefined;

export type ExternalLink = { type: ExternalLinkType } & (
  | { type: "MAL"; id: number }
  | { type: "TMDB"; id: number; seasonId?: number }
  | { type: undefined; id?: undefined }
);

export function newExternalLink(
  params: ExternalLink | undefined
): ExternalLink {
  switch (params?.type) {
    case "MAL":
      return { type: "MAL", id: params.id };
    case "TMDB":
      return { type: "TMDB", id: params.id, seasonId: params.seasonId };
    default:
      return { type: undefined };
  }
}
