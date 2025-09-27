import plusIcon from "../../assets/plus.png";
import "./addAnimeButton.css";

const AddAnimeButton = ({
  setIsOpenState,
}: {
  setIsOpenState: (isOpen: boolean) => void;
}) => {
  return (
    <button
      className="menuBarButton"
      onClick={() => {
        setIsOpenState(true);
      }}
    >
      <img src={plusIcon}></img>
    </button>
  );
};

export default AddAnimeButton;
