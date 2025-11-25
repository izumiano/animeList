import type AnimeSeason from "../../models/animeSeason";
import ActivityTask from "../../utils/activityTask";
import { formatDate } from "../../utils/utils";
import WebUtil from "../../utils/webUtil";
import JikanErrorHandler from "../errorHandlers/jikanErrorHandler";
import MalErrorHandler from "../errorHandlers/malErrorHandler";
import type MALUpdateMyListStatus from "../requests/malUpdateMyListStatus";
import type { MALUpdateMyListStatuses } from "../requests/malUpdateMyListStatus";
import BadResponse from "../responses/badResponse";
import type MALUserTokenResponse from "../responses/MALUserTokenResponse";
import type MalAccountDetailsResponse from "../responses/malAccountDetailsResponse";
import type MALDeleteResponse from "../responses/malDeleteResponse";
import type MalFullAccountDetailsResponse from "../responses/malFullAcountDetailsResponse";
import type MALMyListStatusResponse from "../responses/malMyListStatusResponse";
import type { MALMyListStatus } from "../responses/malMyListStatusResponse";
import { MALAuth } from "./malAuth";

export class MALUserToken {
	accessToken: string;
	refreshToken: string;
	expiresAt: Date;

	private constructor({
		accessToken,
		refreshToken,
		expiresAt,
	}: {
		accessToken: string;
		refreshToken: string;
		expiresAt: Date;
	}) {
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
		this.expiresAt = expiresAt;
	}

	public static create(data?: MALUserTokenResponse | null) {
		let accessToken: string | null | undefined;
		let refreshToken: string | null | undefined;
		let expiresAt: Date | null;
		if (!data) {
			accessToken = localStorage.getItem("mal_accessToken");
			refreshToken = localStorage.getItem("mal_refreshToken");
			const expiresAtStr = localStorage.getItem("mal_expiresAt");
			expiresAt = expiresAtStr ? new Date(parseInt(expiresAtStr)) : null;
		} else {
			accessToken = data.access_token;
			refreshToken = data.refresh_token;
			expiresAt = data.expires_in
				? new Date(Date.now() + data.expires_in * 1000)
				: null;
		}

		if (!accessToken || !refreshToken || !expiresAt) {
			return new BadResponse("Missing accessToken, refreshToken or expiresAt", {
				data: { accessToken, refreshToken, expiresAt },
			});
		}

		localStorage.setItem("mal_accessToken", accessToken);
		localStorage.setItem("mal_refreshToken", refreshToken);
		localStorage.setItem("mal_expiresAt", String(expiresAt.getTime()));

		return new MALUserToken({
			accessToken: accessToken,
			refreshToken: refreshToken,
			expiresAt: expiresAt,
		});
	}

	public static clear() {
		localStorage.removeItem("mal_accessToken");
		localStorage.removeItem("mal_refreshToken");
		localStorage.removeItem("mal_expiresAt");
	}

	public isExpired() {
		return this.expiresAt.getTime() - Date.now() <= 0;
	}

	public async updateAnimeSeasonStatus(season: AnimeSeason, title?: string) {
		const episodesWatched = season.episodes.filter(
			(episode) => episode.watched,
		).length;

		const date = formatDate(new Date(), "yyyy-MM-dd", undefined);
		const data: MALUpdateMyListStatus = {
			status: "plan_to_watch",
			num_watched_episodes: episodesWatched,
			score: (season.score ?? 0) * 2,
		};

		const isCompleted = episodesWatched >= season.episodes.length;

		if (episodesWatched > 0) {
			const listStatus = await new ActivityTask({
				label: "Checking if start/finish date is already set",
				task: async () => {
					const listStatus = await this.getSeasonListStatus(season, title);
					if (listStatus instanceof BadResponse) {
						return listStatus;
					}
					if (!listStatus?.finish_date && isCompleted) {
						data.finish_date = date;
					}
					if (!listStatus?.start_date) {
						data.start_date = date;
					}
				},
			}).start();

			if (listStatus instanceof BadResponse) {
				return listStatus;
			}

			if (!isCompleted) {
				data.status = "watching";
			} else {
				data.status = "completed";
			}
		}

		return this.doUpdateAnimeSeasonStatus({
			season: season,
			data: data,
		});
	}

	private async doUpdateAnimeSeasonStatus({
		season,
		data,
	}: {
		season: AnimeSeason;
		data: MALUpdateMyListStatus;
	}): Promise<undefined | BadResponse | { success: true }> {
		if (this.isExpired()) {
			const newToken = await MALAuth.instance.refreshUserTokenAsync(
				this.refreshToken,
			);
			if (newToken instanceof BadResponse) {
				return newToken;
			}
			if (!newToken) {
				return;
			}
			return newToken.doUpdateAnimeSeasonStatus({
				season: season,
				data: data,
			});
		}

		const malId = season.externalLink?.id;
		if (!malId) {
			return new BadResponse("malId was undefined");
		}

		const request = new Request(
			`https://api.myanimelist.net/v2/anime/${malId}/my_list_status`,
		);
		request.headers.set("Authorization", `Bearer ${this.accessToken}`);
		request.headers.set("Content-Type", "application/x-www-form-urlencoded");

		const response = (await WebUtil.fetchProxy(request, "PUT", {
			body: Object.keys(data)
				.map((key) => `${key}=${data[key as keyof MALUpdateMyListStatus]}`)
				.join("&"),
			errorHandler: new MalErrorHandler("Failed updating"),
		})) as MALMyListStatusResponse | BadResponse;

		if (response instanceof BadResponse) {
			return response;
		}
		const statusCode = response.statusCode;
		if (!statusCode) {
			return new BadResponse("Failed without a status code!", response);
		}
		if (statusCode === 401) {
			const newToken = await MALAuth.instance.refreshUserTokenAsync(
				this.refreshToken,
			);
			if (newToken instanceof BadResponse) {
				return newToken;
			}
			if (!newToken) {
				MALAuth.instance.authorize();
				return;
			}
			return newToken.doUpdateAnimeSeasonStatus({
				season: season,
				data: data,
			});
		}
		if (statusCode !== 200) {
			return new BadResponse(`Failed with statusCode: [${statusCode}]`);
		}
		return { success: true };
	}

