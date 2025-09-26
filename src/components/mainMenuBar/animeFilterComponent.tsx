import type { AnimeFilterState } from "../../models/animeFilter";
import { sleepFor } from "../../utils/utils";

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
    </div>
  );
};

export default AnimeFilterComponent;
