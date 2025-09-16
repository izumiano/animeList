import type Anime from "../../models/anime";
import AnimeCard from "./animeCard";
import "./animeCardList.css";

const AnimeCardList = ({ animes }: { animes: Anime[] }) => (
  <ul className="animeCardList">
    {animes.map((anime) => (
      <li key={anime.order}>
        <AnimeCard
          title={anime.title}
          seasons={anime.seasons}
          watched={anime.watched}
          imageLink={anime.imageLink}
          externalLink={anime.externalLink}
          order={anime.order}
        />
      </li>
    ))}
  </ul>
);

export default AnimeCardList;
