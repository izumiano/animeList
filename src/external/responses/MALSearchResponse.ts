import type { IResponse } from "./IResponse";
import type { MALSeasonDetails } from "./MALSeasonDetails";

export default interface MALSearchResponse extends IResponse<null> {
	results: MALSeasonDetails[];
}
