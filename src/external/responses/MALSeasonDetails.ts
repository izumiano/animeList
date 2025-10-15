import type { MediaType } from "../../models/anime";
import type { IResponseData } from "./IResponse";
import type { SeasonImages } from "./SeasonDetails";

export class MALSeasonDetails implements IResponseData {
	statusCode: number | undefined;
	synopsis?: string;
	mal_id?: number;
	id?: number;
	approved?: boolean;
	images?: SeasonImages;
	popularity?: number;
	title_english?: string;
	title?: string;
	episodes?: number;
	status?: string;
	relations?: SeasonRelation[];
	type?: MediaType;
	aired?: { from: Date };
	start_date?: string;
}

interface SeasonRelation {
	relation?: string;
	entry?: MALSeasonDetails[];
}
