import type { ExternalLinkToValueType } from "./externalLink";

export type AnimeFilterState = [
	AnimeFilter,
	React.Dispatch<React.SetStateAction<AnimeFilter>>,
];

export const SortByValues = [
	"userOrder",
	"dateStarted",
	"dateFinished",
] as const;
export type SortBy = (typeof SortByValues)[number];

const saveIgnoreProperties: (keyof AnimeFilter)[] = [] as const;

type ExtTypeToggles = ExternalLinkToValueType<boolean> & { None: boolean };

export default class AnimeFilter {
	showWatched: boolean;
	showWatching: boolean;
	showUnwatched: boolean;

	searchQuery: string;

	extTypeToggles: ExtTypeToggles;

	sortBy: SortBy;

	constructor({
		showWatched,
		showWatching,
		showUnwatched,
		searchQuery,
		extTypeToggles,
		sortBy,
	}: {
		showWatched?: boolean;
		showWatching?: boolean;
		showUnwatched?: boolean;
		searchQuery?: string;
		extTypeToggles?: ExtTypeToggles;
		sortBy?: SortBy;
	}) {
		this.showWatched = showWatched ?? true;
		this.showWatching = showWatching ?? true;
		this.showUnwatched = showUnwatched ?? true;
		this.searchQuery = searchQuery ?? "";
		this.extTypeToggles = extTypeToggles ?? {
			MAL: true,
			TMDB: true,
			None: true,
		};
		this.sortBy = sortBy ?? "userOrder";
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
		value: AnimeFilter[T],
	) {
		this[property] = value as this[T];
	}

	newWith<T extends keyof AnimeFilter>(property: T, value: AnimeFilter[T]) {
		if (!saveIgnoreProperties.includes(property)) {
			localStorage.setItem(property, JSON.stringify(value));
		}
		this.setVal(property, value);
		return new AnimeFilter({
			showWatched: this.showWatched,
			showWatching: this.showWatching,
			showUnwatched: this.showUnwatched,
			searchQuery: this.searchQuery,
			extTypeToggles: this.extTypeToggles,
			sortBy: this.sortBy,
		});
	}
}
