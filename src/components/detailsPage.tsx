import type { Page } from "../Home";
import type Anime from "../models/anime";
import Image from "./generic/image";
import { useEffect, useState } from "react";
import malLogo from "../assets/malLogo.png";
import tmdbLogo from "../assets/tmdbLogo.png";
import SeasonPicker from "./animeCard/seasonPicker";
import {
  getSeasonDetails,
  getUrlFromExternalLink,
} from "../models/externalLink";
import ProgressNode from "./generic/progress/progressNode";
import "./detailsPage.css";
import ExpandableText from "./generic/expandableText";

const DetailsPage = ({
  anime,
}: // setCurrentPageState,
{
  anime: Anime;
  setCurrentPageState: (page: Page) => void;
}) => {
  const [index, setIndex] = useState(
    anime.getFirstSeasonNotWatched().seasonNumber - 1
  );

  const [description, setDescriptionState] = useState("");
  const [isExpanded, setIsExpandedState] = useState(false);

  const selectedSeason = anime.seasons[index];
  const [selectedSeasonWatched, setSelectedSeasonWatchedState] = useState(
    selectedSeason.watched
  );
  const seasonExternalLink = selectedSeason.externalLink;

  useEffect(() => {
    (async () => {
      const seasonDetails = await getSeasonDetails(selectedSeason, [
        "synopsis",
        "start_date",
      ]);
      if (seasonDetails instanceof Error || !seasonDetails) {
        setDescriptionState("");
        return;
      }
      setDescriptionState(seasonDetails.synopsis ?? "");
    })();
  }, [selectedSeason]);

  return (
    <div className="cardBase detailedCard">
      <div className="imageContainer">
        <Image src={anime.imageLink} className="animeImage" />
      </div>

      <div
        className={`detailedCardInfo flexGrow flexColumn ${
          isExpanded ? "expanded" : ""
        }`}
      >
        <div className="flexRow spaceBetween">
          <div>
            <h1 className="title flexGrow">
              <b>{anime.title}</b>
              <span style={{ color: "rgb(160, 160, 160)" }}> | </span>
              {seasonExternalLink ? (
                <a
                  href={
                    getUrlFromExternalLink(seasonExternalLink) ??
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
            <SeasonPicker
              animeTitle={anime.title}
              seasons={anime.seasons}
              selectedSeason={selectedSeason}
              watched={selectedSeasonWatched}
              onSelect={(seasonNumber) => {
                setIndex(seasonNumber - 1);
                const newSelectedSeason = anime.seasons[seasonNumber - 1];
                newSelectedSeason.checkWatchedAll(newSelectedSeason);
                setSelectedSeasonWatchedState(newSelectedSeason.watched);
              }}
            />
          </div>
          <ProgressNode size="3.2rem" alignment="right" />
        </div>
        <ExpandableText
          isExpanded={isExpanded}
          setIsExpandedState={setIsExpandedState}
          text={description}
          maxLines={5}
          className="animeSummary"
        />
      </div>
    </div>
  );
};

export default DetailsPage;
