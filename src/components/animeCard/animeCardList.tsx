import Anime from "../../models/anime";
import AnimeCard from "./animeCard";
import "./animeCardList.css";

const AnimeCardList = ({
  animes,
  reloadAnimes,
}: {
  animes: Anime[];
  reloadAnimes: () => void;
}) => (
  <ul className="animeCardList">
    {animes.map((anime) => (
      <li key={anime.getAnimeDbId()}>
        <AnimeCard anime={anime} reloadAnimes={reloadAnimes} />
      </li>
    ))}
  </ul>
);

export default AnimeCardList;
