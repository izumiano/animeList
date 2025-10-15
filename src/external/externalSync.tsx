import { toast } from "react-toastify";
import type AnimeSeason from "../models/animeSeason";
import ActivityTask, { pushTask } from "../utils/activityTask";
import { sleepFor } from "../utils/utils";
import { MALAuth } from "./auth/malAuth";
import { externalSyncEnabled } from "../appData";

const abortControllers: Map<string, AbortController> = new Map();

export default class ExternalSync {
	public static async updateAnimeSeasonStatus(
		season: AnimeSeason,
		title: string | undefined,
		params?: { showToastOnSuccess?: boolean; allowAbort?: boolean },
	) {
		if (!externalSyncEnabled) return;

		params ??= {};
		params.showToastOnSuccess ??= true;
		params.allowAbort ??= true;

		return await pushTask(
			new ActivityTask({
				label: (
					<span>
						Updating{" "}
						<b>
							{title} <i>[{season.title}]</i>
						</b>
					</span>
				),
				task: async () => {
					if (params.allowAbort) {
						const id = `${season.externalLink.type}${season.externalLink.id}`;
						abortControllers.get(id)?.abort();
						const abortController = new AbortController();
						abortControllers.set(id, abortController);

						if ((await sleepFor(2000, abortController.signal)).wasAborted) {
							return;
						}

						abortControllers.delete(id);
					}

					try {
						switch (season.externalLink.type) {
							case "MAL":
								return await MALAuth.instance.userToken?.updateAnimeSeasonStatus(
									season,
									title,
								);

							default:
								break;
						}
					} finally {
						if (params.showToastOnSuccess) {
							toast.info(
								<span>
									Successfully updated{" "}
									<b>
										{title} <i>[{season.title}]</i>
									</b>
								</span>,
							);
						}
					}
				},
			}),
		);
	}

	public static async deleteAnimeSeason(
		season: AnimeSeason,
		title: string | undefined,
		params?: { showToastOnSuccess?: boolean },
	) {
		if (!externalSyncEnabled) return;

		params ??= {};
		params.showToastOnSuccess ??= true;

		return await pushTask(
			new ActivityTask({
				label: (
					<span>
						Updating{" "}
						<b>
							{title} <i>[{season.title}]</i>
						</b>
					</span>
				),
				task: async () => {
					const id = `${season.externalLink.type}${season.externalLink.id}`;
					abortControllers.get(id)?.abort();
					abortControllers.delete(id);

					try {
						switch (season.externalLink.type) {
							case "MAL":
								return await MALAuth.instance.userToken?.deleteSeason(
									season,
									title,
								);

							default:
								break;
						}
					} finally {
						if (params.showToastOnSuccess) {
							toast.info(
								<span>
									Successfully Deleted{" "}
									<b>
										{title} <i>[{season.title}]</i>
									</b>
								</span>,
							);
						}
					}
				},
			}),
		);
	}
}
