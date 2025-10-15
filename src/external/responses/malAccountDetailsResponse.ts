import type { IResponse } from "./IResponse";

export default interface MalAccountDetailsResponse extends IResponse<null> {
	id: number;
	name: string;
}
