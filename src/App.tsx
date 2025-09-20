import "./App.css";
// import testData from "../testData/animeListData.json";
import AnimeCardList from "./components/animeCard/animeCardList";
import Anime from "./models/anime";
import LocalDB from "./indexedDb/indexedDb";
import { useEffect, useState } from "react";
import AppData from "./appData";

function App() {
  const [animes, setAnimesState] = useState<Map<string, Anime>>(new Map());

  function removeAnime(anime: Anime) {
    animes.delete(anime.getAnimeDbId());
    setAnimesState(new Map(animes));
  }

  AppData.animes = animes;

  console.debug(animes.size);

  useEffect(() => {
    (async () => {
      const db = await LocalDB.Create();
      loadAnimes(db, setAnimesState);
    })();
  }, []);

  return (
    <AnimeCardList
      animes={Array.from(animes.values())}
      removeAnime={removeAnime}
    />
  );
}

async function loadAnimes(
  db: LocalDB,
  setAnimesState: (anime: Map<string, Anime>) => void
) {
  console.debug("loading");

  // db.doTransaction((store) => {
  //   testData.forEach((anime) => {
  //     db.saveAnime(Anime.Load(anime), store);
  //   });

  //   return null;
  // });

  setAnimesState(await db.loadAllSortedBy("order"));
}

export default App;
