import type { IResponse } from "./IResponse";
import type TMDBSeasonResponse from "./tmdbSeasonResponse";

export default interface TMDBSearchResponse extends IResponse<null> {
	results?: TMDBSeasonResponse[];
}
