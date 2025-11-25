import type Anime from "../../models/anime";
import AccountNode from "../accountNode";
import "./addAnimeMenu.css";
import AddAnimeNode from "./addAnimeNode";

const AddAnimeMenu = ({
	addAnimes,
	isOpen,
	setIsOpenState,
}: {
	addAnimes: (anime: Anime[], params?: { doScroll: boolean }) => void;
	isOpen: boolean;
	setIsOpenState: (isOpen: boolean) => void;
}) => {
	const isOpenClass = isOpen ? "open" : "";

	return (
		<>
			<nav
				className={`thingToClose ${isOpenClass}`}
				onClick={() => {
					setIsOpenState(false);
				}}
				style={{
					animation: `${
						isOpen ? "opacityOpenThing" : "opacityCloseThing"
					} 0.4s forwards`,
				}}
			></nav>
			<div
				className={`addAnimeMenu flexColumn shimmerBackground ${isOpenClass}`}
			>
				<AccountNode />
				<AddAnimeNode
					onAddAnimes={addAnimes}
					setIsOpenState={setIsOpenState}
					className="marginTop"
				/>
			</div>
		</>
	);
};

export default AddAnimeMenu;
