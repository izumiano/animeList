import { useEffect, useState } from "react";
import AnimeEpisode from "../../models/animeEpisode";
import "./episodeNode.css";
import trashIcon from "assets/bin.png";
import plusIcon from "assets/plus.png";
import type AnimeSeason from "../../models/animeSeason";
import ConfirmationDropdown from "../generic/confirmationDropdown";
import Dropdown from "../generic/dropdown";
import RainbowOutline from "../generic/rainbowOutline";

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
		<li className="noListStyle">
			<button
				type="button"
				onClick={() => {
					setWatched(!watched);
				}}
				className={`reset episodeContainer cursorPointer ${watched ? "watched" : ""}`}
			>
				<p className="episodeNumber">
					<b>{`${episode.episodeNumber + 1}.`}</b>
				</p>
				<p>{episode.title}</p>
			</button>
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
	const onClick = () => {
		season.addEpisodes([
			new AnimeEpisode({ episodeNumber: 0, title: "", watched: false }),
		]);
		updateEpisodes();
	};

	return (
		<RainbowOutline
			elementType="li"
			borderSize={2}
			blurSize={5}
			animationTime="4s"
			doRotate="onHover"
			mobileDoRotate="never"
		>
			{/** biome-ignore lint/a11y/useSemanticElements: <style issues with button> */}
			<div
				role="button"
				tabIndex={0}
				className="episodeContainer addEpisode cursorPointer"
				onClick={onClick}
				onKeyUp={(e) => e.key === "Enter" && onClick()}
			>
				<div className="episodeNumber flexRow">
					<img
						src={plusIcon}
						alt="add episode icon"
						width={10}
						className="mediumIcon circle smallPadding"
					/>
				</div>
				<span className="verticalCenter">Add Episode</span>
			</div>
		</RainbowOutline>
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
					// biome-ignore lint/a11y/noAutofocus: <i think auto focus is the expected outcome when adding a new episode>
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
				buttonClass="transparentBackground"
				useDefaultButtonStyle={true}
				dropdownButton={
					<img src={trashIcon} alt="delete show" width="15"></img>
				}
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
