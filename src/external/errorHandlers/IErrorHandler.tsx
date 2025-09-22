import React from "react";

export default class IErrorHandler<TError> {
  public isSuccess(_data: any, _acceptStatusCodes: number[]) {
    return true;
  }

  public getFailureMessage(_url: string, _data: TError): React.ReactNode {
    return null;
  }
}
