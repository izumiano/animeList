import BadResponse from "../external/responses/badResponse";
import type {
  IResponse,
  IResponseDataType,
} from "../external/responses/IResponse";
import { sleepFor } from "./utils";

const MAX_RATELIMIT_ITERATIONS = 40;

export default class WebUtil {
  public static async get<
    TData extends IResponseDataType,
    TReturn extends IResponse<TData>
  >(url: string) {
    try {
      const response = await fetch(url);
      const ret: TReturn = await response.json();
      ret.statusCode = response.status;
      return ret;
    } catch (ex) {
      return new BadResponse(
        (
          <span>
            Failed getting <b>{url}</b>
          </span>
        )
      );
    }
  }

  public static async RatelimitRetryFunc<
    TData extends IResponseDataType,
    TReturn extends IResponse<TData>
  >(callback: () => Promise<TReturn>) {
    let response = await doCallback();
    var i = 0;

    while (response.statusCode === 429) {
      if (i > MAX_RATELIMIT_ITERATIONS) {
        return new BadResponse("Exceeded maximum retries.");
      }
      i += 1;

      console.warn("rate-limited trying again");
      await sleepFor(1000);
      response = await doCallback();
    }

    return response;

    async function doCallback() {
      try {
        return await callback();
      } catch (ex) {
        const err = ex as Error;
        return new BadResponse(err.message);
      }
    }
  }
}
