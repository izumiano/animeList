import { useId, useState } from "react";
import type { SeasonDetails } from "../../external/responses/SeasonDetails";
import {
	ExternalLinkTypeValues,
	externalLinkId,
	getExternalLogo,
	getUrlFromExternalLink,
} from "../../models/externalLink";
import Image from "../generic/image";
import LoadingSpinner from "../generic/loadingSpinner";
import type { SearchResultsType, SelectedAnimeInfoType } from "./addAnimeNode";
import "./searchResults.css";
import BadResponse from "../../external/responses/badResponse";
import type TMDBSeasonResponse from "../../external/responses/tmdbSeasonResponse";
import TMDBRequest from "../../external/tmdbRequest";
import { showError } from "../../utils/utils";
import Details from "../generic/details";

const SearchResults = ({
	searchResults,
	selectedAnimeInfo,
	setSelectedAnimeInfoState,
	getSequels,
}: {
	searchResults: SearchResultsType;
	selectedAnimeInfo: SelectedAnimeInfoType;
	setSelectedAnimeInfoState: React.Dispatch<
		React.SetStateAction<SelectedAnimeInfoType>
	>;
	getSequels: boolean;
}) => {
	const id = useId();

	return (
		<>
			{ExternalLinkTypeValues.filter(
				(type) => !!type && searchResults[type].length > 0,
			).map((externalType) => {
				return (
					<Details
						key={`${id}${externalType}`}
						title={
							<img
								src={getExternalLogo(externalType)}
								width={25}
								alt={`${externalType} logo`}
							/>
						}
						defaultIsOpen={true}
						contentClassName="typeSearchResults"
					>
						<TypeSearchResults
							// biome-ignore lint/style/noNonNullAssertion: <we are filtering out undefined in .filter>
							searchResults={searchResults[externalType!]}
							selectedAnimeInfo={selectedAnimeInfo}
							setSelectedAnimeInfoState={setSelectedAnimeInfoState}
							getSequels={getSequels}
						/>
					</Details>
				);
			})}
		</>
	);
};

function TypeSearchResults({
	searchResults,
	selectedAnimeInfo,
	setSelectedAnimeInfoState,
	getSequels,
}: {
	searchResults: SeasonDetails[] | "loading";
	selectedAnimeInfo: SelectedAnimeInfoType;
	setSelectedAnimeInfoState: React.Dispatch<
		React.SetStateAction<SelectedAnimeInfoType>
	>;
	getSequels: boolean;
}) {
	return (
		<>
			{searchResults !== "loading" ? (
				searchResults.map((result, index) => {
					return (
						<SearchResultCard
							key={`searchResults:${externalLinkId(result.externalLink, `${index}`)}`}
							seasonDetails={result}
							animeIndex={index}
							selectedAnimeInfo={selectedAnimeInfo}
							setSelectedAnimeInfoState={setSelectedAnimeInfoState}
							getSequels={getSequels}
						/>
					);
				})
			) : (
				<LoadingSpinner props={{ centered: true }} />
			)}
		</>
	);
}

function SearchResultCard({
	seasonDetails,
	animeIndex,
	selectedAnimeInfo,
	setSelectedAnimeInfoState,
	getSequels,
}: {
	seasonDetails: SeasonDetails;
	animeIndex: number;
	selectedAnimeInfo: SelectedAnimeInfoType;
	setSelectedAnimeInfoState: React.Dispatch<
		React.SetStateAction<SelectedAnimeInfoType>
	>;
	getSequels: boolean;
}) {
	const [seasons, setSeasons] = useState<
		TMDBSeasonResponse[] | "loading" | undefined
	>(undefined);

	const [selectedSeasonIndex, setSelectedSeasonIndex] = useState<number | null>(
		null,
	);

	const selected =
		selectedAnimeInfo?.type === seasonDetails.externalLink?.type &&
		selectedAnimeInfo?.index === animeIndex;

	const id = useId();

	const onClick = async () => {
		console.log("outside");
		if (
			selectedAnimeInfo?.type === seasonDetails.externalLink?.type &&
			selectedAnimeInfo?.index === animeIndex
		) {
			setSelectedAnimeInfoState(null);
			return;
		}

		setSelectedAnimeInfoState({
			index: animeIndex,
			type: seasonDetails.externalLink?.type,
			selectedSeasonId: selectedSeasonIndex,
		});

		const externalLink = seasonDetails.externalLink;
		if (
			!getSequels &&
			externalLink?.type === "TMDB" &&
			externalLink.mediaType === "tv"
		) {
			const showDetails = await TMDBRequest.getDetails(externalLink);
			setSeasons("loading");
			if (showDetails instanceof BadResponse) {
				showError(showDetails);
				setSeasons(undefined);
				setSelectedAnimeInfoState(null);
				return;
			}
			setSeasons(showDetails.seasons);
		}
	};

	return (
		<a
			onClick={(e) => {
				e.preventDefault();
				onClick();
			}}
			href={
				seasonDetails.externalLink
					? (getUrlFromExternalLink(seasonDetails.externalLink) ?? "")
					: ""
			}
			onKeyUp={(e) => e.key === "Enter" && onClick()}
			tabIndex={0}
			className={`searchResultCard button ${selected ? "selected" : ""}`}
		>
			<div>
				<Image
					src={seasonDetails.images?.jpg?.large_image_url}
					alt="show poster"
				/>
				<h2>{seasonDetails.title}</h2>
			</div>
			{selected ? (
				seasons === "loading" ? (
					<LoadingSpinner props={{ centered: true }} />
				) : seasons && seasons.length > 0 ? (
					seasons.map((season, index) => (
						<button
							type="button"
							key={`${id}${index}`}
							className={`seasonResult ${index === selectedSeasonIndex ? "selected" : ""}`}
							onClick={(event) => {
								event.stopPropagation();
								event.preventDefault();
								setSelectedSeasonIndex(index);
								setSelectedAnimeInfoState({
									index: animeIndex,
									type: seasonDetails.externalLink?.type,
									selectedSeasonId: season.season_number,
								});
							}}
						>
							{season.name}
						</button>
					))
				) : null
			) : null}
		</a>
	);
}

export default SearchResults;
