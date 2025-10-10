import type { Page } from "../Home";
import type Anime from "../models/anime";
import Image from "./generic/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
import { toast } from "react-toastify";

const DetailsPage = ({
  animes,
  currentPage,
  setCurrentPageState,
}: {
  animes: Map<string, Anime>;
  currentPage: Page;
  setCurrentPageState: (page: Page) => void;
}) => {
  const anime = useRef<Anime>(null);

  function setCurrentAnime() {
    function handleWrongInputs(errorMessage?: ReactNode) {
      if (errorMessage) {
        toast.error(errorMessage);
        history.pushState(null, "", "/");

        if (currentPage === "details") {
          setCurrentPageState("main");
        }
      }
    }

    if (!window.location.pathname.startsWith("/details/")) {
      handleWrongInputs();
      return false;
    }

    const id = /\/details\/(?<id>[^/?#]+)/g.exec(window.location.pathname)
      ?.groups?.id;
    if (!id) {
      handleWrongInputs(<span>Missing id in url</span>);
      return false;
    }

    const currentAnime = animes.get(id);
    if (!currentAnime) {
      handleWrongInputs(
        <span>
          Invalid id <b>{id}</b> in url
        </span>
      );
      return false;
    }

    anime.current = currentAnime;

    return true;
  }

  const didUpdateAnime = setCurrentAnime();

  return (
    <div
      className={`detailsPage ${
        currentPage === "details" && didUpdateAnime ? "show" : "hide"
      }`}
    >
      {anime.current ? (
        <InternalDetailsPage anime={anime.current}></InternalDetailsPage>
      ) : null}
    </div>
  );
};

const InternalDetailsPage = ({ anime }: { anime: Anime }) => {
  const [index, setIndex] = useState(
    anime.getFirstSeasonNotWatched().seasonNumber - 1
  );

  useEffect(() => {
    setIndex(anime.getFirstSeasonNotWatched().seasonNumber - 1);
  }, [anime]);

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
    <>
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
                      src={
                        seasonExternalLink.type == "MAL" ? malLogo : tmdbLogo
                      }
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
    </>
  );
};

export default DetailsPage;
