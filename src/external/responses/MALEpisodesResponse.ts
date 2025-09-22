import type { IResponse, IResponseData } from "./IResponse";

export default interface EpisodesResponse extends IResponse<EpisodeDetails[]> {
  pagination?: { last_visible_page?: number };
}

export interface EpisodeDetails extends IResponseData {
  mal_id: number;
  title: string;
}
