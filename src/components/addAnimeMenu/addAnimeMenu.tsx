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

  const isOpenClass = isOpen ? "open" : "";

  return (
    <div>
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
      <div id="addAnimeMenu" className={`flexColumn ${isOpenClass}`}>
        <div id="addAnimeInputs" className="flexRow">
          <input
            id="addAnimeSearch"
            type="text"
            placeholder="Search"
            onChange={(event) => {
              const text = event.target.value;
              setSearchResultsState("loading");
              setSelectedAnimeIndexState(null);
              AnimeSearch.search(text, ({ seasons, externalType }) => {
                console.debug(seasons);
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

                new Promise(async (resolve) => {
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
                });
              }}
            />
            <img src={fileIcon}></img>
          </label>
        </div>
        <button
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
                selectedAnime.externalLink?.type,
                selectedAnime.externalLink?.id,
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

            AnimeCardFactory.create({
              animeExternalLink: selectedAnime.externalLink,
              order: AppData.animes.size,
              getSequels: true,
              callback: (anime) => {
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
                      setSearchResultsState([]);
                      setSelectedAnimeIndexState(null);
                      setIsOpenState(false);
                      addAnime(anime);
                    },
                  }
                );
              },
            });
          }}
        >
          Add
        </button>

        <SearchResults
          searchResults={searchResults}
          selectedAnimeIndex={selectedAnimeIndex}
          setSelectedAnimeIndexState={setSelectedAnimeIndexState}
        />
      </div>
    </div>
  );
};

export default AddAnimeMenu;
