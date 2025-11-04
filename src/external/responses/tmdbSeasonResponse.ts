import type { IResponse } from "./IResponse";

export default interface TMDBSeasonResponse extends IResponse<null> {
	id?: number;
	name?: string;
	original_name?: string;
	poster_path?: string;
	episodes?: TMDBEpisode[];
	overview?: string;
	popularity?: number;
	first_air_date?: string;
	season_number?: number;
}

interface TMDBEpisode {
	name?: string;
	episode_number?: number;
}
