import type ExternalLink from "../../models/externalLink";
import MALCardFactory from "./malCardFactory";
import BadResponse from "../responses/badResponse";

export default class AnimeCardFactory {
  public static create(params: {
    animeExternalLink: ExternalLink | undefined;
    order: number;
    getSequels: boolean;
  }) {
    switch (params.animeExternalLink?.type) {
      case "MAL":
        return MALCardFactory.create({
          id: params.animeExternalLink.id,
          order: params.order,
          getSequels: params.getSequels,
        });
      // case "TMDB":
      // return TMDBCardFactory.create(id: externalLink?.id, order: order, callback: callback)
      default:
        return new BadResponse(
          `Cannot construct new anime, invalid external link type ${params.animeExternalLink?.type}`
        );
    }
  }
}
