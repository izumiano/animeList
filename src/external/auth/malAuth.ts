import { toast } from "react-toastify";
import ActivityTask from "../../utils/activityTask";
import { showError, sleepFor } from "../../utils/utils";
import WebUtil from "../../utils/webUtil";
import MalErrorHandler from "../errorHandlers/malErrorHandler";
import BadResponse from "../responses/badResponse";
import type MALUserTokenResponse from "../responses/MALUserTokenResponse";
import { MALCryptography } from "./malCryptography";
import { MALUserToken } from "./malUserToken";

const clientId = "7fa754f6a6b5751453f15c715fc71039";
const redirectUri = window.location.origin + "/malAuth";

let acquireUserTokenAbortController = new AbortController();
let refreshTokenAbortController = new AbortController();

export class MALAuth {
  public static readonly instance = new MALAuth();

  private readonly cryptography: MALCryptography = new MALCryptography();
  public userToken: MALUserToken | undefined;

  public init() {
    (async () => {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const token = await MALAuth.instance.acquireUserToken(code);
        if (!token) {
          return;
        }
      }
      MALAuth.instance.authorize();
    })();
  }

  public authorize() {
    const tempUserToken = MALUserToken.create();
    if (tempUserToken) {
      if (tempUserToken.isExpired()) {
        this.refreshUserToken(tempUserToken.refreshToken);
      } else {
        this.userToken = tempUserToken;
      }
      return;
    }

    this.doAuthorize();
  }

  private doAuthorize() {
    const codeChallenge = this.cryptography.codeChallenge;
    if (!codeChallenge) {
      console.error("codeChallenge was undefined");
      return;
    }
    const url = new URL("https://myanimelist.net/v1/oauth2/authorize");
    url.search = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
    }).toString();

    localStorage.setItem("codeChallenge", codeChallenge);
    window.location.assign(url.toString());
  }

  public async acquireUserToken(code: string) {
    acquireUserTokenAbortController.abort();
    acquireUserTokenAbortController = new AbortController();
    if (
      (await sleepFor(1000, acquireUserTokenAbortController.signal)).wasAborted
    ) {
      return;
    }

    const task = new ActivityTask({
      label: "Acquiring User Token",
      task: async () => {
        const url = "https://myanimelist.net/v1/oauth2/token";
        const codeChallenge = localStorage.getItem("codeChallenge");
        if (!codeChallenge) {
          return new BadResponse(
            "Tried acquiring user token, but no code challenge was saved."
          );
        }
        if (code === "") {
          return new BadResponse(
            "Tried acquiring user token, but no code was given."
          );
        }
        const request = new Request(url);
        request.headers.set(
          "Content-Type",
          "application/x-www-form-urlencoded"
        );

        const body = new URLSearchParams({
          client_id: clientId,
          code: code,
          code_verifier: codeChallenge,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        });

        const response = (await WebUtil.fetchProxy(request, "POST", {
          body: body,
          errorHandler: new MalErrorHandler("Failed acquiring user token"),
        })) as MALUserTokenResponse | BadResponse;
        if (response instanceof BadResponse) {
          return response;
        }

        const userToken = MALUserToken.create(response);
        if (userToken instanceof BadResponse) {
          return userToken;
        }
        localStorage.removeItem("codeChallenge");
        history.replaceState(null, "", import.meta.env.BASE_URL);
        this.userToken = userToken;
        return userToken;
      },
    }).start();

    task.then(async (result) => {
      if (result instanceof BadResponse) {
        showError(result);
      } else {
        toast.info("Successfully acquired MAL user token");
      }
    });

    return task;
  }

  public refreshUserToken(refreshToken: string) {
    new ActivityTask({
      label: "Refreshing User Token",
      task: async () => {
        const result = await this.refreshUserTokenAsync(refreshToken);
        if (result instanceof BadResponse) {
          showError(result);
        }
      },
    }).start();
  }

  public async refreshUserTokenAsync(refreshToken: string) {
    refreshTokenAbortController.abort();
    refreshTokenAbortController = new AbortController();
    if ((await sleepFor(1000, refreshTokenAbortController.signal)).wasAborted) {
      return;
    }

    console.debug("refreshing user token");
    const url = "https://myanimelist.net/v1/oauth2/token";
    const request = new Request(url);
    request.headers.set("Content-Type", "application/x-www-form-urlencoded");

    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      redirect_uri: redirectUri,
    });

    const response = (await WebUtil.fetchProxy(request, "POST", {
      body: body,
      errorHandler: new MalErrorHandler("Failed refreshing user token"),
    })) as MALUserTokenResponse | BadResponse;
    if (response instanceof BadResponse) {
      return response;
    }
    const statusCode = response.statusCode;
    if (!statusCode) {
      return new BadResponse("statusCode for refreshUserToken was not found");
    }
    if (statusCode == 401) {
      this.doAuthorize();
      return;
    }

    const token = MALUserToken.create(response);
    if (!token) {
      return new BadResponse("Failed creating new mal user token.");
    }
    this.userToken = token;
    console.debug("successfully refreshed user token", token.accessToken);
    return token;
  }
}
