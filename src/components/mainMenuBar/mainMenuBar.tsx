import AddAnimeButton from "./addAnimeButton";
import "./mainMenuBar.css";

const MainMenuBar = ({
  setIsOpenState,
}: {
  setIsOpenState: (isOpen: boolean) => void;
}) => {
  return (
    <div id="mainMenuBar">
      <AddAnimeButton setIsOpenState={setIsOpenState} />
    </div>
  );
};

export default MainMenuBar;
