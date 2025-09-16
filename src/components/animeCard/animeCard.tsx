import "./animeCard.css";
import Image from "../generic/image";
import type Anime from "../../models/anime";
import SeasonList from "./seasonList";
import SeasonPicker from "./seasonPicker";
import { useState } from "react";
import malLogo from "../../assets/malLogo.png";
import tmdbLogo from "../../assets/tmdbLogo.png";
import type ExternalLink from "../../models/externalLink";

const AnimeCard = ({
  title,
  seasons,
  watched,
  imageLink,
  externalLink,
}: Anime) => {
  const [index, setIndex] = useState(0);

  const color = watched ? "var(--colSecondaryTrans)" : "var(--colPrimary)";

  seasons = seasons.concat().sort((lhs, rhs) => {
    if (lhs.seasonNumber > rhs.seasonNumber) {
      return 1;
    }
    return -1;
  });

  const seasonExternalLink = seasons[index].externalLink;

  return (
    <div className="card" style={{ background: color }}>
      <div className="imageContainer">
        <Image src={imageLink} />
      </div>

      <div className="cardInfo">
        <span className="title">
          <b>{title}</b>
          <span style={{ color: "rgb(160, 160, 160)" }}> | </span>
          {seasonExternalLink ? (
            <a
              href={
                getUrl(seasonExternalLink, externalLink) ??
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
          animeTitle={title}
          seasons={seasons}
          selectedSeasonIndex={index}
          onSelect={(seasonNumber) => {
            setIndex(seasonNumber - 1);
          }}
        />
        <SeasonList animeTitle={title} season={seasons[index]} />
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
