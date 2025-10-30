import { useState } from "react";
import AnimeEpisode from "../../models/animeEpisode";
import "./episodeNode.css";
import type AnimeSeason from "../../models/animeSeason";
import Dropdown from "../generic/dropdown";
import trashIcon from "../../assets/bin.png";
import ConfirmationDropdown from "../generic/confirmationDropdown";

export function EpisodeNode({
	episode,
	onCompletionChange,
}: {
	episode: AnimeEpisode;
	onCompletionChange?: () => void;
}) {
	const [watched, setWatchedState] = useState(episode.watched);

	function setWatched(watched: boolean) {
		if (watched === episode.watched) return;

		episode.watched = watched;
		setWatchedState(watched);

		onCompletionChange?.call(null);
	}

	return (
		<li
			className={`episodeContainer cursorPointer ${watched ? "watched" : ""}`}
			onClick={() => {
				setWatched(!watched);
			}}
		>
			<p className="episodeNumber">
				<b>{`${episode.episodeNumber + 1}.`}</b>
			</p>
			<p>{episode.title}</p>
		</li>
	);
}

export function AddEpisodeNode({
	season,
	updateEpisodes,
}: {
	season: AnimeSeason;
	updateEpisodes: () => void;
}) {
	return (
		<li
			className={`episodeContainer addEpisode cursorPointer`}
			onClick={() => {
				season.addEpisodes([
					new AnimeEpisode({ episodeNumber: 0, title: "", watched: false }),
				]);
				updateEpisodes();
			}}
		>
			<p className="episodeNumber">
				<b>{"*"}</b>
			</p>
			<span>Add Episode</span>
		</li>
	);
}

export function DetailedEpisodeNode({
	season,
	episode,
	updateEpisodes,
	autoSelect: autoFocus,
	listRef,
	scrollElementRef,
}: {
	season: AnimeSeason;
	episode: AnimeEpisode;
	updateEpisodes: () => void;
	autoSelect?: boolean;
	listRef: React.RefObject<HTMLUListElement | null>;
	scrollElementRef: React.RefObject<HTMLDivElement | null>;
}) {
	const watched = episode.watched;

	const defaultValue = episode.title;

	return (
		<li className={`episodeContainer ${watched ? "watched" : ""}`}>
			<p className="episodeNumber">
				<b>{`${episode.episodeNumber + 1}.`}</b>
			</p>
			<input
				type="text"
				defaultValue={defaultValue}
				placeholder={defaultValue}
				autoFocus={autoFocus}
				onFocus={(event) => {
					event.target.select();
				}}
				onKeyDown={(event) => {
					if (event.key === "Enter") {
						event.preventDefault();
						event.currentTarget.blur();
					}
				}}
				onBlur={(event) => {
					const value = event.target.value;
					event.target.value = value !== "" ? value : defaultValue;
				}}
				onChange={(event) => {
					const value = event.target.value;
					episode.title = value !== "" ? value : defaultValue;
				}}
			/>
			<Dropdown
				alignment="right"
				buttonClass="transparentBackground t"
				useDefaultButtonStyle={true}
				dropdownButton={<img src={trashIcon} width="15"></img>}
				listRef={listRef}
				scrollElementRef={scrollElementRef}
				forceStaticPosition
			>
				{({ closeDropdown }) => (
					<ConfirmationDropdown
						title="Really Delete?"
						confirmMessage="Delete"
						confirmClass="deleteConfirm"
						dismissMessage="Keep"
						closeDropdown={closeDropdown}
						onConfirm={() => {
							season.removeEpisodeAtIndex(episode.episodeNumber);
							updateEpisodes();
						}}
					/>
				)}
			</Dropdown>
		</li>
	);
}
