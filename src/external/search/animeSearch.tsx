import type { ExternalLinkType } from "../../models/externalLink";
import { SeasonDetails } from "../responses/SeasonDetails";
import MALSearch from "./malSearch";
import BadResponse from "../responses/badResponse";
import { showError, sleepFor } from "../../utils/utils";

let abortController = new AbortController();

export default class AnimeSearch {
  public static async search(
    query: string,
    callback: (params: {
      seasons: SeasonDetails[];
      externalType: ExternalLinkType;
    }) => void,
    limit: number = 9
  ) {
    abortController.abort();
    abortController = new AbortController();

    if (query === "") {
      callback({ seasons: [], externalType: "MAL" });
      return;
    }

    if ((await sleepFor(1000, abortController.signal)).wasAborted) {
      return;
    }

    const malSearch = MALSearch.GetResults(query, limit);

    malSearch.catch((results) => {
      showError(results);
      callback({ seasons: [], externalType: "MAL" });
    });

    malSearch.then((results) => {
      if (results instanceof BadResponse) {
        showError(results);
        callback({ seasons: [], externalType: "MAL" });
        return;
      }

      callback({
        seasons: results.map((result) => SeasonDetails.create(result)),
        externalType: "MAL",
      });
    });
  }
}
