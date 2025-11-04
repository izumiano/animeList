import type TMDBErrorResponse from "../responses/tmdbErrorResponse";
import IErrorHandler from "./IErrorHandler";

export default class TMDBErrorHandler extends IErrorHandler<TMDBErrorResponse> {
	constructor(message?: React.ReactNode) {
		super(message);
	}

	public isSuccess(data: any) {
		return !data.status_message || !data.status_code || data.success == null;
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
