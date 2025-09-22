import type { IResponseData } from "./IResponse";
import type { SeasonImages } from "./SearchResponse";

export class MALSeasonDetails implements IResponseData {
  statusCode: number | undefined;
  synopsis?: string;
  mal_id?: number;
  approved?: boolean;
  images?: SeasonImages;
  popularity?: number;
  title_english?: string;
  title?: string;
  episodes?: number;
  status?: string;
  relations?: SeasonRelation[];
  type?: string;
  aired?: { from: Date };
}

interface SeasonRelation {
  relation?: string;
  entry?: MALSeasonDetails[];
}
