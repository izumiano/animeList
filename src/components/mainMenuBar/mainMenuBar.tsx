import type { AnimeFilterState } from "../../models/animeFilter";
import Dropdown from "../generic/dropdown";
import AddAnimeButton from "./addAnimeButton";
import AnimeFilterButton from "./animeFilterButton";
import AnimeFilterNode from "./animeFilterNode";
import "./mainMenuBar.css";

const MainMenuBar = ({
  setIsOpenState,
  animeFilterState,
}: {
  setIsOpenState: (isOpen: boolean) => void;
  animeFilterState: AnimeFilterState;
}) => {
  return (
    <div id="mainMenuBar">
      <AddAnimeButton setIsOpenState={setIsOpenState} />
      <div className="flexGrow"></div>
      <Dropdown
        alignment="right"
        backgroundColor="var(--colNeutral)"
        dropdownButton={<AnimeFilterButton />}
      >
        <AnimeFilterNode animeFilterState={animeFilterState} />
      </Dropdown>
    </div>
  );
};

export default MainMenuBar;
