export type AnimeFilterState = [
  AnimeFilter,
  React.Dispatch<React.SetStateAction<AnimeFilter>>
];

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
    showWatched: boolean;
    showWatching: boolean;
    showUnwatched: boolean;
    searchQuery?: string;
  }) {
    this.showWatched = showWatched;
    this.showWatching = showWatching;
    this.showUnwatched = showUnwatched;
    this.searchQuery = searchQuery ?? "";
  }

  newWith<T extends keyof AnimeFilter>(property: T, value: AnimeFilter[T]) {
    this[property] = value as this[T];
    return new AnimeFilter({
      showWatched: this.showWatched,
      showWatching: this.showWatching,
      showUnwatched: this.showUnwatched,
      searchQuery: this.searchQuery,
    });
  }
}
