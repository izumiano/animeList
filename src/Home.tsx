import "./App.css";
import Anime from "./models/anime";
import LocalDB from "./indexedDb/indexedDb";
import { useEffect, useRef, useState } from "react";
import AppData, { devUtils } from "./appData";
import AddAnimeMenu from "./components/addAnimeMenu/addAnimeMenu";
import MainPage from "./components/mainPage";
import LoadingSpinner from "./components/generic/loadingSpinner";
import { showError } from "./utils/utils";
import PageManager from "./components/generic/pageManager";
import DetailsPage from "./components/detailsPage/detailsPage";
import { detailsPageValid } from "./components/detailsPage/detailsPageConsts";

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
				newAnimes.map((anime) => <b>{anime.title}</b>),
				<span className="flexColumn">
					<i>{<b>animes</b>} map was undefined.</i>{" "}
					<span>The following will not show until refresh:</span>
				</span>,
				{ showInProgressNode: true },
			);
			return;
		}

		newAnimes.forEach((anime) => {
			animes.set(anime.getAnimeDbId(), new Anime({ ...anime, autoSave: true }));
		});
		setAnimesState(new Map(animes));

		const doScroll = !params ? true : false;
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
				<LoadingSpinner />
			</div>
		);
	}
	AppData.animes = animes;

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
