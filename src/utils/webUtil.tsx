import type IErrorHandler from "../external/errorHandlers/IErrorHandler";
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
    TReturn extends IResponse<TData>,
    TErrorType,
    TErrorHandler extends IErrorHandler<TErrorType>
  >(
    url: string,
    params?: {
      acceptStatusCodes?: number[];
      errorHandler?: TErrorHandler;
    }
  ) {
    const acceptedStatusCodes = params?.acceptStatusCodes ?? [200, 429];

    try {
      const response = await fetch(url);
      const data: TReturn | TErrorType = await response.json();

      if (
        !acceptedStatusCodes.includes(response.status) ||
        !(params?.errorHandler?.isSuccess(data, acceptedStatusCodes) ?? true)
      ) {
        return new BadResponse(
          getFailMessage({
            message: params?.errorHandler?.getFailureMessage(
              url,
              data as TErrorType
            ),
            statusCode: response.status,
          })
        );
      }

      const ret = data as TReturn;
      ret.statusCode = response.status;

      return ret;
    } catch (ex) {
      return new BadResponse(
        getFailMessage({ message: (ex as Error).message }),
        { data: ex }
      );
    }

    function getFailMessage({
      message,
      statusCode,
    }: {
      message: React.ReactNode;
      statusCode?: number;
    }) {
      if (!message || typeof message === "string") {
        return (
          <span>
            {message ? (
              <>{message}</>
            ) : (
              <>
                Failed getting <b>{url}</b>
              </>
            )}
            {statusCode ? (
              <>
                {" "}
                with status code <b>{statusCode}</b>
              </>
            ) : (
              <></>
            )}
          </span>
        );
      }

      return message;
    }
  }

  public static async ratelimitRetryFunc<
    TData extends IResponseDataType,
    TReturn extends IResponse<TData>
  >(callback: () => Promise<TReturn>) {
    let response = await doCallback();
    let i = 0;

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
