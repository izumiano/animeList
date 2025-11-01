import type { Page } from "../../Home";
import type Anime from "../../models/anime";
import Image from "../generic/image";
import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from "react";
import malLogo from "../../assets/malLogo.png";
import tmdbLogo from "../../assets/tmdbLogo.png";
import SeasonPicker from "../animeCard/seasonPicker";
import {
	getSeasonDetails,
	getUrlFromExternalLink,
} from "../../models/externalLink";
import ProgressNode from "../generic/progress/progressNode";
import "./detailsPage.css";
import ExpandableText from "../generic/expandableText";
import { toast } from "react-toastify";
import useTouch, {
	type OnTouchEndType,
	type OnTouchMoveType,
} from "../../utils/useTouch";
import { fullScreenWidth } from "../../utils/utils";
import DetailsPageForm from "./detailsPageForm";
import useMultipleRef from "../../utils/useMultiple";
import { useWindowEvent } from "../../utils/useEvents";
import TabsNode from "../generic/tabsNode";
import detailsIcon from "../../assets/details.png";
import listIcon from "../../assets/list.png";
import EpisodeList from "../animeCard/episodeList";

const DetailsPage = ({
	animes,
	currentPage,
	setCurrentPageState,
}: {
	animes: Map<string, Anime>;
	currentPage: Page;
	setCurrentPageState: (page: Page) => void;
}) => {
	const anime = useRef<Anime>(null);
	const detailsPageRef = useRef<HTMLDivElement>(null);

	const goToMain = useCallback(
		(errorMessage?: ReactNode) => {
			if (errorMessage) {
				toast.error(errorMessage);
			}

			if (currentPage === "details") {
				history.pushState(null, "", "/");
				setCurrentPageState("main");
			}
		},
		[currentPage, setCurrentPageState],
	);

	function setCurrentAnime() {
		if (!window.location.pathname.startsWith("/details/")) {
			return false;
		}

		const id = /\/details\/(?<id>[^/?#]+)/g.exec(window.location.pathname)
			?.groups?.id;
		if (!id) {
			goToMain(<span>Missing id in url</span>);
			return false;
		}

		const currentAnime = animes.get(id);
		if (!currentAnime) {
			goToMain(
				<span>
					Invalid id <b>{id}</b> in url
				</span>,
			);
			return false;
		}

		anime.current = currentAnime;

		return true;
	}

	const didUpdateAnime = setCurrentAnime();

	const [touchOffset, setTouchOffsetState] = useState<number | null>(null);

	return (
		<div
			className={`detailsPage ${
				currentPage === "details" && didUpdateAnime ? "show" : "hide"
			} ${touchOffset === null ? "" : "disableTransition"}`}
			style={
				touchOffset
					? {
							left: `${touchOffset && touchOffset > 0 ? touchOffset : 0}px`,
						}
					: {}
			}
			ref={useMultipleRef(
				useTouch({
					onMove: useCallback<OnTouchMoveType>(({ totalMove }) => {
						setTouchOffsetState(totalMove.x);
					}, []),
					onEnd: useCallback<OnTouchEndType>(
						({ currentTouches, speed }) => {
							if (currentTouches.size === 0) {
								setTouchOffsetState(null);
								if (
									(touchOffset && touchOffset > fullScreenWidth / 2) ||
									speed.x > fullScreenWidth / 900
								) {
									goToMain();
								}
							}
						},
						[touchOffset, goToMain],
					),
					minX: { positive: fullScreenWidth / 60 },
				}),
				useWindowEvent(
					"scroll",
					useCallback(() => {
						const obj = {
							visual: window.visualViewport?.height,
							actual: window.outerHeight,
						};

						if ((obj.visual ?? Infinity) > obj.actual / 2) {
							window.scrollTo({ top: 0, behavior: "instant" });
						}
					}, []),
				),
			)}
		>
			<div ref={detailsPageRef}>
				{anime.current ? (
					<InternalDetailsPage
						anime={anime.current}
						scrollParent={detailsPageRef}
					></InternalDetailsPage>
				) : null}
			</div>
		</div>
	);
};

const InternalDetailsPage = ({
	anime,
	scrollParent,
}: {
	anime: Anime;
	scrollParent: React.RefObject<HTMLDivElement | null>;
}) => {
	const [index, setIndex] = useState(
		(() => {
			const season = anime.getFirstSeasonNotWatched();
			if (!season) {
				return;
			}

			return season.seasonNumber - 1;
		})(),
	);

	useEffect(() => {
		setIndex(
			(() => {
				const season = anime.getFirstSeasonNotWatched();
				if (!season) {
					return;
				}

				return season.seasonNumber - 1;
			})(),
		);
	}, [anime]);

	const [description, setDescriptionState] = useState("");
	const [isExpanded, setIsExpandedState] = useState(false);

	const selectedSeason = index != null ? anime.seasons.at(index) : undefined;
	const [selectedSeasonWatched, setSelectedSeasonWatchedState] = useState(
		selectedSeason?.watched ?? false,
	);
	const seasonExternalLink = selectedSeason?.externalLink;

	useEffect(() => {
		if (!selectedSeason) return;

		(async () => {
			const seasonDetails = await getSeasonDetails(selectedSeason, [
				"synopsis",
				"start_date",
			]);
			if (seasonDetails instanceof Error || !seasonDetails) {
				setDescriptionState("");
				return;
			}
			setDescriptionState(seasonDetails.synopsis ?? "");
		})();
	}, [selectedSeason]);

	useEffect(() => {
		setSelectedSeasonWatchedState(selectedSeason?.watched ?? false);
	}, [selectedSeason?.watched]);

	return (
		<>
			<div className="cardBase detailedCard">
				<div className="imageContainer">
					<Image src={anime.imageLink} className="animeImage" />
				</div>

				<div
					className={`detailedCardInfo flexGrow flexColumn ${
						isExpanded ? "expanded" : ""
					}`}
				>
					<div className="flexRow spaceBetween">
						<div>
							<h1 className="title flexGrow">
								<b>{anime.title}</b>
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
										<img
											src={
												seasonExternalLink.type === "MAL" ? malLogo : tmdbLogo
											}
										></img>
									</a>
								) : null}
							</h1>
							{selectedSeason ? (
								<SeasonPicker
									animeTitle={anime.title}
									seasons={anime.seasons}
									selectedSeason={selectedSeason}
									watched={selectedSeasonWatched}
									onSelect={(seasonNumber) => {
										setIndex(seasonNumber - 1);
										const newSelectedSeason = anime.seasons[seasonNumber - 1];
										newSelectedSeason.checkWatchedAll(newSelectedSeason);
										setSelectedSeasonWatchedState(newSelectedSeason.watched);
									}}
								/>
							) : null}
						</div>
						<ProgressNode
							size="3.2rem"
							alignment="right"
							className="detailedAnimeCardProgress"
						/>
					</div>
					<ExpandableText
						isExpanded={isExpanded}
						setIsExpandedState={setIsExpandedState}
						text={description}
						maxLines={4}
						className="animeSummary"
					/>
				</div>
			</div>

			<TabsNode id={anime.getAnimeDbId()} scrollParent={scrollParent.current}>
				{[
					{
						tab: <img src={detailsIcon} className="mediumIcon" />,
						content: <DetailsPageForm anime={anime} season={selectedSeason} />,
					},
					{
						tab: <img src={listIcon} className="mediumIcon" />,
						content: (
							<EpisodeList
								type="detailed"
								anime={anime}
								season={selectedSeason}
								scrollElementRef={scrollParent}
								setSeasonWatchedState={setSelectedSeasonWatchedState}
								className="largeMargin"
							/>
						),
					},
				]}
			</TabsNode>
		</>
	);
};

export default DetailsPage;
