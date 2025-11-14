import "./animeCard.css";
import Image from "../generic/image";
import Anime from "../../models/anime";
import EpisodeList from "./episodeList";
import SeasonPicker from "./seasonPicker";
import { useEffect, useRef, useState } from "react";
import trashIcon from "assets/bin.png";
import plusIcon from "assets/plus.png";
import minusIcon from "assets/minus.png";
import LocalDB from "../../indexedDb/indexedDb";
import type AnimeFilter from "../../models/animeFilter";
import {
	allSuccess,
	dvwToPx,
	isElementInViewport,
	removeDiacritics,
	removeNonAlphanumeric,
	remToPx,
	showError,
	waitForNextFrame,
} from "../../utils/utils";
import Dropdown from "../generic/dropdown";
import ConfirmationDropdown from "../generic/confirmationDropdown";
import { useOtherElementEvent } from "../../utils/useEvents";
import {
	getExternalLogo,
	getUrlFromExternalLink,
} from "../../models/externalLink";
import ExternalSync from "../../external/externalSync";
import AddAnimeNode from "../addAnimeMenu/addAnimeNode";
import AnimeCardFactory from "../../external/factories/animeCardFactory";
import BadResponse from "../../external/responses/badResponse";
import { toast } from "react-toastify";
import RefreshButton from "../generic/progress/refreshButton";
import type { Page } from "../../Home";

const isOnScreenTolerance = remToPx(17);

const justAddedAnimName = "justAddedAnim";
const toRemoveAnimName = "toRemoveAnim";

