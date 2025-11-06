import type { IResponse } from "./IResponse";
import type TMDBSeasonResponse from "./tmdbSeasonResponse";

export default interface TMDBShowResponse extends IResponse<null> {
	statusCode: number;

	name?: string;
	original_name?: string;
	title?: string;
	original_title?: string;
	poster_path?: string;
	overview?: string;
	seasons?: TMDBSeasonResponse[];
	airedDate?: string;
	release_date?: string;
}
