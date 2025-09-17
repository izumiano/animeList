import AppData from "../appData";

export type ExternalLinkType = "MAL" | "TMDB";

export default class ExternalLink {
  id: number;
  type: ExternalLinkType;

  constructor(animeDbId: string, id: number, type: ExternalLinkType) {
    this.id = id;
    this.type = type;

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
          AppData.animes.get(animeDbId)?.saveToDb();
        }
        return true;
      },
    });
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
