import { useId } from "react";
import type { SeasonDetails } from "../../external/responses/SeasonDetails";
import { ExternalLinkTypeValues } from "../../models/externalLink";
import Image from "../generic/image";
import LoadingSpinner from "../generic/loadingSpinner";
import type { SearchResultsType, SelectedAnimeInfoType } from "./addAnimeNode";
import "./searchResults.css";
import Details from "../generic/details";

const SearchResults = ({
	searchResults,
	selectedAnimeInfo,
	setSelectedAnimeInfoState,
}: {
	searchResults: SearchResultsType;
	selectedAnimeInfo: SelectedAnimeInfoType;
	setSelectedAnimeInfoState: (selectedAnimeInfo: SelectedAnimeInfoType) => void;
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
						title={externalType}
						defaultIsOpen={true}
						contentClassName="typeSearchResults"
					>
						<TypeSearchResults
							searchResults={searchResults[externalType!]} // we are filtering out undefined in .filter
							selectedAnimeInfo={selectedAnimeInfo}
							setSelectedAnimeInfoState={setSelectedAnimeInfoState}
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
}: {
	searchResults: SeasonDetails[] | "loading";
	selectedAnimeInfo: SelectedAnimeInfoType;
	setSelectedAnimeInfoState: (selectedAnimeInfo: SelectedAnimeInfoType) => void;
}) {
	return (
		<>
			{searchResults !== "loading" ? (
				searchResults.map((result, index) => {
					const isSelectedClass =
						selectedAnimeInfo?.type === result.externalLink?.type &&
						selectedAnimeInfo?.index === index
							? "selected"
							: "";
					return (
						<button
							key={`searchResults:${index}`}
							className={`searchResultCard ${isSelectedClass}`}
							onClick={() => {
								if (
									selectedAnimeInfo?.type === result.externalLink?.type &&
									selectedAnimeInfo?.index === index
								) {
									setSelectedAnimeInfoState(null);
									return;
								}
								setSelectedAnimeInfoState({
									index: index,
									type: result.externalLink?.type,
								});
							}}
						>
							<Image src={result.images?.jpg?.large_image_url} />
							<h2>{result.title}</h2>
						</button>
					);
				})
			) : (
				<LoadingSpinner props={{ centered: true }} />
			)}
		</>
	);
}

export default SearchResults;
