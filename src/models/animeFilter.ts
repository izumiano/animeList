export type AnimeFilterState = [
  AnimeFilter,
  React.Dispatch<React.SetStateAction<AnimeFilter>>
];

const saveIgnoreProperties: (keyof AnimeFilter)[] = [] as const;

export default class AnimeFilter {
  showWatched: boolean;
  showWatching: boolean;
  showUnwatched: boolean;

  searchQuery: string;

  constructor({
    showWatched,
    showWatching,
    showUnwatched,
    searchQuery,
  }: {
    showWatched?: boolean;
    showWatching?: boolean;
    showUnwatched?: boolean;
    searchQuery?: string;
  }) {
    this.showWatched = showWatched ?? true;
    this.showWatching = showWatching ?? true;
    this.showUnwatched = showUnwatched ?? true;
    this.searchQuery = searchQuery ?? "";
  }

  static load() {
    const filter = new AnimeFilter({});

    (Object.keys(filter) as Array<keyof AnimeFilter>).forEach((key) => {
      if (saveIgnoreProperties.includes(key)) {
        return;
      }
      const valueStr = localStorage.getItem(key);
      if (!valueStr) {
        return;
      }
      filter.setVal(key, JSON.parse(valueStr));
    });

    return filter;
  }

  private setVal<T extends keyof AnimeFilter>(
    property: T,
    value: AnimeFilter[T]
  ) {
    this[property] = value as this[T];
  }

  newWith<T extends keyof AnimeFilter>(property: T, value: AnimeFilter[T]) {
    if (!saveIgnoreProperties.includes(property)) {
      localStorage.setItem(property, JSON.stringify(value));
    }
    this[property] = value as this[T];
    return new AnimeFilter({
      showWatched: this.showWatched,
      showWatching: this.showWatching,
      showUnwatched: this.showUnwatched,
      searchQuery: this.searchQuery,
    });
  }
}
