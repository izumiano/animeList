import LocalDB from "../../indexedDb/indexedDb";
import Anime from "../../models/anime";
import { showError, sleepFor } from "../../utils/utils";

export function importAnimes(
	files: FileList | null,
	onAnimeSaved: (anime: Anime) => void,
) {
	if (!files) {
		return;
	}

	const animes: any[] = [];

	function handleError(ex: unknown) {
		showError(
			ex,
			<span>
				<b>Failed importing data</b>
			</span>,
			{ showInProgressNode: true },
		);
	}

	new Promise((resolve, reject) => {
		(async () => {
			for (const file of files) {
				try {
					const obj = JSON.parse(await file.text());
					for (const o of obj) {
						animes.push(o);
					}
				} catch (ex) {
					reject(ex);
					return;
				}
			}

			animes.sort((lhs, rhs) => {
				if (lhs.order < rhs.order) return -1;
				return 1;
			});

			LocalDB.doTransaction(
				(store, db) => {
					const t = animes.map(async (anime, index) => {
						anime.order = index;

						if (typeof anime.dateStarted === "number") {
							anime.dateStarted = thirdMilleniumSecondsToUnixMilli(
								anime.dateStarted,
							);
						}
						if (typeof anime.dateStarted === "number") {
							anime.dateFinished = thirdMilleniumSecondsToUnixMilli(
								anime.dateFinished,
							);
						}

						anime.seasons?.forEach((season: any) => {
							if (typeof season.dateStarted === "number") {
								season.dateStarted = thirdMilleniumSecondsToUnixMilli(
									season.dateStarted,
								);
							}
							if (typeof anime.dateStarted === "number") {
								season.dateFinished = thirdMilleniumSecondsToUnixMilli(
									season.dateFinished,
								);
							}
							if (season.externalLink.type === "TMDB") {
								season.externalLink.seasonId = season.externalLink?.id;
								season.externalLink.id = anime.externalLink?.id;
							}
						});
						const newAnime = Anime.Load({
							animeData: anime,
							justAdded: false,
						});
						if (!(newAnime instanceof Anime)) {
							return { isError: true, value: newAnime.error };
						}

						let ret: undefined | "done" | Event;

						const request = db.saveAnime(newAnime, store);
						request.onsuccess = () => {
							onAnimeSaved(newAnime);
							ret = "done";
						};
						request.onerror = (ex) => {
							ret = ex;
						};

						while (!ret) {
							await sleepFor(20);
						}

						return { isError: false, value: ret };
					});

					Promise.all(t)
						.then((values) => {
							const errors = values
								.filter((value) => value.isError)
								.map((value) => value.value);

							if (errors.length > 0) {
								handleError(errors);
							}
						})
						.catch(handleError);

					return null;
				},
				{ onError: reject },
			);
			resolve(null);
		})();
	}).catch(handleError);
}

function thirdMilleniumSecondsToUnixMilli(
	thirdMilleniumTimestamp: number | undefined | null,
) {
	if (!thirdMilleniumTimestamp) {
		return;
	}

	return thirdMilleniumTimestamp * 1000 + 978307200000;
}
