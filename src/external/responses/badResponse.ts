import { IResponse, type IResponseData } from "./IResponse";

export default class BadResponse
  extends Error
  implements IResponse<BadResponseData>
{
  displayMessage: React.ReactNode;
  statusCode: number | undefined;
  data: BadResponseData | null;

  constructor(
    message: React.ReactNode,
    params?: { data?: unknown; statusCode?: number }
  ) {
    super(message?.toString());

    this.displayMessage = message;

    this.statusCode = params?.statusCode;
    this.data = params
      ? { data: params.data, statusCode: params.statusCode }
      : null;
  }
}

export interface BadResponseData extends IResponseData {
  data: unknown;
}
