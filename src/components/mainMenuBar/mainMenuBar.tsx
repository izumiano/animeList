import { useCallback } from "react";
import type { AnimeFilterState } from "../../models/animeFilter";
import Dropdown from "../generic/dropdown";
import ProgressNode from "../generic/progress/progressNode";
import AddAnimeButton from "./addAnimeButton";
import AnimeFilterButton from "./animeFilterButton";
import AnimeFilterNode from "./animeFilterNode";
import "./mainMenuBar.css";
import type { Page } from "../../Home";
import StatsButton from "./statsButton";
import SearchNode from "./searchNode";

const MainMenuBar = ({
	setIsOpenState,
	animeFilterState: [animeFilter, setAnimeFilterState],
	fullScreenScrollContainerRef,
	setCurrentPageState,
}: {
	setIsOpenState: (isOpen: boolean) => void;
	animeFilterState: AnimeFilterState;
	fullScreenScrollContainerRef: React.RefObject<HTMLDivElement | null>;
	setCurrentPageState: (page: Page) => void;
}) => {
	return (
		<div id="mainMenuBar" className="mainMenuBarProps">
			<AddAnimeButton
				setIsOpenState={setIsOpenState}
				className="menuBarButton"
			/>
			<StatsButton setCurrentPageState={setCurrentPageState} />
			<ProgressNode size={"var(--defaultItemWidth)"} />
			<div className="flexGrow"></div>
			<SearchNode
				animeFilterState={[animeFilter, setAnimeFilterState]}
				fullScreenScrollContainerRef={fullScreenScrollContainerRef}
			/>
			<Dropdown
				alignment="right"
				useDefaultButtonStyle={false}
				dropdownButton={<AnimeFilterButton />}
			>
				{useCallback(
					({
						setParentScrollEnabled,
					}: {
						setParentScrollEnabled: (enabled: boolean) => void;
					}) => (
						<AnimeFilterNode
							animeFilterState={[animeFilter, setAnimeFilterState]}
							setParentScrollEnabled={setParentScrollEnabled}
							fullScreenScrollContainerRef={fullScreenScrollContainerRef}
						/>
					),
					[animeFilter, fullScreenScrollContainerRef, setAnimeFilterState],
				)}
			</Dropdown>
		</div>
	);
};

export default MainMenuBar;
