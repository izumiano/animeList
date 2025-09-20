import type Anime from "../../models/anime";
import Image from "../generic/image";
import "./searchResults.css";

const SearchResults = ({
  searchResults,
  selectedAnimeIndex,
  setSelectedAnimeIndexState,
}: {
  searchResults: Anime[];
  selectedAnimeIndex: number | null;
  setSelectedAnimeIndexState: (index: number | null) => void;
}) => {
  return (
    <div className="searchResultsContainer">
      {searchResults.map((result, index) => {
        const isSelectedClass = selectedAnimeIndex === index ? "selected" : "";
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
            <Image src={result.imageLink} />
            <h2>{result.title}</h2>
          </button>
        );
      })}
    </div>
  );
};

export default SearchResults;
