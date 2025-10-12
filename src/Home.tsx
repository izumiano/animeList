import "./App.css";
import Anime from "./models/anime";
import LocalDB from "./indexedDb/indexedDb";
import { useEffect, useRef, useState } from "react";
import AppData from "./appData";
import AddAnimeMenu from "./components/addAnimeMenu/addAnimeMenu";
import MainPage from "./components/mainPage";
import DetailsPage from "./components/detailsPage/detailsPage";
import { toast } from "react-toastify";
import LoadingSpinner from "./components/generic/loadingSpinner";

export type Page = "main" | "details";

function Home({ startPage }: { startPage?: Page }) {
  const [currentPage, setCurrentPageState] = useState(startPage ?? "main");

  const [animes, setAnimesState] = useState<Map<string, Anime> | undefined>();
  const [addAnimeMenuIsOpen, setAddAnimeMenuIsOpenState] = useState(false);
  const fullScreenScrollContainerRef = useRef<HTMLDivElement>(null);

  function addAnime(anime: Anime, params?: { doScroll: boolean }) {
    if (!animes) {
      toast.error(
        <span>
          Failed adding <b>{anime.title}</b> because <i>animes</i> map was
          undefined
        </span>
      );
      return;
    }

    animes.set(anime.getAnimeDbId(), new Anime({ ...anime, autoSave: true }));
    setAnimesState(new Map(animes));

    new Anime(anime);

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

  // Delete all animes
  // LocalDB.Instance?.doTransaction(
  //   (store) => {
  //     return Array.from(AppData.animes.values()).map((anime) => {
  //       return store.delete(anime.getAnimeDbId());
  //     });
  //   },
  //   { onError: () => toast.error("Failed deleting all") }
  // );

  useEffect(() => {
    (async () => {
      const db = await LocalDB.Create();
      loadAnimes(db, setAnimesState);
    })();
  }, []);

  useHandlePageState(currentPage, setCurrentPageState);

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
      <DetailsPage
        animes={animes}
        currentPage={currentPage}
        setCurrentPageState={setCurrentPageState}
      />

      <AddAnimeMenu
        addAnime={addAnime}
        isOpen={addAnimeMenuIsOpen}
        setIsOpenState={setAddAnimeMenuIsOpenState}
      />

      <MainPage
        animes={Array.from(animes.values())}
        reloadAnimes={reloadAnimes}
        setIsOpenState={setAddAnimeMenuIsOpenState}
        fullScreenScrollContainerRef={fullScreenScrollContainerRef}
        setCurrentPageState={setCurrentPageState}
      />
    </div>
  );
}

function useHandlePageState(
  currentPage: Page,
  setCurrentPageState: (page: Page) => void
) {
  useEffect(() => {
    const checkPath = () => {
      if (
        /\/details\/(?<id>[^/?#]+)/g.exec(window.location.pathname)?.groups?.id
      ) {
        if (currentPage !== "details") {
          setCurrentPageState("details");
        }
      } else {
        if (currentPage !== "main") {
          setCurrentPageState("main");
        }
      }
    };

    checkPath();

    window.addEventListener("popstate", checkPath);

    return () => {
      window.removeEventListener("popstate", checkPath);
    };
  }, [currentPage, setCurrentPageState]);
}

async function loadAnimes(
  db: LocalDB,
  setAnimesState: (anime: Map<string, Anime>) => void
) {
  console.debug("loading");

  const animes = await db.loadAllSortedBy("order");
  Array.from(animes.values()).forEach((anime, index) => {
    if (index !== anime.order) {
      console.warn(
        anime.title,
        `has the wrong order ${anime.order} fixing to ${index}`
      );
      anime.order = index;
    }
  });

  setAnimesState(animes);
}

export default Home;
