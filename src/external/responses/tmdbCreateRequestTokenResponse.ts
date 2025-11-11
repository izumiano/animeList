import type { IResponse } from "./IResponse";

export default interface TMDBCreateRequestTokenResponse
	extends IResponse<null> {
	expires_at?: string;
	request_token?: string;
	success?: boolean;
}
