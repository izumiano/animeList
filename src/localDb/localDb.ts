import Anime from "../models/anime";
import { sleepFor } from "../utils";

const dbName = "animesDB";
const storeName = "animes";

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

  public doTransaction(
    callback: (store: IDBObjectStore) => void,
    mode?: IDBTransactionMode | undefined
  ) {
    mode ??= "readwrite";
    callback(this.db.transaction(storeName, mode).objectStore(storeName));
  }

  public saveAnime(anime: Anime, store: IDBObjectStore) {
    console.debug(anime);
    store.put(anime.toIndexedDBObj(), anime.getAnimeDbId()).onerror = (
      event
    ) => {
      console.error((event.target as IDBRequest).error);
    };
  }

  public async loadAllSortedBy(key: string) {
    let animesRet: Map<string, Anime> | undefined;

    this.doTransaction((store) => {
      let index = store.index(key);

      const animes: Map<string, Anime> = new Map();
      index.openCursor(null, "next").onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const anime = Anime.Load(cursor.value);
          animes.set(anime.getAnimeDbId(), anime);
          cursor.continue();
        } else {
          animesRet = animes;
        }
      };
    });

    while (!animesRet) {
      await sleepFor(20);
    }

    return animesRet;
  }
}
