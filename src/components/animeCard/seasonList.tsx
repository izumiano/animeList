import type AnimeSeason from "../../models/animeSeason";
import EpisodeComponent from "./episodeComponent";
import "./seasonList.css";

const SeasonList = ({
  animeTitle,
  season,
}: {
  animeTitle: string;
  season: AnimeSeason;
}) => (
  <ul className="seasonList">
    {season.episodes
      .sort((lhs, rhs) => {
        if (lhs.episodeNumber > rhs.episodeNumber) {
          return 1;
        }
        return -1;
      })
      .map((episode) => (
        <EpisodeComponent
          episode={episode}
          key={`${animeTitle}s${season.seasonNumber}e${episode.episodeNumber}`}
        />
      ))}
  </ul>
);

export default SeasonList;
