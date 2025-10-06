import "./animeCard.css";
import Image from "../generic/image";
import Anime from "../../models/anime";
import EpisodeList from "./episodeList";
import SeasonPicker from "./seasonPicker";
import { useEffect, useRef, useState } from "react";
import malLogo from "../../assets/malLogo.png";
import tmdbLogo from "../../assets/tmdbLogo.png";
import trashIcon from "../../assets/bin.png";
import LocalDB from "../../indexedDb/indexedDb";
import type AnimeFilter from "../../models/animeFilter";
import {
  isElementInViewport,
  removeDiacritics,
  removeNonAlphanumeric,
  remToPx,
  waitForNextFrame,
} from "../../utils/utils";
import Dropdown from "../generic/dropdown";
import ConfirmationDropdown from "../generic/confirmationDropdown";
import { useOtherElementEvent } from "../../utils/useEvents";
import type { ExternalLink } from "../../models/externalLink";

const isOnScreenTolerance = remToPx(17);

const justAddedAnimName = "justAddedAnim";
const toRemoveAnimName = "toRemoveAnim";

const AnimeCard = ({
  anime,
  reloadAnimes,
  animeFilter,
  listRef,
  scrollElementRef,
}: {
  anime: Anime;
  reloadAnimes: () => void;
  animeFilter: AnimeFilter;
  listRef: React.RefObject<HTMLUListElement | null>;
  scrollElementRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(
    anime.getFirstSeasonNotWatched().seasonNumber - 1
  );
  const [watched, setWatchedState] = useState(anime.watched);
  const [justAdded, setJustAddedState] = useState(anime.justAdded);
  const [toBeRemoved, setToBeRemovedState] = useState(false);
  const [animating, setAnimating] = useState(false);

  const selectedSeason = anime.seasons[index];
  const seasonExternalLink = selectedSeason.externalLink;
  const [selectedSeasonWatched, setSelectedSeasonWatchedState] = useState(
    selectedSeason.watched
  );

  const shouldBeEnabled = checkShouldBeEnabled(anime, animeFilter);
  const [visible, setVisibility] = useState(shouldBeEnabled);

  const [isOnScreen, setIsOnScreen] = useState<boolean | null>(null);
  const [animeSortBy, setAnimeSortByState] = useState(animeFilter.sortBy);

  function updateWatchedState() {
    const watched = anime.checkWatchedAll();

    selectedSeason.checkWatchedAll();
    setSelectedSeasonWatchedState(selectedSeason.watched);

    setWatchedState(watched);

    const newEnabled = checkShouldBeEnabled(anime, animeFilter);
    if (shouldBeEnabled !== newEnabled) {
      setVisibility(newEnabled);
      setAnimating(true);
    }
  }

  if (shouldBeEnabled !== visible) {
    setAnimating(true);
    setVisibility(shouldBeEnabled);
  }

  function checkIsOnScreen() {
    const card = cardRef.current;
    setIsOnScreen(
      (card && isElementInViewport(card, isOnScreenTolerance)) === true
    );
  }

  useOtherElementEvent({
    element: scrollElementRef,
    eventTypes: ["scroll", "resize"],
    callback: checkIsOnScreen,
  });

  useOtherElementEvent({
    element: listRef,
    eventTypes: ["resize"],
    callback: checkIsOnScreen,
  });

  if (animeFilter.sortBy !== animeSortBy) {
    waitForNextFrame().then(() => {
      checkIsOnScreen();
      setAnimeSortByState(animeFilter.sortBy);
    });
  }

  useEffect(checkIsOnScreen, [animating, isOnScreen]);

  if (!shouldBeEnabled && !animating) {
    return <div ref={cardRef}></div>;
  }

  const isWatchedClass = watched ? "watched" : "";
  const isToBeRemovedClass =
    toBeRemoved || (!visible && animating) ? "toRemove" : "";
  const isJustAddedClass =
    justAdded || (visible && animating) ? "justAdded" : "";

  return (
    <div
      ref={cardRef}
      className={`card ${isWatchedClass} ${isJustAddedClass} ${isToBeRemovedClass}`}
      onAnimationEnd={(event) => {
        switch (event.animationName) {
          case justAddedAnimName:
            anime.justAdded = false;
            setAnimating(false);
            setJustAddedState(false);
            break;
          case toRemoveAnimName:
            setAnimating(false);
            reloadAnimes();
            break;

          default:
            break;
        }
      }}
    >
      {isOnScreen ? (
        <>
          <div className="imageContainer">
            <Image src={anime.imageLink} className="animeImage" />
          </div>

          <div className="cardInfo">
            <div className={`flexRow`}>
              <h1 className="title flexGrow">
                <b>{anime.title}</b>
                <span style={{ color: "rgb(160, 160, 160)" }}> | </span>
                {seasonExternalLink ? (
                  <a
                    href={getUrl(seasonExternalLink) ?? "javascript:undefined"}
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
              <Dropdown
                alignment="right"
                buttonClass="transparentBackground"
                useDefaultButtonStyle={true}
                dropdownButton={<img src={trashIcon} width="25"></img>}
                listRef={listRef}
                scrollElementRef={scrollElementRef}
              >
                {({ closeDropdown }) => (
                  <ConfirmationDropdown
                    title="Really Delete?"
                    confirmMessage="Delete"
                    confirmClass="deleteConfirm"
                    dismissMessage="Don't"
                    closeDropdown={closeDropdown}
                    onConfirm={() => {
                      console.log("deleting", anime);
                      LocalDB.doTransaction((_, db) =>
                        db.deleteAnime(anime, {
                          onSuccess: () => {
                            setToBeRemovedState(true);
                          },
                        })
                      );
                    }}
                  />
                )}
              </Dropdown>
            </div>
            <SeasonPicker
              animeTitle={anime.title}
              seasons={anime.seasons}
              selectedSeason={selectedSeason}
              watched={selectedSeasonWatched}
              listRef={listRef}
              scrollElementRef={scrollElementRef}
              onSelect={(seasonNumber) => {
                console.log({ seasonNumber });
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
        </>
      ) : null}
    </div>
  );
};

function checkShouldBeEnabled(anime: Anime, animeFilter: AnimeFilter) {
  if (!searchQueryMatched(anime, animeFilter.searchQuery)) {
    return false;
  }

  if (animeFilter.showWatched && anime.watched) {
    return true;
  }

  let isWatching: boolean;

  return (
    (animeFilter.showUnwatched && !anime.watched && !getIsWatching()) ||
    (animeFilter.showWatching && getIsWatching())
  );

  function getIsWatching() {
    if (isWatching === undefined) {
      isWatching = anime.watching;
    }

    return isWatching;
  }
}

function searchQueryMatched(anime: Anime, searchQuery: string) {
  if (searchQuery === "") {
    return true;
  }

  searchQuery = removeNonAlphanumeric(
    removeDiacritics(searchQuery.replace(/\s+/g, "").toLowerCase())
  );
  const animeTitle = removeNonAlphanumeric(
    removeDiacritics(anime.title.replace(/\s+/g, "").toLowerCase())
  );

  return animeTitle.includes(searchQuery);
}

function getUrl(externalLink: ExternalLink) {
  if (externalLink.type === undefined) {
    return null;
  }

  switch (externalLink.type) {
    case "MAL":
      return `https://myanimelist.net/anime/${externalLink.id}`;
    case "TMDB":
      return `https://www.themoviedb.org/tv/${externalLink.id}`;
  }
}

export default AnimeCard;
