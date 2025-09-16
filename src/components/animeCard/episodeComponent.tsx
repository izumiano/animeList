import { useState } from "react";
import type AnimeEpisode from "../../models/animeEpisode";

const EpisodeComponent = ({ episode }: { episode: AnimeEpisode }) => {
  const [watched, setWatchedState] = useState(episode.watched);
  const color = watched ? "var(--colSecondaryTrans)" : "var(--colAccent)";

  return (
    <li
      className="episodeContainer"
      style={{
        background: `linear-gradient(90deg, ${color} 0%, rgba(0, 0, 0, 0))`,
      }}
      onClick={() => {
        setWatchedState(!watched);
      }}
    >
      <p className="episodeNumber">
        <b>{`${episode.episodeNumber + 1}.`}</b>
      </p>
      <p>{episode.title}</p>
    </li>
  );
};

export default EpisodeComponent;
