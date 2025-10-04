import type { AnimeFilterState } from "../../models/animeFilter";
import { sleepFor } from "../../utils/utils";
import Dropdown from "../generic/dropdown";
import ProgressNode from "../generic/progress/progressNode";
import AddAnimeButton from "./addAnimeButton";
import AnimeFilterButton from "./animeFilterButton";
import AnimeFilterNode from "./animeFilterNode";
import "./mainMenuBar.css";

let searchQueryAbortController = new AbortController();

const MainMenuBar = ({
  setIsOpenState,
  animeFilterState: [animeFilter, setAnimeFilterState],
  fullScreenScrollContainerRef,
}: {
  setIsOpenState: (isOpen: boolean) => void;
  animeFilterState: AnimeFilterState;
  fullScreenScrollContainerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  return (
    <div id="mainMenuBar" className="mainMenuBarProps">
      <AddAnimeButton setIsOpenState={setIsOpenState} />
      <ProgressNode />
      <div className="flexGrow"></div>
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
      <Dropdown
        alignment="right"
        useDefaultButtonStyle={false}
        dropdownButton={<AnimeFilterButton />}
      >
        {({ setParentScrollEnabled }) => (
          <AnimeFilterNode
            animeFilterState={[animeFilter, setAnimeFilterState]}
            setParentScrollEnabled={setParentScrollEnabled}
            fullScreenScrollContainerRef={fullScreenScrollContainerRef}
          />
        )}
      </Dropdown>
    </div>
  );
};

export default MainMenuBar;
