import Anime from "../../models/anime";
import AnimeSeason from "../../models/animeSeason";
import EpisodeComponent from "./episodeComponent";
import "./seasonList.css";

const SeasonList = ({
  anime,
  season,
  onCompletionChange,
}: {
  anime: Anime;
  season: AnimeSeason;
  onCompletionChange: () => void;
}) => (
  <ul className="seasonList">
    {season.episodes.map((episode) => (
      <EpisodeComponent
        episode={episode}
        onCompletionChange={onCompletionChange}
        key={`${anime.externalLink?.type ?? anime.title}${
          anime.externalLink?.id
        }s${season.seasonNumber}e${episode.episodeNumber}`}
      />
    ))}
  </ul>
);

export default SeasonList;
