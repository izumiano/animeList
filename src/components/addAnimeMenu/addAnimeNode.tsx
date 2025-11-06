import { useRef, useState } from "react";
import { SeasonDetails } from "../../external/responses/SeasonDetails";
import type { ProgressButtonState } from "../generic/progress/progressButton";
import AnimeSearch from "../../external/search/animeSearch";
import { importAnimes } from "./animeImport";
import SearchResults from "./searchResults";
import ProgressButton from "../generic/progress/progressButton";
import { toast } from "react-toastify";
import Anime from "../../models/anime";
import {
	ExternalLinkTypeValues,
	newExternalLink,
	type ExternalLink,
	type ExternalLinkType,
} from "../../models/externalLink";
import AnimeCardFactory from "../../external/factories/animeCardFactory";
import AppData from "../../appData";
import BadResponse from "../../external/responses/badResponse";
import {
	allSuccess,
	downloadObjectAsFile,
	formatDate,
	showError,
	sleepFor,
} from "../../utils/utils";
import LocalDB from "../../indexedDb/indexedDb";
import ExternalSync from "../../external/externalSync";
import fileUploadIcon from "../../assets/fileUpload.png";
import fileDownloadIcon from "../../assets/fileDownload.png";
import "./addAnimeNode.css";
import type ActivityTask from "../../utils/activityTask";

export type SearchResultsType = {
	[K in Exclude<ExternalLinkType, undefined>]: SeasonDetails[] | "loading";
};

export type SelectedAnimeInfoType = {
	index: number;
	type: ExternalLinkType;
	selectedSeasonId: number | null | undefined;
} | null;

