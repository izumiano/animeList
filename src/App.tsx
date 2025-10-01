import "./App.css";
import Anime from "./models/anime";
import LocalDB from "./indexedDb/indexedDb";
import { useEffect, useRef, useState } from "react";
import AppData from "./appData";
import AddAnimeMenu from "./components/addAnimeMenu/addAnimeMenu";
import { ToastContainer } from "react-toastify";
import MainPage from "./components/mainPage";

function App() {
  const [animes, setAnimesState] = useState<Map<string, Anime>>(new Map());
  const [addAnimeMenuIsOpen, setAddAnimeMenuIsOpenState] = useState(false);
  const fullScreenScrollContainerRef = useRef<HTMLDivElement>(null);

  AppData.animes = animes;

  function addAnime(anime: Anime, params?: { doScroll: boolean }) {
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

  return (
    <div>
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
      />

      <ToastContainer position="bottom-left" className="leftAlignedText" />
    </div>
  );
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

export default App;
