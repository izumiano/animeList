import "./App.css";
import { lazy, useEffect, useRef, useState } from "react";
import AppData, { devUtils } from "./appData";
import AddAnimeMenu from "./components/addAnimeMenu/addAnimeMenu";
import { detailsPageValid } from "./components/detailsPage/detailsPageConsts";
import LoadingSpinner from "./components/generic/loadingSpinner";
import PageManager from "./components/generic/pageManager";
import MainPage from "./components/mainPage";
import LocalDB from "./indexedDb/indexedDb";
import Anime from "./models/anime";
import { externalLinkId } from "./models/externalLink";
import { showError } from "./utils/utils";

export type Page = "main" | "details";

function Home({ startPage }: { startPage?: Page }) {
	const [animes, setAnimesState] = useState<Map<string, Anime> | undefined>();
	const [addAnimeMenuIsOpen, setAddAnimeMenuIsOpenState] = useState(false);
	const fullScreenScrollContainerRef = useRef<HTMLDivElement>(null);

	function addAnimes(newAnimes: Anime[], params?: { doScroll: boolean }) {
		if (newAnimes.length === 0) {
			return;
		}

		if (!animes) {
			showError(
				newAnimes.map((anime) => (
					<b
						key={`addAnimesErr:${externalLinkId(anime.externalLink, anime.order + anime.title)}`}
					>
						{anime.title}
					</b>
				)),
				<span className="flexColumn">
					<i>{<b>animes</b>} map was undefined.</i>{" "}
					<span>The following will not show until refresh:</span>
				</span>,
			);
			return;
		}

		newAnimes.forEach((anime) => {
			animes.set(anime.getAnimeDbId(), new Anime({ ...anime, autoSave: true }));
		});
		setAnimesState(new Map(animes));

		const doScroll = !params;
		if (doScroll) {
			setTimeout(() => {
				fullScreenScrollContainerRef.current?.scrollTo({
					top: fullScreenScrollContainerRef.current.scrollHeight,
					behavior: "smooth",
				});
			}, 500);
		}
	}

	function reloadAnimes() {
		setAnimesState(new Map(AppData.animes));
	}

	useEffect(() => {
		(async () => {
			const db = await LocalDB.Create();
			const animes = await loadAnimes(db, setAnimesState);

			devUtils?.deleteAllAnimes(animes, setAnimesState);
			devUtils?.setAnimesToTestState(animes, setAnimesState);
		})();
	}, []);

	if (!animes) {
		return (
			<div className="flexRow horizontalCenterItems verticalCenterItems fullScreenScrollContainer">
				<LoadingSpinner props={{ centered: true, absolutePos: true }} />
			</div>
		);
	}
	AppData.animes = animes;

	const DetailsPagePromise = import("./components/detailsPage/detailsPage");
	const DetailsPage = lazy(() => DetailsPagePromise);

	return (
		<div>
			<PageManager startPage={startPage}>
				{({ setCurrentPage, pageFailed }) => ({
					main: {
						node: (
							<>
								<AddAnimeMenu
									addAnimes={addAnimes}
									isOpen={addAnimeMenuIsOpen}
									setIsOpenState={setAddAnimeMenuIsOpenState}
								/>
								<MainPage
									animes={Array.from(animes.values())}
									reloadAnimes={reloadAnimes}
									setIsOpenState={setAddAnimeMenuIsOpenState}
									fullScreenScrollContainerRef={fullScreenScrollContainerRef}
									setCurrentPageState={setCurrentPage}
								/>
							</>
						),
					},
					details: {
						checkValidity: detailsPageValid,
						node: <DetailsPage animes={animes} pageFailed={pageFailed} />,
					},
				})}
			</PageManager>
		</div>
	);
}

async function loadAnimes(
	db: LocalDB,
	setAnimesState: (anime: Map<string, Anime>) => void,
) {
	console.debug("loading");

	const animes = await db.loadAllSortedBy("order");
	Array.from(animes.values()).forEach((anime, index) => {
		if (index !== anime.order) {
			console.warn(
				anime.title,
				`has the wrong order ${anime.order} fixing to ${index}`,
			);
			anime.order = index;
		}
	});

	setAnimesState(animes);
	return animes;
}

export default Home;
