import {
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import type Anime from "../../models/anime";
import {
	externalLinkId,
	getExternalLogo,
	getSeasonDetails,
	getUrlFromExternalLink,
} from "../../models/externalLink";
import SeasonPicker from "../animeCard/seasonPicker";
import Image from "../generic/image";
import ProgressNode from "../generic/progress/progressNode";
import "./detailsPage.css";
import detailsIcon from "assets/details.png";
import listIcon from "assets/list.png";
import ExternalSync from "../../external/externalSync";
import { AbortedOperation, formatDate } from "../../utils/utils";
import EpisodeList from "../animeCard/episodeList";
import ExpandableText from "../generic/expandableText";
import LoadingSpinner from "../generic/loadingSpinner";
import StarRating from "../generic/starRating";
import TabsNode from "../generic/tabsNode";
import { detailsPageValid } from "./detailsPageConsts";
import DetailsPageForm from "./detailsPageForm";

export default function DetailsPage({
	animes,
	pageFailed,
}: {
	animes: Map<string, Anime>;
	pageFailed: (errorMessage?: ReactNode) => void;
}) {
	const anime = useRef<Anime>(null);
	const detailsPageRef = useRef<HTMLDivElement>(null);

	function setCurrentAnime() {
		if (!window.location.pathname.startsWith("/details/")) {
			return false;
		}

		const id = detailsPageValid(window.location.pathname).value;
		if (!id) {
			pageFailed(<span>Missing id in url</span>);
			return false;
		}

		const currentAnime = animes.get(id);
		if (!currentAnime) {
			pageFailed(
				<span>
					Invalid id <b>{id}</b> in url
				</span>,
			);
			return false;
		}

		anime.current = currentAnime;

		return true;
	}

	setCurrentAnime();

	return (
		<div ref={detailsPageRef}>
			{anime.current ? (
				<InternalDetailsPage
					anime={anime.current}
					scrollParent={detailsPageRef}
				></InternalDetailsPage>
			) : null}
		</div>
	);
}

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
	const [airedDate, setAiredDateState] = useState("");
	const [isExpanded, setIsExpandedState] = useState(false);

	const selectedSeason = index != null ? anime.seasons.at(index) : undefined;
	const [selectedSeasonWatched, setSelectedSeasonWatchedState] = useState(
		selectedSeason?.watched ?? false,
	);
	const seasonExternalLink = selectedSeason?.externalLink;

	const [updatingScoreIds, setUpdatingScoreIdsState] = useState(new Set());

	useEffect(() => {
		if (!selectedSeason) return;

		(async () => {
			const seasonDetails = await getSeasonDetails(selectedSeason, [
				"synopsis",
				"start_date",
			]);
			if (seasonDetails instanceof Error || !seasonDetails) {
				setDescriptionState("");
				setAiredDateState("");
				return;
			}
			setDescriptionState(seasonDetails.synopsis ?? "");
			setAiredDateState(formatDate(seasonDetails.airedDate, "d mmm yyyy", ""));
		})();
	}, [selectedSeason]);

	useEffect(() => {
		setSelectedSeasonWatchedState(selectedSeason?.watched ?? false);
	}, [selectedSeason?.watched]);

	const id = externalLinkId(selectedSeason?.externalLink, anime.title);
	const setSelectedSeasonScore = useCallback(
		async (score: number | null) => {
			if (!selectedSeason) {
				return;
			}
			selectedSeason.score = score;

			setUpdatingScoreIdsState((prev) => {
				const newSet = new Set(prev);
				newSet.add(id);
				return newSet;
			});
			const task = await ExternalSync.updateSeasonStatus(
				selectedSeason,
				anime,
				{ doPushTask: false, showToastOnSuccess: false },
			);
			if (task?.failed) {
				task.showError();
			}
			if (task?.result instanceof AbortedOperation) {
				return;
			}
			setUpdatingScoreIdsState((prev) => {
				const newSet = new Set(prev);
				newSet.delete(id);
				return newSet;
			});
		},
		[selectedSeason, anime, id],
	);

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
					<div className="flexRow">
						<div className="flexGrow">
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
										<img src={getExternalLogo(seasonExternalLink.type)}></img>
									</a>
								) : null}
							</h1>
							{selectedSeason ? (
								<div className="flexRow mediumGap">
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
									<StarRating
										defaultValue={selectedSeason.score}
										onChange={setSelectedSeasonScore}
									/>
									{updatingScoreIds.size > 0 ? (
										<LoadingSpinner
											props={{ size: "0.5rem", centered: true }}
										/>
									) : null}
								</div>
							) : null}
						</div>
						<ProgressNode
							size="3.2rem"
							alignment="right"
							className="detailedAnimeCardProgress"
						/>
						<span className="airedDate">{airedDate}</span>
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

			<TabsNode scrollParent={scrollParent.current}>
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
