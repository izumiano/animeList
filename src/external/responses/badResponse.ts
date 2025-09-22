import { IResponse, type IResponseDataType } from "./IResponse";

export default class BadResponse<T extends IResponseDataType>
  extends Error
  implements IResponse<T>
{
  displayMessage: string | React.ReactNode;
  statusCode: number | undefined;
  data: T;

  constructor(
    message: string | React.ReactNode,
    params?: { data?: any; statusCode?: number }
  ) {
    super(message?.toString());

    this.displayMessage = message;

    this.statusCode = params?.statusCode;
    this.data = params?.data;
  }
}
