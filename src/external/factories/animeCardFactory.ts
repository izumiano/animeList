import type Anime from "../../models/anime";
import type ExternalLink from "../../models/externalLink";
import MALCardFactory from "./malCardFactory";
import BadResponse from "../responses/badResponse";
import { showError } from "../../utils/utils";

export default class AnimeCardFactory {
  public static async create(params: {
    animeExternalLink: ExternalLink | undefined;
    order: number;
    getSequels: boolean;
    callback: (anime: Anime) => void;
  }) {
    let animes;
    switch (params.animeExternalLink?.type) {
      case "MAL":
        animes = await MALCardFactory.create({
          id: params.animeExternalLink.id,
          order: params.order,
          getSequels: params.getSequels,
        });
        break;
      case "TMDB":
      // TMDBCardFactory.Create(id: externalLink?.id, order: order, callback: callback)
      default:
        showError("Cannot construct new anime, missing external link");
        return;
    }

    if (animes instanceof BadResponse) {
      showError(animes);
      return;
    }

    params.callback(animes);
  }
}
