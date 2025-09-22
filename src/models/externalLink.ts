import AppData from "../appData";

export type ExternalLinkType = "MAL" | "TMDB";

export default class ExternalLink {
  id: number;
  type: ExternalLinkType;

  constructor(params: {
    animeDbId: string;
    id: number;
    type: ExternalLinkType;
    autoSave?: boolean;
  }) {
    this.id = params.id;
    this.type = params.type;

    if (params.autoSave ?? false) {
      return new Proxy(this, {
        set: function (
          target: ExternalLink,
          property: keyof ExternalLink,
          value: any
        ) {
          if (target[property] !== value) {
            console.debug(
              `ExternalLink Property '${property}' changed from'`,
              target[property],
              "to",
              value
            );
            Reflect.set(target, property, value);
            AppData.animes.get(params.animeDbId)?.saveToDb();
          }
          return true;
        },
      });
    }
  }

  toIndexedDBObj() {
    const objCopy: { [key: string]: any } = {};
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        if (key === "animeDbId") continue;

        objCopy[key] = this[key];
      }
    }
    return objCopy;
  }
}
