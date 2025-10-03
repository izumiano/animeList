import { dialogifyKey } from "../../utils/utils";
import type MalErrorResponse from "../responses/malErrorResponse";
import IErrorHandler from "./IErrorHandler";

export default class MalErrorHandler extends IErrorHandler<MalErrorResponse> {
  message: React.ReactNode;

  constructor(message: React.ReactNode) {
    super();
    this.message = message;
  }

  public isSuccess(data: any) {
    return !data.error;
  }

  public getFailureMessage(_url: string, data: MalErrorResponse) {
    console.log(data);
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
