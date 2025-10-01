import "./App.css";
import AnimeCardList from "./components/animeCard/animeCardList";
import Anime from "./models/anime";
import LocalDB from "./indexedDb/indexedDb";
import { useEffect, useState } from "react";
import AppData from "./appData";
import AddAnimeMenu from "./components/addAnimeMenu/addAnimeMenu";
import { ToastContainer } from "react-toastify";
import MainMenuBar from "./components/mainMenuBar/mainMenuBar";
import AnimeFilter from "./models/animeFilter";

function App() {
  const [animes, setAnimesState] = useState<Map<string, Anime>>(new Map());
  const [addAnimeMenuIsOpen, setAddAnimeMenuIsOpenState] = useState(false);
  const animeFilterState = useState(AnimeFilter.load());
  AppData.animes = animes;

  function addAnime(anime: Anime, params?: { doScroll: boolean }) {
    animes.set(anime.getAnimeDbId(), new Anime({ ...anime, autoSave: true }));
    setAnimesState(new Map(animes));

    new Anime(anime);

    const doScroll = !params ? true : false;
    if (doScroll) {
      setTimeout(() => {
        window.scrollTo({
          left: 0,
          top: document.body.scrollHeight,
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
      <MainMenuBar
        setIsOpenState={setAddAnimeMenuIsOpenState}
        animeFilterState={animeFilterState}
      />

      <AnimeCardList
        animes={Array.from(animes.values())}
        reloadAnimes={reloadAnimes}
        animeFilter={animeFilterState[0]}
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
