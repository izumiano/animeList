import type { IResponse, IResponseData } from "./IResponse";

export default interface EpisodesResponse extends IResponse<null> {
	episodes: EpisodeDetails[];
	lastVisiblePage?: number;
}

export interface EpisodeDetails extends IResponseData {
	episodeNumber: number;
	title?: string;
}
