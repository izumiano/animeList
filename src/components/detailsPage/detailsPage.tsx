import type Anime from "../../models/anime";
import Image from "../generic/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import SeasonPicker from "../animeCard/seasonPicker";
import {
	getExternalLogo,
	getSeasonDetails,
	getUrlFromExternalLink,
} from "../../models/externalLink";
import ProgressNode from "../generic/progress/progressNode";
import "./detailsPage.css";
import ExpandableText from "../generic/expandableText";
import { formatDate } from "../../utils/utils";
import DetailsPageForm from "./detailsPageForm";
import TabsNode from "../generic/tabsNode";
import detailsIcon from "assets/details.png";
import listIcon from "assets/list.png";
import EpisodeList from "../animeCard/episodeList";
import { detailsPageValid } from "./detailsPageConsts";

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
