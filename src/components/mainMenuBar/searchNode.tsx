import { useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import type { AnimeFilterState } from "../../models/animeFilter";
import { sleepFor } from "../../utils/utils";

import "./searchNode.css";
import magnifyingGlass from "assets/magnifyingGlass.png";
import removeIcon from "assets/remove.png";

let searchQueryAbortController = new AbortController();

export default function SearchNode({
	animeFilterState: [animeFilter, setAnimeFilterState],
	fullScreenScrollContainerRef,
}: {
	animeFilterState: AnimeFilterState;
	fullScreenScrollContainerRef: React.RefObject<HTMLDivElement | null>;
}) {
	const [isOpen, setIsOpenState] = useState(animeFilter.searchQuery !== "");

	const currentSearchRef = useRef(animeFilter.searchQuery);
	const searchButtonRef = useRef<HTMLButtonElement>(null);
	const dismissButtonRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const onDismiss = (event: MouseEvent | KeyboardEvent) => {
		event.stopPropagation();
		if (!isOpen) {
			return;
		}

		setAnimeFilterState(animeFilter.newWith("searchQuery", ""));

		const currInput = inputRef.current;
		if (currInput) {
			currInput.value = "";
			currentSearchRef.current = "";
			currInput.focus();
		}
	};

	const dismissButtonIsDisabled = !isOpen || currentSearchRef.current === "";

	return (
		<button
			className={`menuBarButton searchNode ${isOpen ? "open" : ""}`}
			type="button"
			onClick={() => {
				setIsOpenState(true);
				inputRef.current?.focus();
			}}
			ref={searchButtonRef}
		>
			<input
				className="searchNode"
				type="text"
				ref={inputRef}
				defaultValue={animeFilter.searchQuery}
				placeholder="Search"
				onClick={(event) => {
					event.stopPropagation();
				}}
				onBlur={(event) => {
					const relatedTarget = event.relatedTarget;
					if (
						relatedTarget !== searchButtonRef.current &&
						relatedTarget !== dismissButtonRef.current &&
						currentSearchRef.current === ""
					) {
						setIsOpenState(false);
					}
				}}
				onChange={async (event) => {
					searchQueryAbortController.abort();
					searchQueryAbortController = new AbortController();
					currentSearchRef.current = event.target.value;
					if (
						(await sleepFor(500, searchQueryAbortController.signal)).wasAborted
					) {
						return;
					}

					fullScreenScrollContainerRef.current?.scrollTo({
						top: 0,
						behavior: "smooth",
					});
					setAnimeFilterState(
						animeFilter.newWith("searchQuery", event.target.value),
					);
				}}
			/>
			{/** biome-ignore lint/a11y/useSemanticElements: <we are inside a button> */}
			<div
				role="button"
				className={`dismissButton ${dismissButtonIsDisabled ? "disabled" : ""}`}
				tabIndex={0}
				onClick={onDismiss}
				onKeyUp={onDismiss}
				ref={dismissButtonRef}
			>
				<img src={removeIcon} alt="remove icon" width={25} />
			</div>
			<img src={magnifyingGlass} alt="search icon" width={25} />
		</button>
	);
}
