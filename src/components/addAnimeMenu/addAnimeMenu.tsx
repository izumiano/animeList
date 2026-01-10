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

	const setClose = () => {
		setIsOpenState(false);
	};

	return (
		<>
			{/** biome-ignore lint/a11y/useSemanticElements: <TODO: make this accessible> */}
			<div
				role="button"
				tabIndex={0}
				className={`thingToClose ${isOpenClass}`}
				onClick={setClose}
				onKeyUp={(e) => e.key === "Enter" && setClose()}
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
