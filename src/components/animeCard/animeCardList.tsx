import Anime from "../../models/anime";
import AnimeCard from "./animeCard";
import "./animeCardList.css";

const AnimeCardList = ({
  animes,
  removeAnime,
}: {
  animes: Anime[];
  removeAnime: (anime: Anime) => void;
}) => (
  <ul className="animeCardList">
    {animes.map((anime) => (
      <li key={anime.order}>
        <AnimeCard anime={anime} removeAnime={removeAnime} />
      </li>
    ))}
  </ul>
);

export default AnimeCardList;
