import { useRef, useState } from "react";
import type { SeasonDetails } from "../../external/responses/SeasonDetails";
import type { ProgressButtonState } from "../generic/progress/progressButton";
import AnimeSearch from "../../external/search/animeSearch";
import { importAnimes } from "./animeImport";
import SearchResults from "./searchResults";
import ProgressButton from "../generic/progress/progressButton";
import { toast } from "react-toastify";
import Anime from "../../models/anime";
import { newExternalLink } from "../../models/externalLink";
import AnimeCardFactory from "../../external/factories/animeCardFactory";
import AppData from "../../appData";
import BadResponse from "../../external/responses/badResponse";
import { allSuccess, showError, sleepFor } from "../../utils/utils";
import LocalDB from "../../indexedDb/indexedDb";
import ExternalSync from "../../external/externalSync";
import fileIcon from "../../assets/file.png";
import "./addAnimeNode.css";

type SearchResultsType = SeasonDetails[] | "loading";

export default function AddAnimeNode({
	onAddAnime,
	setIsOpenState,
	animeParent,
	className,
}: {
	onAddAnime: (anime: Anime, params?: { doScroll: boolean }) => void;
	setIsOpenState: (isOpen: boolean) => void;
	animeParent?: Anime;
	className?: string;
}) {
	const [searchResults, setSearchResultsState] = useState<SearchResultsType>(
		[],
	);
	const [selectedAnimeIndex, setSelectedAnimeIndexState] = useState<
		number | null
	>(null);
	const [addAnimeProgressState, setAddAnimeProgressState] =
		useState<ProgressButtonState>({ progress: 0, state: "enabled" });

	const addAnimeSearchElementRef = useRef<HTMLInputElement>(null);

	function addAnime(anime: Anime) {
		if (addAnimeSearchElementRef.current) {
			addAnimeSearchElementRef.current.value = "";
		}
		setAddAnimeProgressState({
			progress: 0,
			state: "enabled",
		});
		setSearchResultsState([]);
		setSelectedAnimeIndexState(null);
		setIsOpenState(false);
		onAddAnime(anime);

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

	return (
		<div className={`${animeParent ? "" : "scroll"} ${className}`}>
			<div className="addAnimeInputs flexRow margin">
				<input
					ref={addAnimeSearchElementRef}
					className="addAnimeSearch"
					type="text"
					placeholder="Search"
					onChange={(event) => {
						const text = event.target.value;
						setSearchResultsState("loading");
						setSelectedAnimeIndexState(null);
						AnimeSearch.search(text, ({ seasons, externalType }) => {
							switch (externalType) {
								case "MAL":
									setSearchResultsState(seasons);
									break;
							}
						});
					}}
				></input>
				<label className="customFileInput">
					<input
						type="file"
						onChange={(event) => {
							importAnimes(event.target.files, (anime) =>
								onAddAnime(anime, { doScroll: false }),
							);
						}}
					/>
					<img src={fileIcon}></img>
				</label>
			</div>

			<div>
				<SearchResults
					searchResults={searchResults}
					selectedAnimeIndex={selectedAnimeIndex}
					setSelectedAnimeIndexState={setSelectedAnimeIndexState}
				/>
				<div className="addButtonSpacer addButtonProps"></div>
			</div>

			<ProgressButton
				state={addAnimeProgressState}
				disabled={selectedAnimeIndex === null}
				className={`addButton addButtonProps ${
					addAnimeProgressState.state === "loading" ? "loading" : ""
				}`}
				onClick={() => {
					const selectedAnime = getSelectedAnime(
						selectedAnimeIndex,
						searchResults,
						animeParent,
					);
					if (!selectedAnime) {
						return;
					}

					new Promise((resolve) => {
						(async () => {
							const createAnimeTask = AnimeCardFactory.create({
								animeExternalLink: newExternalLink(selectedAnime.externalLink),
								order: AppData.animes.size,
								getSequels: !animeParent,
							});

							if (createAnimeTask instanceof BadResponse) {
								showError(createAnimeTask);
								resolve(null);
								return;
							}

							createAnimeTask.onProgressUpdate = ({
								progress,
								maxProgress,
							}) => {
								setAddAnimeProgressState({
									progress: progress / (maxProgress - 1), // remove 1 from max so we can actually see progress bar reach the end
									state: "loading",
								});
							};

							const anime = await createAnimeTask.start();

							if (anime instanceof Error || !anime) {
								setAddAnimeProgressState({ progress: 0, state: "enabled" });
								showError(anime);
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
						})();
					});
				}}
			>
				Add
			</ProgressButton>
		</div>
	);
}

function getSelectedAnime(
	selectedAnimeIndex: number | null,
	searchResults: SearchResultsType,
	animeParent: Anime | undefined,
) {
	if (selectedAnimeIndex == null || searchResults === "loading") {
		toast.error("Nothing is selected");
		return false;
	}

	const selectedAnime = searchResults[selectedAnimeIndex];
	if (!selectedAnime.title) {
		console.error("Selected", selectedAnime, "has no title");
		toast.error("Selection has no title");
		return false;
	}

	const alreadyExistingAnime = animeParent
		? animeParent.seasons.find(
				(season) =>
					season.externalLink.id === selectedAnime.externalLink?.id &&
					season.externalLink.type === selectedAnime.externalLink?.type,
			)
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
		return false;
	}
	return selectedAnime;
}
