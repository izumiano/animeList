import { useState } from "react";
import AnimeEpisode from "../../models/animeEpisode";
import "./episodeComponent.css";

const EpisodeComponent = ({
  episode,
  onCompletionChange,
}: {
  episode: AnimeEpisode;
  onCompletionChange: () => void;
}) => {
  const [watched, setWatchedState] = useState(episode.watched);

  function setWatched(watched: boolean) {
    if (watched === episode.watched) return;

    episode.watched = watched;
    setWatchedState(watched);

    onCompletionChange();
  }

  return (
    <li
      className={`episodeContainer ${watched ? "watched" : ""}`}
      onClick={() => {
        setWatched(!watched);
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
