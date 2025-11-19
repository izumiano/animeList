import type AnimeSeason from "../models/animeSeason";
import ActivityTask, { pushTask } from "../utils/activityTask";
import WebUtil from "../utils/webUtil";
import { malClientId } from "./auth/malAuth";
import MalErrorHandler from "./errorHandlers/malErrorHandler";
import BadResponse from "./responses/badResponse";
import type { MALSeasonDetails } from "./responses/MALSeasonDetails";
import { SeasonDetails } from "./responses/SeasonDetails";

export default class MALRequest {
	public static async getSeasonDetails(
		season: AnimeSeason,
		fields: string[] = [],
	) {
		const task = await pushTask(
			new ActivityTask({
				label: "Getting Anime Details",
				task: async () => {
					const malId = season.externalLink?.id;
					if (!malId) {
						return new BadResponse("malId was undefined");
					}
					const fieldsString = fields.reduce((prev, curr) => prev + "," + curr);
					const url = new URL(`https://api.myanimelist.net/v2/anime/${malId}`);
					url.search = new URLSearchParams({ fields: fieldsString }).toString();
					const request = new Request(url);
					request.headers.set("X-MAL-CLIENT-ID", malClientId);

					const response = (await WebUtil.fetchProxy(request, "GET", {
						errorHandler: new MalErrorHandler(
							<span>Failed getting season details</span>,
						),
					})) as MALSeasonDetails;

					const statusCode = response.statusCode;
					if (!statusCode) {
						return new BadResponse("Failed without a status code!", response);
					}
					if (statusCode !== 200) {
						return new BadResponse(
							`Failed with statusCode: [${statusCode}]`,
							response,
						);
					}

					return response;
				},
			}),
		);

		const response = task.result;

		if (response instanceof Error) {
			return response;
		}
		if (!response) {
			return;
		}
		if (!response.id) {
			return;
		}
		return SeasonDetails.createFromMal({
			mal_id: response.id,
			synopsis: response.synopsis,
			aired: response.start_date
				? { from: new Date(response.start_date ?? "") }
				: undefined,
		});
	}
}
