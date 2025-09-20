import { useState } from "react";
import LocalDB from "../../indexedDb/indexedDb";
import testData from "../../../testData/animeListData.json";
import Anime from "../../models/anime";
import SearchResults from "./searchResults";
import "./addAnimeMenu.css";
import { toast } from "react-toastify";
import AppData from "../../appData";
import fileIcon from "../../assets/file.png";

const AddAnimeMenu = ({
  addAnime,
  isOpen,
  setIsOpenState,
}: {
  addAnime: (anime: Anime, params?: { doScroll: boolean }) => void;
  isOpen: boolean;
  setIsOpenState: (isOpen: boolean) => void;
}) => {
  const [searchResults, setSearchResultsState] = useState<Anime[]>([]);
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

              setSearchResultsState(
                text === ""
                  ? []
                  : testData
                      .filter((anime) => {
                        return anime.title
                          .replaceAll(/\s/g, "")
                          .toLowerCase()
                          .includes(text.replaceAll(/\s/g, "").toLowerCase());
                      })
                      .map((anime) => {
                        return Anime.Load(anime, true);
                      })
              );
              setSelectedAnimeIndexState(null);
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

                  console.log(objs);
                  LocalDB.doTransaction((store, db) => {
                    objs.forEach((anime: any) => {
                      const newAnime = Anime.Load(anime, false);
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
            if (selectedAnimeIndex === null) {
              toast.error("Nothing is selected");
              return;
            }

            const selectedAnime = searchResults[selectedAnimeIndex];
            const alreadyExistingAnime = AppData.animes.get(
              selectedAnime.getAnimeDbId()
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

            const newAnime = Anime.Load(selectedAnime, true);
            LocalDB.doTransaction(
              (store, db) => {
                return db.saveAnime(newAnime, store);
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
                  addAnime(newAnime);
                },
              }
            );
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
