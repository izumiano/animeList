import Anime from "../../models/anime";
import AnimeCard from "./animeCard";
import "./animeCardList.css";

const AnimeCardList = ({ animes }: { animes: Anime[] }) => (
  <ul className="animeCardList">
    {animes.map((anime) => (
      <li key={anime.order}>
        <AnimeCard anime={anime} />
      </li>
    ))}
  </ul>
);

export default AnimeCardList;
