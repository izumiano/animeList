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
				<LoadingSpinner props={{ centered: true, absolutePos: true }} />
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
		if (
			selectedAnimeInfo?.type === seasonDetails.externalLink?.type &&
			selectedAnimeInfo?.index === animeIndex
		) {
			setSelectedSeasonIndex(null);
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
			setSeasons("loading");
			const showDetails = await TMDBRequest.getDetails(externalLink);
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
		// biome-ignore lint/a11y/useSemanticElements: <nested>
		<div
			role="button"
			onClick={onClick}
			onKeyUp={(e) => e.key === "Enter" && onClick()}
			tabIndex={0}
			className={`searchResultCard button ${selected ? "selected" : ""}`}
		>
			<div className="imageContainer">
				<Image
					src={seasonDetails.images?.jpg?.large_image_url}
					alt={`${seasonDetails.title} poster`}
				/>
			</div>
			<div
				className={`overlay absolute fullWidth fullHeight flexColumn ${selected && seasons ? "darkened" : ""}`}
			>
				<div className="flexGrow scroll flexColumn mediumGap margin-horizontal marginTop">
					{selected &&
						(seasons === "loading" ? (
							<LoadingSpinner props={{ centered: true }} />
						) : (
							seasons &&
							seasons.length > 0 &&
							seasons.map((season, index) => (
								<button
									type="button"
									key={`${id}${index}`}
									className={`seasonResult ${index === selectedSeasonIndex ? "selected" : ""}`}
									onClick={(event) => {
										event.stopPropagation();
										event.preventDefault();

										if (selectedSeasonIndex === index) {
											setSelectedSeasonIndex(null);
											setSelectedAnimeInfoState({
												index: animeIndex,
												type: seasonDetails.externalLink?.type,
												selectedSeasonId: null,
											});
											return;
										}

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
						))}
				</div>
				<a
					onClick={(e) => e.stopPropagation()}
					href={
						seasonDetails.externalLink
							? (getUrlFromExternalLink(seasonDetails.externalLink) ?? "")
							: ""
					}
					target="_blank"
					rel="noopener noreferrer"
					className="cardTitle"
				>
					{seasonDetails.title}
				</a>
			</div>
		</div>
	);

	// return (
	// // biome-ignore lint/a11y/useSemanticElements: <nested button>
	// <div
	// 	onClick={(e) => {
	// 		console.log(e);
	// 		e.preventDefault();
	// 		onClick();
	// 	}}
	// 	contextMenu="hello"
	// 	// href={
	// 	// 	seasonDetails.externalLink
	// 	// 		? (getUrlFromExternalLink(seasonDetails.externalLink) ?? "")
	// 	// 		: ""
	// 	// }
	// 	role="button"
	// 	onKeyUp={(e) => e.key === "Enter" && onClick()}
	// 	tabIndex={0}
	// 	className={`searchResultCard button ${selected ? "selected" : ""}`}
	// >
	// 	<div>
	// <Image
	// 	src={seasonDetails.images?.jpg?.large_image_url}
	// 	alt="show poster"
	// />
	// 		<h2>{seasonDetails.title}</h2>
	// 	</div>
	// 	{selected ? (
	// 		seasons === "loading" ? (
	// 			<LoadingSpinner props={{ centered: true }} />
	// 		) : seasons && seasons.length > 0 ? (
	// seasons.map((season, index) => (
	// 	<button
	// type="button"
	// key={`${id}${index}`}
	// className={`seasonResult ${index === selectedSeasonIndex ? "selected" : ""}`}
	// onClick={(event) => {
	// 	event.stopPropagation();
	// 	event.preventDefault();
	// 	setSelectedSeasonIndex(index);
	// 	setSelectedAnimeInfoState({
	// 		index: animeIndex,
	// 		type: seasonDetails.externalLink?.type,
	// 		selectedSeasonId: season.season_number,
	// 	});
	// }}
	// 	>
	// 		{season.name}
	// 	</button>
	// 			))
	// 		) : null
	// 	) : null}
	// </div>
	// );
}

export default SearchResults;
