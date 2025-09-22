import React from "react";

export default class IErrorHandler<TError> {
  public isSuccess(data: any, acceptStatusCodes: number[]) {
    return true;
  }

  public getFailureMessage(url: string, data: TError): React.ReactNode {
    return null;
  }
}
