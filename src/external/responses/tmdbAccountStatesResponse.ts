import type { IResponse } from "./IResponse";

export default interface TMDBAccountStatesResponse extends IResponse<null> {
	favorite?: false;
	id?: number;
	rated?: boolean;
	watchlist?: boolean;
}
