import Anime from "../../models/anime";
import AnimeSeason from "../../models/animeSeason";
import EpisodeComponent from "./episodeComponent";
import "./episodeList.css";

const EpisodeList = ({
  anime,
  season,
  onCompletionChange,
}: {
  anime: Anime;
  season: AnimeSeason;
  onCompletionChange: () => void;
}) => (
  <ul className="episodeList">
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

export default EpisodeList;