	public async getSeasonListStatus(
		season: AnimeSeason,
		title: string | undefined,
	): Promise<MALMyListStatus | BadResponse | undefined> {
		const malId = season.externalLink?.id;
		if (!malId) {
			return new BadResponse("malId was undefined");
		}
		const request = new Request(
			`https://api.myanimelist.net/v2/anime/${malId}?fields=my_list_status`,
		);
		request.headers.set("Authorization", `Bearer ${this.accessToken}`);

		const response = (await WebUtil.fetchProxy(request, "GET", {
			errorHandler: new MalErrorHandler("Failed getting season list status"),
		})) as MALMyListStatusResponse | BadResponse;

		if (response instanceof BadResponse) {
			return response;
		}
		const statusCode = response.statusCode;
		if (!statusCode) {
			return new BadResponse(
				`${title}(${season.title}) failed without a status code!`,
			);
		}
		if (statusCode === 401) {
			const newToken = await MALAuth.instance.refreshUserTokenAsync();
			if (newToken instanceof BadResponse) {
				return newToken;
			}
			if (!newToken) {
				MALAuth.instance.authorize();
				return;
			}
			return await newToken.getSeasonListStatus(season, title);
		}
		if (statusCode !== 200) {
			return new BadResponse(`Failed with status code: [${statusCode}]`);
		}

		const myListStatus = response.my_list_status;
		if (!myListStatus) {
			return { statusCode: statusCode };
		}

		return myListStatus;
	}

	public async deleteSeason(
		season: AnimeSeason,
		title: string | undefined,
	): Promise<
		BadResponse | { status: MALUpdateMyListStatuses | "deleted" } | undefined
	> {
		if (this.isExpired()) {
			const newToken = await MALAuth.instance.refreshUserTokenAsync(
				this.refreshToken,
			);
			if (newToken instanceof BadResponse) {
				return newToken;
			}
			if (!newToken) {
				return;
			}
			return newToken.deleteSeason(season, title);
		}

		const malId = season.externalLink?.id;
		if (!malId) {
			return new BadResponse("malId was undefined");
		}

		const episodesWatched = season.episodes.filter(
			(episode) => episode.watched,
		).length;

		if (
			episodesWatched === season.episodes.length &&
			season.episodes.length > 0
		) {
			return new BadResponse(
				`${title}(${season.title}) has already been watched fully`,
			);
		}
		if (episodesWatched === 0) {
			return await this.doDeleteSeason(season, title);
		}

		const response = await this.doUpdateAnimeSeasonStatus({
			season: season,
			data: { status: "dropped" },
		});
		if (response instanceof BadResponse) {
			return response;
		}
		return { status: "dropped" };
	}

	private async doDeleteSeason(
		season: AnimeSeason,
		title: string | undefined,
	): Promise<BadResponse | { status: "deleted" } | undefined> {
		const request = new Request(
			`https://api.myanimelist.net/v2/anime/${season.externalLink.id}/my_list_status`,
		);
		request.headers.set("Authorization", `Bearer ${this.accessToken}`);

		const response = (await WebUtil.fetchProxy(request, "DELETE")) as
			| MALDeleteResponse
			| BadResponse;
		const statusCode = response.statusCode;
		if (!statusCode) {
			return new BadResponse(
				`${title}(${season.title}) failed without a status code!`,
			);
		}
		if (statusCode === 401) {
			const newToken = await MALAuth.instance.refreshUserTokenAsync();
			if (newToken instanceof BadResponse) {
				return newToken;
			}
			if (!newToken) {
				MALAuth.instance.authorize();
				return;
			}
			return await newToken.doDeleteSeason(season, title);
		}
		if (statusCode !== 200) {
			return new BadResponse(`Failed with status code: [${statusCode}]`);
		}

		return { status: "deleted" };
	}

	public async getAccountDetails(): Promise<
		MalAccountDetailsResponse | BadResponse | undefined
	> {
		const request = new Request(
			`https://api.myanimelist.net/v2/users/@me?fields=profile_picture`,
		);
		request.headers.set("Authorization", `Bearer ${this.accessToken}`);

		const response = (await WebUtil.fetchProxy(request, "GET")) as
			| MalAccountDetailsResponse
			| BadResponse;
		const statusCode = response.statusCode;
		if (!statusCode) {
			return new BadResponse(`Failed without a status code!`);
		}
		if (statusCode === 401) {
			const newToken = await MALAuth.instance.refreshUserTokenAsync();
			if (newToken instanceof BadResponse) {
				return newToken;
			}
			if (!newToken) {
				MALAuth.instance.authorize();
				return;
			}
			return await newToken.getAccountDetails();
		}
		if (statusCode !== 200) {
			return new BadResponse(`Failed with status code: [${statusCode}]`);
		}

		return response;
	}

	public async getAccountDetailsFull(username: string) {
		return await WebUtil.ratelimitRetryFunc(async () => {
			return (await WebUtil.fetch(
				`https://api.jikan.moe/v4/users/${username}`,
				"GET",
				{
					errorHandler: new JikanErrorHandler("Failed getting account icon"),
				},
			)) as MalFullAccountDetailsResponse | BadResponse;
		});
	}
}
