import "./App.css";
// import testData from "../testData/animeListData.json";
import AnimeCardList from "./components/animeCard/animeCardList";
import Anime from "./models/anime";
import LocalDB from "./indexedDb/indexedDb";
import { useEffect, useState } from "react";
import AppData from "./appData";
import AddAnimeMenu from "./components/addAnimeMenu/addAnimeMenu";
import { ToastContainer } from "react-toastify";
import AddAnimeButton from "./components/addAnimeButton";

function App() {
  const [animes, setAnimesState] = useState<Map<string, Anime>>(new Map());
  const [addAnimeMenuIsOpen, setAddAnimeMenuIsOpenState] = useState(false);

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

  function removeAnime(anime: Anime) {
    animes.delete(anime.getAnimeDbId());
    setAnimesState(new Map(animes));
  }

  AppData.animes = animes;
  // Delete all animes
  // AppData.animes.forEach((anime) => {
  //   LocalDB.Instance?.deleteAnime(anime);
  // });

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
      <AddAnimeButton setIsOpenState={setAddAnimeMenuIsOpenState} />
      <AnimeCardList
        animes={Array.from(animes.values())}
        removeAnime={removeAnime}
      />
      <ToastContainer position="bottom-left" />
    </div>
  );
}

async function loadAnimes(
  db: LocalDB,
  setAnimesState: (anime: Map<string, Anime>) => void
) {
  console.debug("loading");

  // db.doTransaction((store) => {
  //   testData.forEach((anime) => {
  //     db.saveAnime(Anime.Load(anime, false), store);
  //   });

  //   return null;
  // });

  setAnimesState(await db.loadAllSortedBy("order"));
}

export default App;