export default function AddAnimeNode({
	onAddAnimes,
	setIsOpenState,
	animeParent,
	className,
}: {
	onAddAnimes: (anime: Anime[], params?: { doScroll: boolean }) => void;
	setIsOpenState: (isOpen: boolean) => void;
	animeParent?: Anime;
	className?: string;
}) {
	const [searchResults, setSearchResultsState] = useState<SearchResultsType>({
		MAL: [],
		TMDB: [],
	});
	const [selectedAnimeInfo, setSelectedAnimeInfoState] =
		useState<SelectedAnimeInfoType>(null);
	const [addAnimeProgressState, setAddAnimeProgressState] =
		useState<ProgressButtonState>({ progress: 0, state: "enabled" });

	const addAnimeSearchElementRef = useRef<HTMLInputElement>(null);

	function setAllSearchResults(value: SeasonDetails[] | "loading") {
		setSearchResultsState((prev) => {
			const newSearchResults = { ...prev };
			ExternalLinkTypeValues.forEach((externalType) => {
				if (!externalType) {
					return;
				}
				newSearchResults[externalType] = value;
			});
			return newSearchResults;
		});
	}

	function addAnime(anime: Anime) {
		if (addAnimeSearchElementRef.current) {
			addAnimeSearchElementRef.current.value = "";
		}
		setAddAnimeProgressState({
			progress: 0,
			state: "enabled",
		});
		setAllSearchResults([]);
		setSelectedAnimeInfoState(null);
		setIsOpenState(false);
		onAddAnimes([anime]);

		allSuccess(anime.seasons, {
			forEach: async (season) =>
				ExternalSync.updateAnimeSeasonStatus(season, anime.title, {
					showToastOnSuccess: false,
					allowAbort: false,
				}),
			successMessage: (
				<span>
					Successfully added <b>{anime.title}</b> to {anime.externalLink.type}.
				</span>
			),
			failMessage: (
				<span>
					Failed adding <b>{anime.title}</b> to {anime.externalLink.type}.
				</span>
			),
		});
	}

	const addButtonEnabled = (() => {
		if (selectedAnimeInfo?.index == null || !selectedAnimeInfo.type) {
			return false;
		}

		if (!animeParent || selectedAnimeInfo.type !== "TMDB") {
			return true;
		}

		const selectedAnime = searchResults[selectedAnimeInfo.type].at(
			selectedAnimeInfo.index,
		);
		if (!selectedAnime || typeof selectedAnime === "string") {
			return false;
		}
		const externalLink = selectedAnime.externalLink;
		if (!externalLink) {
			return false;
		}
		if (externalLink.type !== "TMDB" || externalLink.mediaType !== "tv") {
			return true;
		}

		if (selectedAnimeInfo.selectedSeasonId == null) {
			return false;
		}

		return true;
	})();

	return (
		<div className={`${animeParent ? "" : "scroll"} ${className}`}>
			<div className="addAnimeInputs flexRow">
				<input
					ref={addAnimeSearchElementRef}
					className="addAnimeSearch"
					type="text"
					placeholder="Search"
					onChange={(event) => {
						const text = event.target.value;
						setAllSearchResults("loading");
						setSelectedAnimeInfoState(null);
						AnimeSearch.search(text, ({ seasons, externalType }) => {
							switch (externalType) {
								case "MAL":
									setSearchResultsState((prev) => ({
										MAL: seasons,
										TMDB: prev.TMDB,
									}));
									break;
								case "TMDB":
									setSearchResultsState((prev) => ({
										MAL: prev.MAL,
										TMDB: seasons,
									}));
									break;
								default:
									setAllSearchResults(seasons);
									break;
							}
						});
					}}
				></input>
				<label className="fileButton">
					<input
						type="file"
						onChange={(event) => {
							importAnimes(event.target.files, (animes) =>
								onAddAnimes(animes, { doScroll: false }),
							);
						}}
					/>
					<img src={fileUploadIcon}></img>
				</label>
				<div
					className="fileButton"
					onClick={() => {
						downloadObjectAsFile({
							fileName: `animeListData_${formatDate(new Date(), "yyyy-MM-dd", "")}.json`,
							data: Array.from(AppData.animes.values()),
							mimeType: "application/json",
							excludeKeys: ["anime", "pauseAutoSave", "justAdded"],
							jsonSpace: "	", // tab character
						});
					}}
				>
					<img src={fileDownloadIcon} />
				</div>
			</div>
			<div>
				<SearchResults
					searchResults={searchResults}
					selectedAnimeInfo={selectedAnimeInfo}
					setSelectedAnimeInfoState={setSelectedAnimeInfoState}
					getSequels={!animeParent}
				/>
				<div className="addButtonSpacer addButtonProps"></div>
			</div>
			<ProgressButton
				state={addAnimeProgressState}
				disabled={!addButtonEnabled}
				className={`addButton addButtonProps ${
					addAnimeProgressState.state === "loading" ? "loading" : ""
				}`}
				onClick={() => {
					const selectedAnime = getSelectedAnime(
						selectedAnimeInfo,
						searchResults,
						animeParent,
					);

					if (!selectedAnime) {
						return;
					}

					async function handleCreateAnime(
						createAnimeTask: ActivityTask<Anime> | BadResponse,
						resolve: (_: null) => void,
					) {
						if (createAnimeTask instanceof BadResponse) {
							showError(createAnimeTask, null, { showInProgressNode: true });
							resolve(null);
							return;
						}

						createAnimeTask.onProgressUpdate = ({ progress, maxProgress }) => {
							setAddAnimeProgressState({
								progress: progress / (maxProgress - 1), // remove 1 from max so we can actually see progress bar reach the end
								state: "loading",
							});
						};

						const anime = await createAnimeTask.start();

						if (anime instanceof Error || !anime) {
							setAddAnimeProgressState({ progress: 0, state: "enabled" });
							showError(anime, null, { showInProgressNode: true });
							resolve(null);
							return;
						}

						await sleepFor(500);

						if (animeParent) {
							addAnime(anime);
							return;
						}

						LocalDB.doTransaction(
							(store, db) => {
								return db.saveAnime(anime, store);
							},
							{
								onSuccess: () => {
									addAnime(anime);
								},
							},
						);
						resolve(null);
					}

					new Promise((resolve) => {
						(async () => {
							if (
								!selectedAnime.externalLink ||
								selectedAnime.externalLink.id == null
							) {
								showError(selectedAnime.externalLink, "Invalid external link", {
									showInProgressNode: true,
								});
								return;
							}

							const createAnimeTask = getCreateAnimeTask({
								externalLink: selectedAnime.externalLink,
								getSequels: !animeParent,
								seasonId: selectedAnimeInfo?.selectedSeasonId,
							});

							handleCreateAnime(createAnimeTask, resolve);
						})();
					});
				}}
			>
				<span>Add</span>
			</ProgressButton>
		</div>
	);
}

