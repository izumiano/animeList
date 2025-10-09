import LocalDB from "../../indexedDb/indexedDb";
import Anime from "../../models/anime";

export function importAnimes(
  files: FileList | null,
  onAnimeSaved: (anime: Anime) => void
) {
  if (!files) {
    return;
  }

  const animes: any[] = [];

  new Promise((resolve) => {
    (async () => {
      for (const file of files) {
        const obj = JSON.parse(await file.text());
        for (const o of obj) {
          animes.push(o);
        }
      }

      animes.sort((lhs, rhs) => {
        if (lhs.order < rhs.order) return -1;
        return 1;
      });

      LocalDB.doTransaction((store, db) => {
        animes.forEach((anime, index) => {
          anime.order = index;
          anime.dateStarted = thirdMilleniumSecondsToUnixMilli(
            anime.dateStarted
          );
          anime.dateFinished = thirdMilleniumSecondsToUnixMilli(
            anime.dateFinished
          );

          anime.seasons.forEach((season: any) => {
            season.dateStarted = thirdMilleniumSecondsToUnixMilli(
              season.dateStarted
            );
            season.dateFinished = thirdMilleniumSecondsToUnixMilli(
              season.dateFinished
            );
            if (season.externalLink.type === "TMDB") {
              season.externalLink.seasonId = season.externalLink?.id;
              season.externalLink.id = anime.externalLink?.id;
            }
          });
          const newAnime = Anime.Load({
            animeData: anime,
            justAdded: false,
          });
          db.saveAnime(newAnime, store).onsuccess = () => {
            onAnimeSaved(newAnime);
          };
        });

        return null;
      });
      resolve(null);
    })();
  });
}

function thirdMilleniumSecondsToUnixMilli(
  thirdMilleniumTimestamp: number | undefined | null
) {
  if (!thirdMilleniumTimestamp) {
    return;
  }

  return thirdMilleniumTimestamp * 1000 + 978307200000;
}
