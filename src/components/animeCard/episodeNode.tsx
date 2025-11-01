import { useEffect, useState } from "react";
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

	useEffect(() => {
		setWatchedState(episode.watched);
	}, [episode.watched]);

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
	autoFocus,
	resetAutoFocus,
	listRef,
	scrollElementRef,
}: {
	season: AnimeSeason;
	episode: AnimeEpisode;
	updateEpisodes: () => void;
	autoFocus?: boolean;
	resetAutoFocus?: () => void;
	listRef: React.RefObject<HTMLUListElement | null>;
	scrollElementRef: React.RefObject<HTMLDivElement | null>;
}) {
	const watched = episode.watched;

	const [defaultValue, setDefaultValueState] = useState(episode.title);
	const [value, setValueState] = useState(episode.title);

	useEffect(() => {
		setValueState(episode.title);
	}, [episode.title]);

	useEffect(() => {
		setDefaultValueState(episode.title);
	}, [episode]);

	if (autoFocus) {
		resetAutoFocus?.call(null);
	}

	return (
		<li className={`episodeContainer ${watched ? "watched" : ""}`}>
			<p className="episodeNumber">
				<b>{`${episode.episodeNumber + 1}.`}</b>
			</p>
			<label className="flexGrow">
				<div>{value !== "" ? value : defaultValue}</div>
				<input
					type="text"
					value={value}
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
						const targetValue = event.target.value;
						const value = targetValue !== "" ? targetValue : defaultValue;
						event.target.value = value;
						episode.title = value;
						setValueState(value);
					}}
					onChange={(event) => {
						const value = event.target.value;
						setValueState(value);
						episode.title = value;
					}}
				/>
			</label>
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