function getCreateAnimeTask({
	externalLink,
	getSequels,
	seasonId,
}: {
	externalLink: ExternalLink;
	getSequels: boolean;
	seasonId: number | null | undefined;
}) {
	switch (externalLink.type) {
		case "MAL":
			return AnimeCardFactory.create({
				externalLink: externalLink,
				order: AppData.animes.size,
				getSequels: getSequels,
			});
		case "TMDB":
			switch (externalLink.mediaType) {
				case "tv":
					if (getSequels) {
						return AnimeCardFactory.create({
							externalLink: externalLink,
							order: AppData.animes.size,
							getSequels: true,
						});
					} else {
						if (seasonId == null) {
							return new BadResponse("Missing season id in getCreateAnimeTask");
						}
						return AnimeCardFactory.create({
							externalLink: {
								...externalLink,
								type: "TMDB",
								mediaType: "tv",
								seasonId: seasonId,
							},
							order: AppData.animes.size,
							getSequels: getSequels,
						});
					}
				case "movie":
					return AnimeCardFactory.create({
						externalLink: {
							...externalLink,
							type: "TMDB",
							mediaType: "movie",
						},
						order: AppData.animes.size,
						getSequels: getSequels,
					});
				default:
					return new BadResponse("Invalid media type");
			}

		default:
			return new BadResponse("Invalid external link type");
	}
}

function getSelectedAnime(
	selectedAnimeInfo: SelectedAnimeInfoType,
	searchResults: SearchResultsType,
	animeParent: Anime | undefined,
) {
	if (selectedAnimeInfo == null || !selectedAnimeInfo.type) {
		toast.error("Nothing is selected");
		return;
	}
	const typeSearchResults = searchResults[selectedAnimeInfo.type];
	if (typeSearchResults === "loading") {
		toast.error("Nothing is selected");
		return;
	}
	const selectedAnime = typeSearchResults.at(selectedAnimeInfo.index);
	if (!selectedAnime?.title) {
		console.error("Selected", selectedAnime, "has no title");
		toast.error("Selection has no title");
		return;
	}
	const selectedExtLink = selectedAnime.externalLink;
	if (!selectedExtLink) {
		toast.error("Selection has external link");
		return;
	}

	const alreadyExistingAnime = animeParent
		? animeParent.seasons.find((season) => {
				const seasonExtLink = season.externalLink;

				if (seasonExtLink.type !== "TMDB" || selectedExtLink.type !== "TMDB") {
					return (
						seasonExtLink.id === selectedExtLink.id &&
						seasonExtLink.type === selectedExtLink.type
					);
				}

				console.log({ seasonExtLink, selectedExtLink });
				return (
					seasonExtLink.id === selectedExtLink.id &&
					seasonExtLink.type === selectedExtLink.type &&
					seasonExtLink.mediaType === selectedExtLink.mediaType &&
					seasonExtLink.seasonId ===
						(selectedAnimeInfo.selectedSeasonId ?? undefined)
				);
			})
		: AppData.animes.get(
				Anime.getAnimeDbId(
					newExternalLink(selectedAnime.externalLink),
					selectedAnime.title,
				),
			);
	if (alreadyExistingAnime) {
		toast.error(
			<span>
				<b>{selectedAnime.title}</b> has already been added with name:
				<br></br>
				<b>{alreadyExistingAnime.title}</b>
			</span>,
		);
		return;
	}
	return selectedAnime;
}
