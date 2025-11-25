import { v4 as uuid } from "uuid";
import type JikanErrorResponse from "../responses/jikanErrorResponse";
import IErrorHandler from "./IErrorHandler";

export default class JikanErrorHandler extends IErrorHandler<JikanErrorResponse> {
	// biome-ignore lint/suspicious/noExplicitAny: <we dont know what data is>
	public isSuccess(data: any, acceptStatusCodes: number[]) {
		if (!data.status) return true;
		return acceptStatusCodes.includes(parseInt(data.status));
	}

	public getFailureMessage(_url: string, data: JikanErrorResponse) {
		return (
			<span>
				{this.message}
				<hr></hr>
				<i>
					<b>{data.type}</b>
				</i>
				<br></br>
				<i>{this.parseMessages(data)}</i>
			</span>
		);
	}

	private parseMessages(data: JikanErrorResponse) {
		return (
			data.message ??
			Object.keys(data.messages ?? {})
				.map((key) => {
					return (
						<span key={uuid()} className="flexRow">
							<b>{key}:</b>
							<div>
								{data.messages?.[key]
									.map((message) => <>{message}</>)
									.reduce((prev, curr) => {
										return (
											<>
												{prev}
												<br></br>
												{curr}
											</>
										);
									})}
							</div>
						</span>
					);
				})
				.reduce((prev, curr) => {
					return (
						<>
							{prev}
							<br></br>
							{curr}
						</>
					);
				})
		);
	}
}
