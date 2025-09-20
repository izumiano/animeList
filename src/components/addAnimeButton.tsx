import plusIcon from "../assets/plus.png";
import "./addAnimeButton.css";

const AddAnimeButton = ({
  setIsOpenState,
}: {
  setIsOpenState: (isOpen: boolean) => void;
}) => {
  return (
    <button
      className="addAnimeButton"
      onClick={() => {
        setIsOpenState(true);
      }}
    >
      <img src={plusIcon}></img>
    </button>
  );
};

export default AddAnimeButton;
