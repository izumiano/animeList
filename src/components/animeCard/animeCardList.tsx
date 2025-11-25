import { useRef } from "react";
import type Anime from "../../models/anime";
import type AnimeFilter from "../../models/animeFilter";
import type { SortBy } from "../../models/animeFilter";
import AnimeCard from "./animeCard";
import "./animeCardList.css";
import type { Page } from "../../Home";

const AnimeCardList = ({
	animes,
	reloadAnimes,
	animeFilter,
	parentRef,
	setCurrentPageState,
}: {
	animes: Anime[];
	reloadAnimes: () => void;
	animeFilter: AnimeFilter;
	parentRef: React.RefObject<HTMLDivElement | null>;
	setCurrentPageState: (page: Page) => void;
}) => {
	const listRef = useRef<HTMLUListElement>(null);

	return (
		<ul ref={listRef} className="animeCardList">
			{getAnimesSorted(animes, animeFilter.sortBy).map((anime) => (
				<li key={anime.getAnimeDbId()}>
					<AnimeCard
						anime={anime}
						reloadAnimes={reloadAnimes}
						animeFilter={animeFilter}
						listRef={listRef}
						scrollElementRef={parentRef}
						setCurrentPageState={setCurrentPageState}
					/>
				</li>
			))}
		</ul>
	);
};

function getAnimesSorted(animes: Anime[], sortBy: SortBy) {
	switch (sortBy) {
		case "userOrder":
			return animes;
		case "dateStarted":
			return animes.sort((lhs, rhs) => {
				const dateStartComp = compareDates(lhs.dateStarted, rhs.dateStarted);
				if (dateStartComp !== 0) {
					return dateStartComp;
				}

				const dateFinishComp = compareDates(lhs.dateFinished, rhs.dateFinished);
				if (dateFinishComp !== 0) {
					return dateFinishComp;
				}

				if (lhs.order < rhs.order) {
					return -1;
				}
				return 1;
			});
		case "dateFinished":
			return animes.sort((lhs, rhs) => {
				const dateFinishComp = compareDates(lhs.dateFinished, rhs.dateFinished);
				if (dateFinishComp !== 0) {
					return dateFinishComp;
				}

				const dateStartComp = compareDates(lhs.dateStarted, rhs.dateStarted);
				if (dateStartComp !== 0) {
					return dateStartComp;
				}

				if (lhs.order < rhs.order) {
					return -1;
				}
				return 1;
			});
	}
}

function compareDates(
	lhs: Date | null | undefined,
	rhs: Date | null | undefined,
) {
	if (!lhs && !rhs) {
		return 0;
	}

	if (!lhs) {
		return 1;
	}

	if (!rhs) {
		return -1;
	}

	if (lhs < rhs) {
		return 1;
	}
	if (lhs > rhs) {
		return -1;
	}
	return 0;
}

export default AnimeCardList;
