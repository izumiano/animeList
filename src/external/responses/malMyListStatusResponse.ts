import { IResponse, type IResponseData } from "./IResponse";

export default interface MALMyListStatusResponse
	extends IResponse<MALMyListStatus> {
	my_list_status?: MALMyListStatus;
}

export interface MALMyListStatus extends IResponseData {
	start_date?: string;
	finish_date?: string;
}
