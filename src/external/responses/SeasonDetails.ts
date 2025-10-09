import { MediaTypeValues, type MediaType } from "../../models/anime";
import type { ExternalLink } from "../../models/externalLink";
import { MALSeasonDetails } from "./MALSeasonDetails";

export type MALSeasonDetailsRequireId = Omit<MALSeasonDetails, "mal_id"> & {
  mal_id: number;
};

export class SeasonDetails {
  externalLink?: ExternalLink;
  synopsis?: string;
  approved?: boolean;
  images?: SeasonImages;
  popularity?: number;
  title?: string;
  episodeCount?: number;
  status?: string;
  mediaType?: MediaType;
  airedDate?: Date;

  constructor(params: {
    synopsis?: string;
    externalLink?: ExternalLink;
    approved?: boolean;
    images?: SeasonImages;
    popularity?: number;
    title?: string;
    episodes?: number;
    status?: string;
    media_type?: string;
    started_date?: Date;
  }) {
    this.synopsis = params.synopsis;

    this.approved = params.approved;
    this.images = params.images;
    this.popularity = params.popularity;
    this.title = params.title;
    this.episodeCount = params.episodes;
    this.status = params.status;
    this.mediaType = SeasonDetails.getTypeName(params.media_type);
    this.airedDate = params.started_date;

    this.externalLink = params.externalLink;
    // if (params.id && params.externalLinkType) {
    //   this.externalLink = new ExternalLink({
    //     id: params.id,
    //     animeDbId: "",
    //     type: params.externalLinkType,
    //   });
    // }
  }

  public static getTypeName(
    type: string | undefined | MediaType
  ): MediaType | undefined {
    if (!type) {
      return undefined;
    }
    if (type === "anime") {
      return "tv";
    }

    const title = type.toLowerCase().replaceAll(" ", "_") as MediaType;
    if (!MediaTypeValues.includes(title)) {
      return undefined;
    }
    return title;
  }

  public static getTitle({
    title_english,
    title,
  }: {
    title_english: string | undefined;
    title: string | undefined;
  }) {
    if (title_english) {
      return title_english;
    }

    return title;
  }

  public static create(
    malSeasonDetails: Omit<MALSeasonDetailsRequireId, "statusCode">
  ) {
    return new SeasonDetails({
      synopsis: malSeasonDetails.synopsis,
      externalLink: { type: "MAL", id: malSeasonDetails.mal_id },
      approved: malSeasonDetails.approved,
      images: malSeasonDetails.images,
      popularity: malSeasonDetails.popularity,
      title: SeasonDetails.getTitle({
        title_english: malSeasonDetails.title_english,
        title: malSeasonDetails.title,
      }),
      episodes: malSeasonDetails.episodes,
      status: malSeasonDetails.status,
      media_type: malSeasonDetails.type,
      started_date: malSeasonDetails.aired?.from,
    });
  }
}

export interface SeasonImages {
  jpg?: ImageSizes;
}

export interface ImageSizes {
  image_url?: string;
  large_image_url?: string;
}
