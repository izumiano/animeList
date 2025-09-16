import "./App.css";
import testData from "../testData/animeListData.json";
import AnimeCardList from "./components/animeCard/animeCardList";
import Anime from "./models/anime";

function App() {
  return <AnimeCardList animes={testData as Anime[]} />;
}

export default App;
