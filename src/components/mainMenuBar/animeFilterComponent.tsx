import {
  SortByValues,
  type AnimeFilterState,
  type SortBy,
} from "../../models/animeFilter";
import { dialogifyKey, sleepFor } from "../../utils/utils";

let searchQueryAbortController = new AbortController();

const AnimeFilterComponent = ({
  animeFilterState: [animeFilter, setAnimeFilterState],
}: {
  animeFilterState: AnimeFilterState;
}) => {
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={animeFilter.showWatched}
          onChange={() =>
            setAnimeFilterState(
              animeFilter.newWith("showWatched", !animeFilter.showWatched)
            )
          }
        />
        <span>Show Watched</span>
      </label>
      <label>
        <input
          type="checkbox"
          checked={animeFilter.showWatching}
          onChange={() =>
            setAnimeFilterState(
              animeFilter.newWith("showWatching", !animeFilter.showWatching)
            )
          }
        />
        <span>Show Watching</span>
      </label>
      <label>
        <input
          type="checkbox"
          checked={animeFilter.showUnwatched}
          onChange={() =>
            setAnimeFilterState(
              animeFilter.newWith("showUnwatched", !animeFilter.showUnwatched)
            )
          }
        />
        <span>Show Unwatched</span>
      </label>

      <input
        type="text"
        defaultValue={animeFilter.searchQuery}
        onChange={async (event) => {
          searchQueryAbortController.abort();
          searchQueryAbortController = new AbortController();
          if (
            (await sleepFor(500, searchQueryAbortController.signal)).wasAborted
          ) {
            return;
          }

          setAnimeFilterState(
            animeFilter.newWith("searchQuery", event.target.value)
          );
        }}
      ></input>

      <select
        defaultValue={animeFilter.sortBy}
        onChange={(event) => {
          setAnimeFilterState(
            animeFilter.newWith("sortBy", event.target.value as SortBy)
          );
        }}
      >
        {SortByValues.map((option) => (
          <option key={`sortBy:${option}`} value={option}>
            {dialogifyKey(option)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AnimeFilterComponent;
