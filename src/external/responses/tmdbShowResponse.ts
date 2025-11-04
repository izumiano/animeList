import type { IResponse } from "./IResponse";
import type TMDBSeasonResponse from "./tmdbSeasonResponse";

export default interface TMDBShowResponse extends IResponse<null> {
	statusCode: number;

	name?: string;
	poster_path?: string;
	overview?: string;
	seasons?: TMDBSeasonResponse[];
	airedDate?: string;
}
