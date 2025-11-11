import type { IResponse } from "./IResponse";

export default interface TMDBAccountDetailsResponse extends IResponse<null> {
	id?: number;
	username?: string;
	avatar?: { tmdb?: { avatar_path?: string }; gravatar?: { hash?: string } };
}
