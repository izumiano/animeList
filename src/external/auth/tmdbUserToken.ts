import WebUtil from "../../utils/webUtil";
import TMDBErrorHandler from "../errorHandlers/tmdbErrorHandler";
import BadResponse from "../responses/badResponse";
import type TMDBAccountDetailsResponse from "../responses/tmdbAccountDetailsResponse";
import type TMDBCreateSessionResponse from "../responses/tmdbCreateSessionResponse";
import { TMDBAuth, tmdbClientId } from "./tmdbAuth";

export class TMDBUserToken {
	accessToken: string;

	private constructor({ accessToken }: { accessToken: string }) {
		this.accessToken = accessToken;
	}

	public static create(data?: TMDBCreateSessionResponse | null) {
		let accessToken;
		if (!data) {
			accessToken = localStorage.getItem("tmdb_accessToken");
		} else {
			accessToken = data.session_id;
		}

		if (!accessToken) {
			return new BadResponse("Missing accessToken");
		}

		localStorage.setItem("tmdb_accessToken", accessToken);

		return new TMDBUserToken({
			accessToken: accessToken,
		});
	}

	public static clear() {
		localStorage.removeItem("tmdb_accessToken");
	}

	public async getAccountDetails() {
		const url = new URL("https://api.themoviedb.org/3/account");
		url.search = new URLSearchParams({
			session_id: this.accessToken,
		}).toString();
		const request = new Request(url);
		request.headers.set("Authorization", `Bearer ${tmdbClientId}`);

		const response = (await WebUtil.fetch(request, "GET", {
			errorHandler: new TMDBErrorHandler("Failed getting account details"),
		})) as TMDBAccountDetailsResponse | BadResponse;

		if (response instanceof BadResponse) {
			const data = response.data?.data as any;
			if (data.success === false && data.status_code === 3) {
				TMDBAuth.instance.logout();
			}
		}

		return response;
	}
}
