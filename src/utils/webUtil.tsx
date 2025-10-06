import type IErrorHandler from "../external/errorHandlers/IErrorHandler";
import BadResponse from "../external/responses/badResponse";
import type {
  IResponse,
  IResponseDataType,
} from "../external/responses/IResponse";
import { sleepFor } from "./utils";

export type RequestMethod = "GET" | "POST" | "PUT";

const MAX_RATELIMIT_ITERATIONS = 40;

export default class WebUtil {
  private static async doRequest<
    TData extends IResponseDataType,
    TReturn extends IResponse<TData>,
    TErrorType,
    TErrorHandler extends IErrorHandler<TErrorType>
  >(
    request: Request,
    params?: {
      acceptStatusCodes?: number[];
      errorHandler?: TErrorHandler;
    }
  ) {
    const acceptedStatusCodes = params?.acceptStatusCodes ?? [200, 429, 401];

    try {
      const response = await fetch(request);
      const data: TReturn | TErrorType = await response.json();

      if (
        !acceptedStatusCodes.includes(response.status) ||
        !(params?.errorHandler?.isSuccess(data, acceptedStatusCodes) ?? true)
      ) {
        return new BadResponse(
          getFailMessage({
            message: params?.errorHandler?.getFailureMessage(
              request.url,
              data as TErrorType
            ),
            statusCode: response.status,
          }),
          { data: data, statusCode: response.status }
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
                Failed getting <b>{request.url}</b>
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

  public static async fetch<
    TData extends IResponseDataType,
    TReturn extends IResponse<TData>,
    TErrorType,
    TErrorHandler extends IErrorHandler<TErrorType>
  >(
    request: RequestInfo,
    method?: RequestMethod,
    params?: {
      body?: BodyInit;
      acceptStatusCodes?: number[];
      errorHandler?: TErrorHandler;
    }
  ) {
    return await this.doRequest<TData, TReturn, TErrorType, TErrorHandler>(
      new Request(request, { method: method ?? "GET", body: params?.body }),
      params
    );
  }

  public static async fetchProxy<
    TData extends IResponseDataType,
    TReturn extends IResponse<TData>,
    TErrorType,
    TErrorHandler extends IErrorHandler<TErrorType>
  >(
    request: Request | URL,
    method?: RequestMethod,
    params?: {
      body?: BodyInit;
      acceptStatusCodes?: number[];
      errorHandler?: TErrorHandler;
    }
  ) {
    const url = request instanceof URL ? request : request.url;

    return await this.fetch<TData, TReturn, TErrorType, TErrorHandler>(
      new Request(
        `https://cors-header-proxy.izumiano.workers.dev/?url=${url}`,
        request instanceof URL ? undefined : request
      ),
      method,
      params
    );
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
