import { MediaTypeValues, type MediaType } from "../../models/anime";
import type { ExternalLinkType } from "../../models/externalLink";
import ExternalLink from "../../models/externalLink";
import type { MALSeasonDetails } from "./MALSeasonDetails";

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
    synopsis: string | undefined;
    id: number | undefined;
    externalLinkType: ExternalLinkType | undefined;
    approved: boolean | undefined;
    images: SeasonImages | undefined;
    popularity: number | undefined;
    title_english: string | undefined;
    title: string | undefined;
    episodes: number | undefined;
    status: string | undefined;
    media_type: string | undefined;
    started_date: Date | undefined;
  }) {
    this.synopsis = params.synopsis;

    this.approved = params.approved;
    this.images = params.images;
    this.popularity = params.popularity;
    this.title = this.getTitle(params.title, params.title_english);
    this.episodeCount = params.episodes;
    this.status = params.status;
    this.mediaType = this.getTypeName(params.media_type);
    this.airedDate = params.started_date;

    if (params.id && params.externalLinkType) {
      this.externalLink = new ExternalLink({
        id: params.id,
        animeDbId: "",
        type: params.externalLinkType,
      });
    }
  }

  private getTypeName(type: string | undefined): MediaType | undefined {
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

  private getTitle(
    title: string | undefined,
    title_english: string | undefined
  ) {
    if (title_english) {
      return title_english;
    }

    return title;
  }

  public static create(malSeasonDetails: MALSeasonDetails) {
    return new SeasonDetails({
      synopsis: malSeasonDetails.synopsis,
      id: malSeasonDetails.mal_id,
      externalLinkType: "MAL",
      approved: malSeasonDetails.approved,
      images: malSeasonDetails.images,
      popularity: malSeasonDetails.popularity,
      title_english: malSeasonDetails.title_english,
      title: malSeasonDetails.title,
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
