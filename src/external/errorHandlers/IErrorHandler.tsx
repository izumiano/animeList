import React, { type ReactNode } from "react";

export default class IErrorHandler<TError> {
	message: ReactNode;

	constructor(message: ReactNode) {
		this.message = typeof message === "string" ? <b>{message}</b> : message;
	}

	public isSuccess(_data: any, _acceptStatusCodes: number[]) {
		return true;
	}

	public getFailureMessage(_url: string, _data: TError): React.ReactNode {
		return null;
	}
}
