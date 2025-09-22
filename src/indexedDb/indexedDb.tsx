import { toast } from "react-toastify";
import Anime from "../models/anime";
import { sleepFor } from "../utils/utils";

const dbName = "animesDB";
const storeName = "animes";

interface TransactionResponse {
  onSuccess?: (result: unknown) => void;
  onError?: (error: DOMException | Error | null) => void;
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

      objectStore.createIndex("title", "title", { unique: false });
      objectStore.createIndex("order", "order", { unique: true });
      objectStore.createIndex("watched", "watched", { unique: true });
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
      instance: LocalDB
    ) => IDBRequest | IDBRequest[] | null,
    params?: {
      mode?: IDBTransactionMode | undefined;
    } & TransactionResponse
  ) {
    if (!this.Instance) {
      console.error("LocalDB instance undefined");
      new Promise(async (resolve) => {
        const db = await this.Create();
        this.doTransaction((store) => {
          return transaction(store, db);
        }, params);
        resolve(null);
      });
      return;
    }

    this.Instance.doTransaction(
      (store) => transaction(store, this.Instance!),
      params
    );
  }

  public doTransaction(
    transaction: (store: IDBObjectStore) => IDBRequest | IDBRequest[] | null,
    params?: {
      mode?: IDBTransactionMode | undefined;
    } & TransactionResponse
  ) {
    const mode = params?.mode ?? "readwrite";
    const request = transaction(
      this.db.transaction(storeName, mode).objectStore(storeName)
    );

    if (!request) {
      return;
    }

    if (Array.isArray(request)) {
      request.forEach((request) => addEventListeners(request, this));
      return;
    }

    addEventListeners(request, this);

    function addEventListeners(request: IDBRequest, instance: LocalDB) {
      request.addEventListener("success", (event) => {
        params?.onSuccess?.call(instance, (event.target as IDBRequest).result);
      });
      request.addEventListener("error", (event) => {
        const request = event.target as IDBRequest;
        console.error(request.error);
        params?.onError?.call(instance, request.error);
      });
    }
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

  public async deleteAnime(anime: Anime, callbacks?: TransactionResponse) {
    const key = anime.getAnimeDbId();
    this.doTransaction(
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
              onSuccess: (result) => callbacks?.onSuccess?.call(this, result),
              onError: (error) => onError(error),
            }
          );
        },
        onError: (error) => onError(error),
      }
    );

    function onError(this: any, error: DOMException | Error | null) {
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
      let index = store.index(key);

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
