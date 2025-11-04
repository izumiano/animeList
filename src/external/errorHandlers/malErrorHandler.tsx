import { dialogifyKey } from "../../utils/utils";
import type MalErrorResponse from "../responses/malErrorResponse";
import IErrorHandler from "./IErrorHandler";

export default class MalErrorHandler extends IErrorHandler<MalErrorResponse> {
	constructor(message?: React.ReactNode) {
		super(message);
	}

	public isSuccess(data: any) {
		return !data.error;
	}

	public getFailureMessage(_url: string, data: MalErrorResponse) {
		return (
			<span>
				{this.message}
				<hr></hr>
				<i>
					<b>{dialogifyKey(data.error)}</b>
				</i>
				<br></br>
				<i>{data.hint ?? data.message}</i>
			</span>
		);
	}
}
