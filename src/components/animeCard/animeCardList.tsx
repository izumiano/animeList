import Anime from "../../models/anime";
import type AnimeFilter from "../../models/animeFilter";
import AnimeCard from "./animeCard";
import "./animeCardList.css";

const AnimeCardList = ({
  animes,
  reloadAnimes,
  animeFilter,
}: {
  animes: Anime[];
  reloadAnimes: () => void;
  animeFilter: AnimeFilter;
}) => (
  <ul className="animeCardList">
    {animes.map((anime) => (
      <li key={anime.getAnimeDbId()}>
        <AnimeCard
          anime={anime}
          reloadAnimes={reloadAnimes}
          animeFilter={animeFilter}
        />
      </li>
    ))}
  </ul>
);

export default AnimeCardList;
