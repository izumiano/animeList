import type TMDBErrorResponse from "../responses/tmdbErrorResponse";
import IErrorHandler from "./IErrorHandler";

export default class TMDBErrorHandler extends IErrorHandler<TMDBErrorResponse> {
	// biome-ignore lint/suspicious/noExplicitAny: <we dont know what data is>
	public isSuccess(data: any) {
		return data.success === true || !data.status_message || !data.status_code;
	}

	public getFailureMessage(_url: string, data: TMDBErrorResponse) {
		return (
			<span>
				{this.message}
				<hr></hr>
				<i>{data.status_message}</i>
			</span>
		);
	}
}
