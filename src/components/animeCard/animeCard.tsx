import "./animeCard.css";
import Image from "../generic/image";
import Anime from "../../models/anime";
import SeasonList from "./seasonList";
import SeasonPicker from "./seasonPicker";
import { useState } from "react";
import malLogo from "../../assets/malLogo.png";
import tmdbLogo from "../../assets/tmdbLogo.png";
import ExternalLink from "../../models/externalLink";

const AnimeCard = ({ anime }: { anime: Anime }) => {
  const [index, setIndex] = useState(0);
  const [watched, setWatchedState] = useState(anime.watched);

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

  return (
    <div className={`card ${watched ? "watched" : ""}`}>
      <div className="imageContainer">
        <Image src={anime.imageLink} />
      </div>

      <div className="cardInfo">
        <span className="title">
          <b>{anime.title}</b>
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
        </span>
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
        <SeasonList
          anime={anime}
          season={selectedSeason}
          onCompletionChange={updateWatchedState}
        />
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
