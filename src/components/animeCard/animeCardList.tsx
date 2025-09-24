import Anime from "../../models/anime";
import AnimeCard from "./animeCard";
import "./animeCardList.css";

const AnimeCardList = ({
  animes,
  reloadAnimes: removeAnime,
}: {
  animes: Anime[];
  reloadAnimes: () => void;
}) => (
  <ul className="animeCardList">
    {animes.map((anime) => (
      <li key={anime.getAnimeDbId()}>
        <AnimeCard anime={anime} removeAnime={removeAnime} />
      </li>
    ))}
  </ul>
);

export default AnimeCardList;
