import Anime from "../../models/anime";
import AccountNode from "../accountNode";
import "./addAnimeMenu.css";
import AddAnimeNode from "./addAnimeNode";

const AddAnimeMenu = ({
	addAnime,
	isOpen,
	setIsOpenState,
}: {
	addAnime: (anime: Anime, params?: { doScroll: boolean }) => void;
	isOpen: boolean;
	setIsOpenState: (isOpen: boolean) => void;
}) => {
	const isOpenClass = isOpen ? "open" : "";

	return (
		<>
			<div
				className={`thingToClose ${isOpenClass}`}
				onClick={() => {
					setIsOpenState(false);
				}}
				style={{
					animation: `${
						isOpen ? "opacityOpenThing" : "opacityCloseThing"
					} 0.4s forwards`,
				}}
			></div>
			<div
				className={`addAnimeMenu flexColumn shimmerBackground ${isOpenClass}`}
			>
				<AccountNode />
				<AddAnimeNode onAddAnime={addAnime} setIsOpenState={setIsOpenState} />
			</div>
		</>
	);
};

export default AddAnimeMenu;
