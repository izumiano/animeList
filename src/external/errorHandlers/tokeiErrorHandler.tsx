import IErrorHandler from "./IErrorHandler";
import type TokeiErrorResponse from "../responses/tokeiErrorResponse";

export default class TokeiErrorHandler extends IErrorHandler<TokeiErrorResponse> {
	// biome-ignore lint/suspicious/noExplicitAny: <we dont know what data is>
	public isSuccess(data: any, _acceptStatusCodes: number[]) {
		return data.ok;
	}

	public getFailureMessage(_url: string, data: TokeiErrorResponse) {
		return (
			<span>
				{this.message}
				<hr></hr>
				<i>{data.message}</i>
			</span>
		);
	}
}