const AnimeCard = ({
	anime,
	reloadAnimes,
	animeFilter,
	listRef,
	scrollElementRef,
	setCurrentPageState,
}: {
	anime: Anime;
	reloadAnimes: () => void;
	animeFilter: AnimeFilter;
	listRef: React.RefObject<HTMLUListElement | null>;
	scrollElementRef: React.RefObject<HTMLDivElement | null>;
	setCurrentPageState: (page: Page) => void;
}) => {
	const cardRef = useRef<HTMLDivElement>(null);
	const [index, setIndex] = useState(
		(() => {
			const season = anime.getFirstSeasonNotWatched();
			if (!season) {
				return;
			}

			return season.seasonNumber - 1;
		})(),
	);
	const [watched, setWatchedState] = useState(anime.watched);
	const [justAdded, setJustAddedState] = useState(anime.justAdded);
	const [toBeRemoved, setToBeRemovedState] = useState(false);
	const [animating, setAnimating] = useState(false);

	const [seasons, setSeasonsState] = useState(anime.seasons);

	const selectedSeason = index != null ? seasons[index] : undefined;
	const seasonExternalLink = selectedSeason?.externalLink;
	const _selectedSeasonWatched = selectedSeason?.watched ?? false;
	const [selectedSeasonWatched, setSelectedSeasonWatchedState] = useState(
		_selectedSeasonWatched,
	);

	const shouldBeEnabled = checkShouldBeEnabled(anime, animeFilter);
	const [visible, setVisibility] = useState(shouldBeEnabled);

	const [isOnScreen, setIsOnScreen] = useState<boolean | null>(null);
	const [animeSortBy, setAnimeSortByState] = useState(animeFilter.sortBy);

	useEffect(() => {
		setSeasonsState(anime.seasons);
	}, [anime.seasons]);

	useEffect(() => {
		setWatchedState(anime.watched);
	}, [anime.watched]);

	useEffect(() => {
		setSelectedSeasonWatchedState(_selectedSeasonWatched);
	}, [_selectedSeasonWatched]);

	function updateWatchedState() {
		const watched = anime.checkWatchedAll();

		selectedSeason?.checkWatchedAll();
		setSelectedSeasonWatchedState(selectedSeason?.watched ?? false);

		setWatchedState(watched);

		const newEnabled = checkShouldBeEnabled(anime, animeFilter);
		if (shouldBeEnabled !== newEnabled) {
			setVisibility(newEnabled);
			setAnimating(true);
		}
	}

	if (shouldBeEnabled !== visible) {
		setAnimating(true);
		setVisibility(shouldBeEnabled);
	}

	function checkIsOnScreen() {
		const card = cardRef.current;
		setIsOnScreen(
			(card && isElementInViewport(card, isOnScreenTolerance)) === true &&
				(cardRef.current?.getBoundingClientRect().height ?? 0) >
					(remToPx(16.5) + dvwToPx(1)) * 0.3, // (anime card height + padding) * 0.3
		);
	}

	useOtherElementEvent({
		element: scrollElementRef,
		eventTypes: ["scroll", "resize"],
		callback: checkIsOnScreen,
	});

	useOtherElementEvent({
		element: listRef,
		eventTypes: ["resize"],
		callback: checkIsOnScreen,
	});

	if (animeFilter.sortBy !== animeSortBy) {
		waitForNextFrame().then(() => {
			checkIsOnScreen();
			setAnimeSortByState(animeFilter.sortBy);
		});
	}

	useEffect(checkIsOnScreen, [animating, isOnScreen]);

	if (!shouldBeEnabled && !animating) {
		return <div ref={cardRef}></div>;
	}

	const isWatchedClass = watched ? "watched" : "";
	const isToBeRemovedClass =
		toBeRemoved || (!visible && animating) ? "toRemove" : "";
	const isJustAddedClass =
		justAdded || (visible && animating) ? "justAdded" : "";

	return (
		<div
			ref={cardRef}
			className={`cardBase card ${isWatchedClass} ${isJustAddedClass} ${isToBeRemovedClass}`}
			onAnimationEnd={(event) => {
				switch (event.animationName) {
					case justAddedAnimName:
						anime.justAdded = false;
						setAnimating(false);
						setJustAddedState(false);
						break;
					case toRemoveAnimName:
						setAnimating(false);
						reloadAnimes();
						break;

					default:
						break;
				}
			}}
		>
			{isOnScreen ? (
				<>
					<div className="imageContainer">
						<Image src={anime.imageLink} className="animeImage" />
					</div>

					<div className="cardInfo">
						<div className={`flexRow`}>
							<h1 className="title flexGrow">
								<a
									className={`reset hoverableText titleHover ${
										watched ? "watched" : ""
									}`}
									onClick={(event) => {
										event.preventDefault();
										history.pushState(
											null,
											"",
											`/details/${anime.getAnimeDbId()}/`,
										);
										setCurrentPageState("details");
									}}
									href={`/details/${anime.getAnimeDbId()}/`}
								>
									<b>{anime.title}</b>
								</a>
								<span style={{ color: "rgb(160, 160, 160)" }}> | </span>
								{seasonExternalLink ? (
									<a
										href={
											getUrlFromExternalLink(seasonExternalLink) ??
											"javascript:undefined"
										}
										target="_blank"
										rel="noopener noreferrer"
									>
										<img src={getExternalLogo(seasonExternalLink.type)}></img>
									</a>
								) : null}
							</h1>
							<Dropdown
								alignment="right"
								buttonClass="transparentBackground"
								useDefaultButtonStyle={true}
								dropdownButton={<img src={trashIcon} width="25"></img>}
								listRef={listRef}
								scrollElementRef={scrollElementRef}
							>
								{({ closeDropdown }) => (
									<ConfirmationDropdown
										title="Really Delete?"
										confirmMessage="Delete"
										confirmClass="deleteConfirm"
										dismissMessage="Keep"
										closeDropdown={closeDropdown}
										onConfirm={() => {
											LocalDB.doTransaction((_, db) =>
												db.deleteAnime(anime, {
													onSuccess: () => {
														allSuccess(seasons, {
															forEach: async (season) =>
																ExternalSync.deleteAnimeSeason(
																	season,
																	anime.title,
																	{
																		showToastOnSuccess: false,
																	},
																),
															successMessage: (
																<span>
																	Successfully deleted <b>{anime.title}</b> from{" "}
																	{anime.externalLink.type}.
																</span>
															),
															failMessage: (
																<span>
																	Failed deleting <b>{anime.title}</b> from{" "}
																	{anime.externalLink.type}.
																</span>
															),
														});
														setToBeRemovedState(true);
													},
												}),
											);
										}}
									/>
								)}
							</Dropdown>
						</div>
						<div className="flexRow mediumGap">
							{selectedSeason ? (
								<SeasonPicker
									animeTitle={anime.title}
									seasons={seasons}
									selectedSeason={selectedSeason}
									watched={selectedSeasonWatched}
									listRef={listRef}
									scrollElementRef={scrollElementRef}
									onSelect={(seasonNumber) => {
										setIndex(seasonNumber - 1);
										const newSelectedSeason = seasons[seasonNumber - 1];
										newSelectedSeason.checkWatchedAll(newSelectedSeason);
										setSelectedSeasonWatchedState(newSelectedSeason.watched);
									}}
								/>
							) : null}
							<Dropdown
								dropdownButton={<img src={plusIcon}></img>}
								buttonClass="circleButton"
								className="verticalCenter"
								alignment="left"
								listRef={listRef}
								scrollElementRef={scrollElementRef}
								disableScroll={true}
								dropdownContentClassName="relative"
							>
								{({ closeDropdown }) => (
									<AddAnimeNode
										onAddAnimes={(newAnimes) => {
											const seasons = newAnimes.at(0)?.seasons;
											if (!seasons) {
												return;
											}

											anime.addSeasons(seasons, {
												atIndex: (index ?? -1) + 1,
											});
											setSeasonsState(anime.seasons);
											setWatchedState(anime.watched);
											setIndex((index ?? -1) + 1);
											setSelectedSeasonWatchedState(false);
										}}
										setIsOpenState={(isOpen) => !isOpen && closeDropdown()}
										animeParent={anime}
										className="addSeasonDropdown"
									/>
								)}
							</Dropdown>
							{index != null && selectedSeason != null ? (
								<>
									<Dropdown
										dropdownButton={<img src={minusIcon}></img>}
										buttonClass="circleButton"
										className="verticalCenter"
										alignment="center"
										listRef={listRef}
										scrollElementRef={scrollElementRef}
									>
										{({ closeDropdown }) => (
											<ConfirmationDropdown
												title="Really delete this season?"
												confirmMessage="Delete"
												confirmClass="deleteConfirm"
												dismissMessage="Keep"
												closeDropdown={closeDropdown}
												onConfirm={() => {
													ExternalSync.deleteAnimeSeason(
														selectedSeason,
														anime.title,
													);

													anime.removeSeasonAtIndex(index);
													setSeasonsState(anime.seasons);
													setWatchedState(anime.watched);

													if (anime.seasons.length > 0) {
														const newIndex = index > 0 ? index - 1 : 0;
														setIndex(newIndex);
														setSelectedSeasonWatchedState(
															anime.seasons.at(newIndex)?.watched ?? false,
														);
													} else {
														setIndex(undefined);
													}
												}}
											/>
										)}
									</Dropdown>

									<RefreshButton
										className="circleButton refreshButton"
										onClick={async () => {
											const response = AnimeCardFactory.create({
												externalLink: selectedSeason.externalLink,
												order: 0,
												getSequels: false,
											});

											const onError = (error?: Error | null | undefined) => {
												showError(
													error,
													<span>
														Failed getting season info for{" "}
														<b>
															{anime.title} <i>{selectedSeason.title}</i>
														</b>
													</span>,
												);
											};
											if (response instanceof BadResponse) {
												onError(response);
												return;
											}

											const seasonData = await response.start();
											if (!seasonData || seasonData instanceof Error) {
												onError(seasonData);
												return;
											}

											const episodesData = seasonData.seasons
												.at(0)
												?.episodes.filter(
													(episode) =>
														episode.episodeNumber >=
														selectedSeason!.episodes.length,
												);
											if (episodesData == null) {
												onError();
												return;
											}

											if (episodesData.length === 0) {
												toast.info(
													<span>
														<b>
															{anime.title} <i>{selectedSeason.title}</i>
														</b>{" "}
														is already up to date
													</span>,
												);
												return;
											}

											selectedSeason.addEpisodes(episodesData);

											toast.info(
												<span>
													Added{" "}
													<b>
														<i>{episodesData.length}</i>
													</b>{" "}
													episodes to{" "}
													<b>
														{anime.title} <i>{selectedSeason.title}</i>
													</b>
												</span>,
											);

											setSeasonsState([...anime.seasons]);
											setSelectedSeasonWatchedState(selectedSeason.watched);
											setWatchedState(anime.watched);
										}}
									/>
								</>
							) : null}
						</div>
						{selectedSeason ? (
							<EpisodeList
								season={selectedSeason}
								type="regular"
								onCompletionChange={updateWatchedState}
							/>
						) : null}
					</div>
				</>
			) : null}
		</div>
	);
};

function checkShouldBeEnabled(anime: Anime, animeFilter: AnimeFilter) {
	if (!searchQueryMatched(anime, animeFilter.searchQuery)) {
		return false;
	}

	if (animeFilter.showWatched && anime.watched) {
		return true;
	}

	let isWatching: boolean;

	return (
		(animeFilter.showUnwatched && !anime.watched && !getIsWatching()) ||
		(animeFilter.showWatching && getIsWatching())
	);

	function getIsWatching() {
		if (isWatching === undefined) {
			isWatching = anime.watching;
		}

		return isWatching;
	}
}

function searchQueryMatched(anime: Anime, searchQuery: string) {
	if (searchQuery === "") {
		return true;
	}

	searchQuery = removeNonAlphanumeric(
		removeDiacritics(searchQuery.replace(/\s+/g, "").toLowerCase()),
	);
	const animeTitle = removeNonAlphanumeric(
		removeDiacritics(anime.title.replace(/\s+/g, "").toLowerCase()),
	);

	return animeTitle.includes(searchQuery);
}

export default AnimeCard;
