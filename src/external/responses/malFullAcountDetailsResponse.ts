import { IResponse, type IResponseData } from "./IResponse";

export default class MalFullAccountDetailsResponse extends IResponse<FullAcountDetailsData> {}

interface FullAcountDetailsData extends IResponseData {
	images: { jpg: { image_url: string } };
}
