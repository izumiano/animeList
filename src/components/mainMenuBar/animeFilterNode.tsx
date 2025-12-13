import { useCallback, useId } from "react";
import {
	type AnimeFilterState,
	type SortBy,
	SortByValues,
} from "../../models/animeFilter";
import { dialogifyKey } from "../../utils/utils";
import Select from "../generic/select";
import Toggle from "../generic/toggle";
import "./animeFilterNode.css";
import {
	ExternalLinkTypeValues,
	getExternalLogo,
} from "../../models/externalLink";

const AnimeFilterNode = ({
	animeFilterState: [animeFilter, setAnimeFilterState],
	setParentScrollEnabled,
	fullScreenScrollContainerRef,
}: {
	animeFilterState: AnimeFilterState;
	setParentScrollEnabled: (enabled: boolean) => void;
	fullScreenScrollContainerRef: React.RefObject<HTMLDivElement | null>;
}) => {
	function scrollToTop() {
		fullScreenScrollContainerRef.current?.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}

	const id = useId();

	return (
		<div className="animeFilterNode margin">
			<Toggle
				label="Show Watched"
				checked={animeFilter.showWatched}
				onChange={() =>
					setAnimeFilterState(
						animeFilter.newWith("showWatched", !animeFilter.showWatched),
					)
				}
			/>
			<Toggle
				label="Show Watching"
				checked={animeFilter.showWatching}
				onChange={() =>
					setAnimeFilterState(
						animeFilter.newWith("showWatching", !animeFilter.showWatching),
					)
				}
			/>
			<Toggle
				label="Show Unwatched"
				checked={animeFilter.showUnwatched}
				onChange={() =>
					setAnimeFilterState(
						animeFilter.newWith("showUnwatched", !animeFilter.showUnwatched),
					)
				}
			/>

			<div className="flexRow spaceBetween">
				{ExternalLinkTypeValues.map((type, index) => (
					<Toggle
						key={`${id}_extTypeToggles_${index}`}
						label={
							<img
								className="extTypeToggle buttonAnim"
								src={getExternalLogo(type)}
								width={2}
							/>
						}
						checked={animeFilter.extTypeToggles[type ?? "None"]}
						showToggleSlider={false}
						onChange={() => {
							setAnimeFilterState(
								animeFilter.newWith("extTypeToggles", {
									...animeFilter.extTypeToggles,
									[type ?? "None"]: !animeFilter.extTypeToggles[type ?? "None"],
								}),
							);
						}}
					/>
				))}
			</div>

			<hr className="light" />

			<Select
				defaultValue={animeFilter.sortBy}
				dropdownAlignment="right"
				onChange={(value) => {
					scrollToTop();
					setAnimeFilterState(animeFilter.newWith("sortBy", value as SortBy));
				}}
				onOpenChange={useCallback(
					(isOpen: boolean) => setParentScrollEnabled(!isOpen),
					[setParentScrollEnabled],
				)}
				label={"Sort By"}
			>
				{SortByValues.map((option) => (
					<option key={`sortBy:${option}`} value={option}>
						{dialogifyKey(option)}
					</option>
				))}
			</Select>
		</div>
	);
};

export default AnimeFilterNode;
