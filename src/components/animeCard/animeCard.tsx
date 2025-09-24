import "./animeCard.css";
import Image from "../generic/image";
import Anime from "../../models/anime";
import EpisodeList from "./episodeList";
import SeasonPicker from "./seasonPicker";
import { useState } from "react";
import malLogo from "../../assets/malLogo.png";
import tmdbLogo from "../../assets/tmdbLogo.png";
import ExternalLink from "../../models/externalLink";
import trashIcon from "../../assets/bin.png";
import LocalDB from "../../indexedDb/indexedDb";

const justAddedAnimName = "justAdded";
const toRemoveAnimName = "toRemoveAnim";

const AnimeCard = ({
  anime,
  removeAnime,
}: {
  anime: Anime;
  removeAnime: () => void;
}) => {
  const [index, setIndex] = useState(0);
  const [watched, setWatchedState] = useState(anime.watched);
  const [justAdded, setJustAddedState] = useState(anime.justAdded);
  const [toBeRemoved, setToBeRemovedState] = useState(false);

  const selectedSeason = anime.seasons[index];
  const seasonExternalLink = selectedSeason.externalLink;
  const [selectedSeasonWatched, setSelectedSeasonWatchedState] = useState(
    selectedSeason.watched
  );

  function updateWatchedState() {
    const watched = anime.checkWatchedAll();

    selectedSeason.checkWatchedAll();
    setSelectedSeasonWatchedState(selectedSeason.watched);

    setWatchedState(watched);
  }

  const isWatchedClass = watched ? "watched" : "";
  const isToBeRemovedClass = toBeRemoved ? "toRemove" : "";
  const isJustAddedClass = justAdded ? "justAdded" : "";

  return (
    <div>
      <div
        className={`card ${isWatchedClass} ${isJustAddedClass} ${isToBeRemovedClass}`}
        onAnimationEnd={(event) => {
          switch (event.nativeEvent.animationName) {
            case justAddedAnimName:
              setJustAddedState(false);
              anime.justAdded = false;
              break;
            case toRemoveAnimName:
              removeAnime();
              break;

            default:
              break;
          }
        }}
      >
        <div className="imageContainer">
          <Image src={anime.imageLink} className="animeImage" />
        </div>

        <div className="cardInfo">
          <div className={`flexRow`}>
            <h1 className="title flexGrow">
              <b>{anime.order}</b>
              <span style={{ color: "rgb(160, 160, 160)" }}> | </span>
              {seasonExternalLink ? (
                <a
                  href={
                    getUrl(seasonExternalLink, anime.externalLink) ??
                    "javascript:undefined"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={seasonExternalLink.type == "MAL" ? malLogo : tmdbLogo}
                  ></img>
                </a>
              ) : null}
            </h1>
            <button
              className="transparentButton"
              onClick={() => {
                console.debug("deleting", anime);
                LocalDB.Instance?.deleteAnime(anime, {
                  onSuccess: () => {
                    setToBeRemovedState(true);
                  },
                });
              }}
            >
              <img src={trashIcon} width="25"></img>
            </button>
          </div>
          <SeasonPicker
            animeTitle={anime.title}
            seasons={anime.seasons}
            selectedSeasonWatched={selectedSeasonWatched}
            onSelect={(seasonNumber) => {
              setIndex(seasonNumber - 1);
              const newSelectedSeason = anime.seasons[seasonNumber - 1];
              newSelectedSeason.checkWatchedAll(newSelectedSeason);
              setSelectedSeasonWatchedState(newSelectedSeason.watched);
            }}
          />
          <EpisodeList
            anime={anime}
            season={selectedSeason}
            onCompletionChange={updateWatchedState}
          />
        </div>
      </div>
    </div>
  );
};

function getUrl(
  externalLink: ExternalLink | null,
  animeExternalLink: ExternalLink | null = null
): string | null {
  if (!externalLink) {
    return null;
  }

  if (animeExternalLink !== null && externalLink.type === "TMDB") {
    return getUrl(animeExternalLink);
  }

  switch (externalLink.type) {
    case "MAL":
      return `https://myanimelist.net/anime/${externalLink.id}`;
    case "TMDB":
      return `https://www.themoviedb.org/tv/${externalLink.id}`;
  }
}

export default AnimeCard;
