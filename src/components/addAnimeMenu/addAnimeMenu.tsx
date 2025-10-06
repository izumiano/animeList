import { useState } from "react";
import LocalDB from "../../indexedDb/indexedDb";
import Anime from "../../models/anime";
import SearchResults from "./searchResults";
import "./addAnimeMenu.css";
import { toast } from "react-toastify";
import AppData from "../../appData";
import fileIcon from "../../assets/file.png";
import AnimeSearch from "../../external/search/animeSearch";
import type { SeasonDetails } from "../../external/responses/SeasonDetails";
import AnimeCardFactory from "../../external/factories/animeCardFactory";
import BadResponse from "../../external/responses/badResponse";
import { allSuccess, showError, sleepFor } from "../../utils/utils";
import ProgressButton, {
  type ProgressButtonState,
} from "../generic/progress/progressButton";
import { newExternalLink } from "../../models/externalLink";
import ExternalRequest from "../../external/externalRequest";

const AddAnimeMenu = ({
  addAnime,
  isOpen,
  setIsOpenState,
}: {
  addAnime: (anime: Anime, params?: { doScroll: boolean }) => void;
  isOpen: boolean;
  setIsOpenState: (isOpen: boolean) => void;
}) => {
  const [searchResults, setSearchResultsState] = useState<
    SeasonDetails[] | "loading"
  >([]);
  const [selectedAnimeIndex, setSelectedAnimeIndexState] = useState<
    number | null
  >(null);
  const [addAnimeProgressState, setAddAnimeProgressState] =
    useState<ProgressButtonState>({ progress: 0, state: "enabled" });

  const isOpenClass = isOpen ? "open" : "";

  return (
    <>
      <div
        id="thingToClose"
        className={`${isOpenClass}`}
        onClick={() => {
          setIsOpenState(false);
        }}
        style={{
          animation: `${
            isOpen ? "opacityOpenThing" : "opacityCloseThing"
          } 0.4s forwards`,
        }}
      ></div>
      <div
        id="addAnimeMenu"
        className={`flexColumn shimmerBackground ${isOpenClass}`}
      >
        <div id="addAnimeInputs" className="flexRow margin">
          <input
            id="addAnimeSearch"
            type="text"
            placeholder="Search"
            onChange={(event) => {
              const text = event.target.value;
              setSearchResultsState("loading");
              setSelectedAnimeIndexState(null);
              AnimeSearch.search(text, ({ seasons, externalType }) => {
                switch (externalType) {
                  case "MAL":
                    setSearchResultsState(seasons);
                    break;
                }
              });
            }}
          ></input>
          <label className="customFileInput">
            <input
              type="file"
              onChange={(event) => {
                const files = event.target.files;
                if (!files) {
                  return;
                }

                const objs: any[] = [];

                new Promise((resolve) => {
                  (async () => {
                    for (const file of files) {
                      const obj = JSON.parse(await file.text());
                      for (const o of obj) {
                        objs.push(o);
                      }
                    }

                    objs.sort((lhs, rhs) => {
                      if (lhs.order < rhs.order) return -1;
                      return 1;
                    });

                    objs.forEach((obj, index) => {
                      obj.order = index;
                    });

                    LocalDB.doTransaction((store, db) => {
                      objs.forEach((anime: any) => {
                        anime.seasons.forEach((season: any) => {
                          season.externalLink.seasonId =
                            season.externalLink?.id;
                          season.externalLink.id = anime.externalLink?.id;
                        });
                        const newAnime = Anime.Load({
                          animeData: anime,
                          justAdded: false,
                        });
                        db.saveAnime(newAnime, store).onsuccess = () => {
                          addAnime(newAnime, { doScroll: false });
                        };
                      });

                      return null;
                    });
                    resolve(null);
                  })();
                });
              }}
            />
            <img src={fileIcon}></img>
          </label>
        </div>

        <div className="scroll">
          <SearchResults
            searchResults={searchResults}
            selectedAnimeIndex={selectedAnimeIndex}
            setSelectedAnimeIndexState={setSelectedAnimeIndexState}
          />
          <div className="addButtonSpacer addButtonProps"></div>
        </div>

        <ProgressButton
          state={addAnimeProgressState}
          disabled={selectedAnimeIndex === null}
          className={`addButton addButtonProps ${
            addAnimeProgressState.state === "loading" ? "loading" : ""
          }`}
          onClick={() => {
            if (selectedAnimeIndex === null || searchResults === "loading") {
              toast.error("Nothing is selected");
              return;
            }

            const selectedAnime = searchResults[selectedAnimeIndex];
            if (!selectedAnime.title) {
              console.error("Selected", selectedAnime, "has no title");
              toast.error("Selection has no title");
              return;
            }
            const alreadyExistingAnime = AppData.animes.get(
              Anime.getAnimeDbId(
                newExternalLink(selectedAnime.externalLink),
                selectedAnime.title
              )
            );
            if (alreadyExistingAnime) {
              toast.error(
                <span>
                  <b>{selectedAnime.title}</b> has already been added with name:
                  <br></br>
                  <b>{alreadyExistingAnime.title}</b>
                </span>
              );
              return;
            }

            new Promise((resolve) => {
              (async () => {
                const createAnimeTask = AnimeCardFactory.create({
                  animeExternalLink: newExternalLink(
                    selectedAnime.externalLink
                  ),
                  order: AppData.animes.size,
                  getSequels: true,
                });

                if (createAnimeTask instanceof BadResponse) {
                  showError(createAnimeTask);
                  resolve(null);
                  return;
                }

                createAnimeTask.onProgressUpdate = ({
                  progress,
                  maxProgress,
                }) => {
                  setAddAnimeProgressState({
                    progress: progress / (maxProgress - 1), // remove 1 from max so we can actually see progress bar reach the end
                    state: "loading",
                  });
                };

                const anime = await createAnimeTask.start();

                if (anime instanceof Error || !anime) {
                  setAddAnimeProgressState({ progress: 0, state: "enabled" });
                  showError(anime);
                  resolve(null);
                  return;
                }

                await sleepFor(500);

                LocalDB.doTransaction(
                  (store, db) => {
                    return db.saveAnime(anime, store);
                  },
                  {
                    onSuccess: () => {
                      const addAnimeSearchElement = document.getElementById(
                        "addAnimeSearch"
                      ) as HTMLInputElement;
                      addAnimeSearchElement.value = "";
                      setAddAnimeProgressState({
                        progress: 0,
                        state: "enabled",
                      });
                      setSearchResultsState([]);
                      setSelectedAnimeIndexState(null);
                      setIsOpenState(false);
                      addAnime(anime);

                      allSuccess(anime.seasons, {
                        forEach: async (season) =>
                          ExternalRequest.updateAnimeSeasonStatus(
                            season,
                            anime.title,
                            { showToastOnSuccess: false, allowAbort: false }
                          ),
                        successMessage: (
                          <span>
                            Successfully added <b>{anime.title}</b> to MAL
                          </span>
                        ),
                        failMessage: (
                          <span>
                            Failed adding <b>{anime.title}</b> to MAL
                          </span>
                        ),
                      });
                    },
                  }
                );
                resolve(null);
              })();
            });
          }}
        >
          Add
        </ProgressButton>
      </div>
    </>
  );
};

export default AddAnimeMenu;
