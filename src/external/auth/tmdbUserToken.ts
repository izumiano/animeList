import { type TMDBExternalLink } from "../../models/externalLink";
import WebUtil from "../../utils/webUtil";
import TMDBErrorHandler from "../errorHandlers/tmdbErrorHandler";
import BadResponse from "../responses/badResponse";
import type TMDBAccountDetailsResponse from "../responses/tmdbAccountDetailsResponse";
import type TMDBAccountStatesResponse from "../responses/tmdbAccountStatesResponse";
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

	public async getStatus(externalLink: TMDBExternalLink) {
		const mediaType = externalLink.mediaType;
		if (!mediaType) {
			return new BadResponse("Missing media type");
		}

		const url = new URL(
			` https://api.themoviedb.org/3/${mediaType}/${externalLink.id}/account_states`,
		);
		url.search = new URLSearchParams({
			session_id: this.accessToken,
		}).toString();
		const request = new Request(url);
		request.headers.set("Authorization", `Bearer ${tmdbClientId}`);

		const response = (await WebUtil.fetch(request, "GET", {
			errorHandler: new TMDBErrorHandler("Failed adding to watchlist"),
		})) as TMDBAccountStatesResponse | BadResponse;

		return response;
	}

	public async setIsInWatchlist(
		externalLink: TMDBExternalLink,
		inWatchlist: boolean,
	) {
		const accountDetails = await this.getAccountDetails();
		if (accountDetails instanceof BadResponse) {
			return accountDetails;
		}

		const id = accountDetails.id;
		if (id == null) {
			return new BadResponse("Missing account id");
		}
		const mediaType = externalLink.mediaType;
		if (!mediaType) {
			return new BadResponse("Missing media type");
		}

		const url = new URL(`https://api.themoviedb.org/3/account/${id}/watchlist`);
		url.search = new URLSearchParams({
			session_id: this.accessToken,
		}).toString();
		const request = new Request(url);
		request.headers.set("Authorization", `Bearer ${tmdbClientId}`);
		request.headers.set("Content-Type", "application/json;charset=utf-8");

		const response = (await WebUtil.fetch(request, "POST", {
			errorHandler: new TMDBErrorHandler("Failed adding to watchlist"),
			bodyObj: {
				media_type: externalLink.mediaType,
				media_id: externalLink.id,
				watchlist: inWatchlist,
			},
			acceptStatusCodes: [200, 429, 401, 201],
		})) as TMDBAccountDetailsResponse | BadResponse;

		return response;
	}

	public async updateStatus(
		externalLink: TMDBExternalLink,
		data: { score: number },
	) {
		const id = externalLink.id;
		if (id == null) {
			return new BadResponse("Missing id");
		}
		const mediaType = externalLink.mediaType;
		if (mediaType == null) {
			return new BadResponse("Missing mediaType");
		}

		const score = data.score;

		const url = new URL(
			`https://api.themoviedb.org/3/${mediaType}/${id}/rating`,
		);
		url.search = new URLSearchParams({
			session_id: this.accessToken,
		}).toString();
		const request = new Request(url);
		request.headers.set("Authorization", `Bearer ${tmdbClientId}`);
		request.headers.set("Content-Type", "application/json;charset=utf-8");

		const response = (await WebUtil.fetch(request, score ? "POST" : "DELETE", {
			errorHandler: new TMDBErrorHandler("Failed updating status"),
			bodyObj: { value: score },
			acceptStatusCodes: [200, 429, 401, 201],
		})) as TMDBAccountDetailsResponse | BadResponse;

		return response;
	}
}
