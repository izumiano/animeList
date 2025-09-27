import {
  SortByValues,
  type AnimeFilterState,
  type SortBy,
} from "../../models/animeFilter";
import { dialogifyKey } from "../../utils/utils";
import Select from "../generic/select";
import Toggle from "../generic/toggle";
import "./animeFilterNode.css";

const AnimeFilterNode = ({
  animeFilterState: [animeFilter, setAnimeFilterState],
}: {
  animeFilterState: AnimeFilterState;
}) => {
  return (
    <div className="animeFilterNode">
      <Toggle
        label="Show Watched"
        checked={animeFilter.showWatched}
        onChange={() =>
          setAnimeFilterState(
            animeFilter.newWith("showWatched", !animeFilter.showWatched)
          )
        }
      />
      <Toggle
        label="Show Watching"
        checked={animeFilter.showWatching}
        onChange={() =>
          setAnimeFilterState(
            animeFilter.newWith("showWatching", !animeFilter.showWatching)
          )
        }
      />
      <Toggle
        label="Show Unwatched"
        checked={animeFilter.showUnwatched}
        onChange={() =>
          setAnimeFilterState(
            animeFilter.newWith("showUnwatched", !animeFilter.showUnwatched)
          )
        }
      />

      <hr />

      <Select
        defaultValue={animeFilter.sortBy}
        onChange={(value) => {
          setAnimeFilterState(animeFilter.newWith("sortBy", value as SortBy));
        }}
      >
        {SortByValues.map((option) => (
          <option key={`sortBy:${option}`} value={option}>
            {dialogifyKey(option)}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default AnimeFilterNode;
