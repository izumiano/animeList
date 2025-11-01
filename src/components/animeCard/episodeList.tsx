import { useCallback, useEffect, useId, useRef, useState } from "react";
import AnimeSeason from "../../models/animeSeason";
import "./episodeList.css";
import {
	AddEpisodeNode,
	DetailedEpisodeNode,
	EpisodeNode,
} from "./episodeNode";
import type AnimeEpisode from "../../models/animeEpisode";
import type Anime from "../../models/anime";
import { externalLinkId } from "../../models/externalLink";

const EpisodeList = (
	params: {
		season: AnimeSeason | undefined;
		className?: string;
	} & (
		| { type: "regular"; onCompletionChange: () => void }
		| {
				type: "detailed";
				anime: Anime;
				setSeasonWatchedState: (watched: boolean) => void;
				scrollElementRef: React.RefObject<HTMLDivElement | null>;
		  }
	),
) => {
	const { season, type } = params;
	const [episodes, setEpisodesState] = useState(season?.episodes);
	const [autoFocusEpisodeIndex, setAutoFocusEpisodeIndex] = useState<
		number | null
	>(null);

	const setEpisodes = useCallback(
		(episodes: AnimeEpisode[] | undefined) => {
			setEpisodesState(episodes);
			if (type === "detailed") {
				params.setSeasonWatchedState(season?.watched ?? false);
			}
		},
		[params, season?.watched, type],
	);

	useEffect(() => {
		setEpisodes(season?.episodes);
	}, [season?.episodes, setEpisodes]);

	const listRef = useRef<HTMLUListElement>(null);

	const id = useId();

	if (!season) {
		return null;
	}

	const key = `${externalLinkId(season.externalLink, season.title)}_${id}`;

	return (
		<ul ref={listRef} className={`episodeList ${type} ${params.className}`}>
			{season ? (
				<>
					{episodes?.map((episode, index) => {
						switch (type) {
							case "regular":
								return (
									<EpisodeNode
										key={`${key}_${index}`}
										episode={episode}
										onCompletionChange={params.onCompletionChange}
									/>
								);
							case "detailed":
								return (
									<DetailedEpisodeNode
										key={`${key}_${index}`}
										season={season}
										episode={episode}
										updateEpisodes={() => setEpisodes(season.episodes)}
										listRef={listRef}
										scrollElementRef={params.scrollElementRef}
										autoFocus={index === autoFocusEpisodeIndex}
										resetAutoFocus={() => setAutoFocusEpisodeIndex(null)}
									/>
								);
						}
					})}
					{type === "detailed" ? (
						<AddEpisodeNode
							season={season}
							updateEpisodes={() => {
								setEpisodes(season.episodes);
								setAutoFocusEpisodeIndex(season.episodes.length - 1);
							}}
						/>
					) : null}
				</>
			) : null}
		</ul>
	);
};

export default EpisodeList;
