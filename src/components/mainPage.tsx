import { useState } from "react";
import AnimeFilter from "../models/animeFilter";
import AnimeCardList from "./animeCard/animeCardList";
import MainMenuBar from "./mainMenuBar/mainMenuBar";
import type Anime from "../models/anime";
import "./mainPage.css";
import type { Page } from "../Home";

const MainPage = ({
	animes,
	reloadAnimes,
	setIsOpenState,
	fullScreenScrollContainerRef,
	setCurrentPageState,
}: {
	animes: Anime[];
	reloadAnimes: () => void;
	setIsOpenState: (isOpen: boolean) => void;
	fullScreenScrollContainerRef: React.RefObject<HTMLDivElement | null>;
	setCurrentPageState: (page: Page) => void;
}) => {
	const animeFilterState = useState(AnimeFilter.load());

	return (
		<>
			<MainMenuBar
				setIsOpenState={setIsOpenState}
				animeFilterState={animeFilterState}
				fullScreenScrollContainerRef={fullScreenScrollContainerRef}
			/>
			<div
				ref={fullScreenScrollContainerRef}
				className="fullScreenScrollContainer"
			>
				<div className="mainMenuBarProps"></div>
				<AnimeCardList
					animes={Array.from(animes.values())}
					reloadAnimes={reloadAnimes}
					animeFilter={animeFilterState[0]}
					parentRef={fullScreenScrollContainerRef}
					setCurrentPageState={setCurrentPageState}
				/>
			</div>
		</>
	);
};

export default MainPage;
