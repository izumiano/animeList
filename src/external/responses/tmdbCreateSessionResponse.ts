import type { IResponse } from "./IResponse";

export default interface TMDBCreateSessionResponse extends IResponse<null> {
	success?: boolean;
	session_id?: string;
}
