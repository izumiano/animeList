import type { SeasonDetails } from "../../external/responses/SeasonDetails";
import Image from "../generic/image";
import LoadingSpinner from "../generic/loadingSpinner";
import "./searchResults.css";

const SearchResults = ({
	className,
	searchResults,
	selectedAnimeIndex,
	setSelectedAnimeIndexState,
}: {
	className?: string;
	searchResults: SeasonDetails[] | "loading";
	selectedAnimeIndex: number | null;
	setSelectedAnimeIndexState: (index: number | null) => void;
}) => {
	return (
		<div className={`searchResultsContainer ${className}`}>
			{searchResults !== "loading" ? (
				searchResults.map((result, index) => {
					const isSelectedClass =
						selectedAnimeIndex === index ? "selected" : "";
					return (
						<button
							key={`searchResults:${index}`}
							className={`searchResultCard ${isSelectedClass}`}
							onClick={() => {
								if (selectedAnimeIndex === index) {
									setSelectedAnimeIndexState(null);
									return;
								}
								setSelectedAnimeIndexState(index);
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
		</div>
	);
};

export default SearchResults;
