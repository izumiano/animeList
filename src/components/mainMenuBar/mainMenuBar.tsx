import type { AnimeFilterState } from "../../models/animeFilter";
import AddAnimeButton from "./addAnimeButton";
import AnimeFilterComponent from "./animeFilterComponent";
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
      <AnimeFilterComponent animeFilterState={animeFilterState} />
    </div>
  );
};

export default MainMenuBar;
