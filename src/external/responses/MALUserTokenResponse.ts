import { IResponse } from "./IResponse";

export default class MALUserTokenResponse extends IResponse<null> {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}
