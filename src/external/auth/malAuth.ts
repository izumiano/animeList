import { toast } from "react-toastify";
import ActivityTask, { pushTask } from "../../utils/activityTask";
import { showError, sleepFor } from "../../utils/utils";
import WebUtil from "../../utils/webUtil";
import MalErrorHandler from "../errorHandlers/malErrorHandler";
import BadResponse from "../responses/badResponse";
import type MALUserTokenResponse from "../responses/MALUserTokenResponse";
import { MALCryptography } from "./malCryptography";
import { MALUserToken } from "./malUserToken";
import Signal from "../../utils/signal";
import type IAuth from "./IAuth";

export const malClientId = import.meta.env.VITE_MAL_CLIENT_ID;
const redirectUri = window.location.origin + "/malAuth";

let acquireUserTokenAbortController = new AbortController();
let refreshTokenAbortController = new AbortController();

export class MALAuth implements IAuth {
	public static readonly instance = new MALAuth();
	public static get accessToken() {
		return this.instance.userToken?.accessToken;
	}

	private readonly cryptography: MALCryptography = new MALCryptography();
	private _userToken: MALUserToken | undefined;
	public get userToken() {
		return this._userToken;
	}
	private set userToken(value) {
		this._userToken = value;

		this.userTokenSignal.notify(value);
	}
	public userTokenSignal = new Signal<MALUserToken | undefined>(undefined);

	public init() {
		(async () => {
			if (window.location.pathname === "/malAuth") {
				const code = new URLSearchParams(window.location.search).get("code");
				history.replaceState(null, "", import.meta.env.BASE_URL);
				if (code) {
					const token = await MALAuth.instance.acquireUserToken(code);
					if (!token || token instanceof Error) {
						return;
					}
				}
			}
			MALAuth.instance.authorize();
		})();
	}

	public authorize() {
		const tempUserToken = MALUserToken.create();
		if (!(tempUserToken instanceof BadResponse)) {
			if (tempUserToken.isExpired()) {
				this.refreshUserToken(tempUserToken.refreshToken);
			} else {
				this.userToken = tempUserToken;
			}
			return;
		}
	}

	public login() {
		const codeChallenge = this.cryptography.codeChallenge;
		if (!codeChallenge) {
			toast.error("codeChallenge was undefined");
			return;
		}
		const url = new URL("https://myanimelist.net/v1/oauth2/authorize");
		url.search = new URLSearchParams({
			response_type: "code",
			client_id: malClientId,
			redirect_uri: redirectUri,
			code_challenge: codeChallenge,
		}).toString();

		localStorage.setItem("mal_codeChallenge", codeChallenge);
		window.location.assign(url.toString());
	}

	public logout() {
		MALUserToken.clear();
		this.userToken = undefined;
	}

	public async acquireUserToken(code: string) {
		acquireUserTokenAbortController.abort();
		acquireUserTokenAbortController = new AbortController();
		if (
			(await sleepFor(1000, acquireUserTokenAbortController.signal)).wasAborted
		) {
			return;
		}

		const task = pushTask(
			new ActivityTask({
				label: "Acquiring User Token",
				task: async () => {
					const url = "https://myanimelist.net/v1/oauth2/token";
					const codeChallenge = localStorage.getItem("mal_codeChallenge");
					if (!codeChallenge) {
						return new BadResponse(
							"Tried acquiring user token, but no code challenge was saved.",
						);
					}
					if (code === "") {
						return new BadResponse(
							"Tried acquiring user token, but no code was given.",
						);
					}
					const request = new Request(url);
					request.headers.set(
						"Content-Type",
						"application/x-www-form-urlencoded",
					);

					const body = new URLSearchParams({
						client_id: malClientId,
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
					localStorage.removeItem("mal_codeChallenge");
					this.userToken = userToken;
					return userToken;
				},
			}),
		);

		task.then(async (result) => {
			if (result instanceof BadResponse) {
				showError(result);
			} else {
				toast.info("Successfully connected to MAL.");
			}
		});

		return task;
	}

	public async refreshUserToken(refreshToken: string) {
		refreshTokenAbortController.abort();
		refreshTokenAbortController = new AbortController();
		if ((await sleepFor(1000, refreshTokenAbortController.signal)).wasAborted) {
			return;
		}

		pushTask(
			new ActivityTask({
				label: "Refreshing User Token",
				task: async () => {
					const result = await this.refreshUserTokenAsync(refreshToken);
					if (result instanceof BadResponse) {
						showError(result);
					}
					return result;
				},
			}),
		);
	}

	public async refreshUserTokenAsync(refreshToken?: string) {
		console.debug("refreshing user token");
		const url = "https://myanimelist.net/v1/oauth2/token";
		const request = new Request(url);
		request.headers.set("Content-Type", "application/x-www-form-urlencoded");

		refreshToken = refreshToken ?? this.userToken?.refreshToken;
		if (!refreshToken) {
			return new BadResponse("Refresh token was undefined");
		}

		const body = new URLSearchParams({
			client_id: malClientId,
			grant_type: "refresh_token",
			refresh_token: refreshToken ?? this.userToken?.refreshToken,
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
		if (statusCode === 401) {
			this.login();
			return;
		}

		const token = MALUserToken.create(response);
		if (token instanceof BadResponse) {
			return token;
		}
		this.userToken = token;
		console.debug("successfully refreshed user token", token.accessToken);
		return token;
	}
}
