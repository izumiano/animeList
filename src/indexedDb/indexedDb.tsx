import { toast } from "react-toastify";
import Anime from "../models/anime";
import { sleepFor } from "../utils/utils";
import AppData from "../appData";

const dbName = "animesDB";
const storeName = "animes";

type TransactionResponseErrorTypes = DOMException | Error | null;
type TransactionResponseReturnTypes = IDBRequest | null | (IDBRequest | null)[];

interface TransactionResponse {
  onSuccess?: (result: unknown) => void;
  onError?: (
    error: TransactionResponseErrorTypes | TransactionResponseErrorTypes[]
  ) => void;
}

export default class LocalDB {
  public static Instance: LocalDB | undefined;

  private db: IDBDatabase;

  public static async Create() {
    const DBOpenRequest = window.indexedDB.open(dbName, 1);

    DBOpenRequest.onerror = (event) => {
      const target = event.target as IDBOpenDBRequest;
      console.error(
        `Could not create the '${dbName}' database`,
        `Database error: ${target.error?.message}`
      );
    };

    let animesDB: IDBDatabase | undefined;

    DBOpenRequest.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      db.onerror = () => {
        console.error(`Error creating database '${dbName}'`);
      };

      const objectStore = db.createObjectStore(storeName);

      objectStore.createIndex("order", "order", { unique: true });
    };

    DBOpenRequest.onsuccess = (event) => {
      animesDB = (event.target as IDBOpenDBRequest).result;
    };

    while (!animesDB) {
      await sleepFor(20);
    }

    this.Instance = new LocalDB(animesDB);
    return this.Instance;
  }

  private constructor(db: IDBDatabase) {
    this.db = db;
  }

  public static doTransaction(
    transaction: (
      store: IDBObjectStore,
      db: LocalDB
    ) => TransactionResponseReturnTypes,
    params?: {
      mode?: IDBTransactionMode | undefined;
    } & TransactionResponse
  ) {
    if (!this.Instance) {
      console.error("LocalDB instance undefined");
      new Promise((resolve) => {
        (async () => {
          const db = await this.Create();
          this.doTransaction((store) => {
            return transaction(store, db);
          }, params);
          resolve(null);
        })();
      });
      return;
    }

    this.Instance.doTransaction(
      (store) => transaction(store, this.Instance!),
      params
    );
  }

  public doTransaction(
    transaction: (store: IDBObjectStore) => TransactionResponseReturnTypes,
    params?: {
      mode?: IDBTransactionMode | undefined;
    } & TransactionResponse
  ) {
    const mode = params?.mode ?? "readwrite";
    const transactionResult = transaction(
      this.db.transaction(storeName, mode).objectStore(storeName)
    );

    if (!transactionResult) {
      params?.onError?.call(null, null);
      return null;
    }

    if (Array.isArray(transactionResult)) {
      const requests = transactionResult.map((request) => {
        return new Promise<any>((resolve, reject) => {
          if (!request) {
            resolve(null);
            return;
          }

          request.addEventListener("success", (event) => {
            resolve((event.target as IDBRequest).result);
          });
          request.addEventListener("error", (event) => {
            const request = event.target as IDBRequest;
            console.error(request.error);
            reject(request.error);
          });
        });
      });

      Promise.allSettled(requests)
        .then((result) => params?.onSuccess?.call(this, result))
        .catch((error: (DOMException | null)[]) => {
          params?.onError?.call(this, error);
        });

      return transactionResult;
    }

    transactionResult.addEventListener("success", (event) => {
      params?.onSuccess?.call(this, (event.target as IDBRequest).result);
    });
    transactionResult.addEventListener("error", (event) => {
      const request = event.target as IDBRequest;
      console.error(request.error);
      params?.onError?.call(this, request.error);
    });

    return transactionResult;
  }

  public saveAnime(anime: Anime, store: IDBObjectStore) {
    console.debug("Saving to local database: ", anime);
    const request = store.put(anime.toIndexedDBObj(), anime.getAnimeDbId());

    request.addEventListener("error", (event) => {
      console.error(event);
      toast.error(`Failed saving ${anime.title}`);
    });

    return request;
  }

  public deleteAnime(anime: Anime, callbacks?: TransactionResponse) {
    const key = anime.getAnimeDbId();
    return this.doTransaction(
      (store) => {
        return store.get(key);
      },
      {
        onSuccess: (result) => {
          if (result === undefined) {
            onError(new Error(`${key} not in local database`));
            return;
          }

          this.doTransaction(
            (store) => {
              return store.delete(key);
            },
            {
              onSuccess: (result) => {
                AppData.animes.delete(anime.getAnimeDbId());
                this.doTransaction(
                  (store) => {
                    return Array.from(AppData.animes.values())
                      .filter(
                        (animeToCheck) => animeToCheck.order > anime.order
                      )
                      .map((anime) => {
                        anime.runWithoutUpdatingDb(() => {
                          anime.order--;
                        });
                        return this.saveAnime(anime, store);
                      });
                  },
                  {
                    onSuccess: (result) =>
                      callbacks?.onSuccess?.call(this, result),
                    onError: (error) => onError(error),
                  }
                );
                return callbacks?.onSuccess?.call(this, result);
                // return callbacks?.onSuccess?.call(this, result);
              },
              onError: (error) => onError(error),
            }
          );
        },
        onError: (error) => onError(error),
      }
    );

    function onError(
      this: any,
      error: TransactionResponseErrorTypes | TransactionResponseErrorTypes[]
    ) {
      toast.error(
        <span>
          Failed deleting <b>{anime.title}</b>
        </span>
      );
      console.error(error);
      callbacks?.onError?.call(this, error);
    }
  }

  public async loadAllSortedBy(key: string) {
    let animesRet: Map<string, Anime> | undefined;

    this.doTransaction((store) => {
      const index = store.index(key);

      const animes: Map<string, Anime> = new Map();
      index.openCursor(null, "next").onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const anime = Anime.Load({
            animeData: cursor.value,
            justAdded: false,
            autoSave: true,
          });
          animes.set(anime.getAnimeDbId(), anime);
          cursor.continue();
        } else {
          animesRet = animes;
        }
      };

      return null;
    });

    while (!animesRet) {
      await sleepFor(20);
    }

    return animesRet;
  }
}
