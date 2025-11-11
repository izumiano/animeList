import { toast } from "react-toastify";
import ActivityTask, { pushTask } from "../../utils/activityTask";
import { showError, sleepFor } from "../../utils/utils";
import BadResponse from "../responses/badResponse";
import Signal from "../../utils/signal";
import { TMDBUserToken } from "./tmdbUserToken";
import TMDBRequest from "../tmdbRequest";
import type IAuth from "./IAuth";

export const tmdbClientId = import.meta.env.VITE_TMDB_CLIENT_ID;
const redirectUri = window.location.origin + "/tmdbAuth";

let acquireUserTokenAbortController = new AbortController();

export class TMDBAuth implements IAuth {
	public static readonly instance = new TMDBAuth();
	public static get accessToken() {
		return this.instance.userToken?.accessToken;
	}

	private _userToken: TMDBUserToken | undefined;
	public get userToken() {
		return this._userToken;
	}
	private set userToken(value) {
		this._userToken = value;

		this.userTokenSignal.notify(value);
	}
	public userTokenSignal = new Signal<TMDBUserToken | undefined>(undefined);

	public init() {
		(async () => {
			if (window.location.pathname === "/tmdbAuth") {
				const searchParams = new URLSearchParams(window.location.search);
				const requestToken = searchParams.get("request_token");
				const denied =
					searchParams.get("approved") !== "true" &&
					searchParams.get("denied") === "true";
				history.replaceState(null, "", import.meta.env.BASE_URL);

				if (denied) {
					console.error("TMDB Authentication was denied");

					await sleepFor(1000);
					showError("TMDB Authentication was denied", null, {
						showInProgressNode: true,
					});
					return;
				}

				if (!denied && requestToken) {
					const token = await TMDBAuth.instance.acquireUserToken(requestToken);
					if (!token || token instanceof Error) {
						return;
					}
				}
			}
			TMDBAuth.instance.authorize();
		})();
	}

	public authorize() {
		const tempUserToken = TMDBUserToken.create();
		if (!(tempUserToken instanceof BadResponse)) {
			this.userToken = tempUserToken;
		}
	}

	public async login() {
		const requestTokenResponse = await TMDBRequest.createRequestToken();
		if (requestTokenResponse instanceof BadResponse) {
			showError(requestTokenResponse, null, { showInProgressNode: true });
			return;
		}
		if (!requestTokenResponse.request_token) {
			showError("Missing request_token in response", null, {
				showInProgressNode: true,
			});
			return;
		}
		if (!requestTokenResponse.expires_at) {
			showError("Missing expires_at in response", null, {
				showInProgressNode: true,
			});
			return;
		}
		if (new Date(requestTokenResponse.expires_at) < new Date()) {
			showError("Request token has already expired", null, {
				showInProgressNode: true,
			});
			return;
		}

		const requestToken = requestTokenResponse.request_token;

		const url = new URL(
			`https://www.themoviedb.org/authenticate/${requestToken}`,
		);
		url.search = new URLSearchParams({
			redirect_to: redirectUri,
		}).toString();

		window.location.assign(url.toString());
	}

	public logout() {
		TMDBUserToken.clear();
		this.userToken = undefined;
	}

	public async acquireUserToken(requestToken: string) {
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
					if (requestToken === "") {
						return new BadResponse(
							"Tried acquiring user token, but no requestToken was given.",
						);
					}

					const sessionResponse = await TMDBRequest.createSession(requestToken);

					if (sessionResponse instanceof BadResponse) {
						return sessionResponse;
					}

					const userToken = TMDBUserToken.create(sessionResponse);
					if (userToken instanceof BadResponse) {
						return userToken;
					}
					this.userToken = userToken;
					return userToken;
				},
			}),
		);

		task.then(async (result) => {
			if (result instanceof BadResponse) {
				showError(result);
			} else {
				toast.info("Successfully connected to TMDB.");
			}
		});

		return task;
	}
}
