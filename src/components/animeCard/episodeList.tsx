import { useCallback, useEffect, useRef, useState } from "react";
import AnimeSeason from "../../models/animeSeason";
import "./episodeList.css";
import {
	AddEpisodeNode,
	DetailedEpisodeNode,
	EpisodeNode,
} from "./episodeNode";
import { v4 as uuid } from "uuid";
import type AnimeEpisode from "../../models/animeEpisode";
import type Anime from "../../models/anime";

const EpisodeList = (
	params: {
		season: AnimeSeason | undefined;
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
	const [autoSelectEpisodeIndex, setAutoSelectEpisodeIndex] = useState<
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

	return (
		<ul ref={listRef} className={`episodeList ${type}`}>
			{season ? (
				<>
					{episodes?.map((episode, index) => {
						switch (type) {
							case "regular":
								return (
									<EpisodeNode
										key={uuid()}
										episode={episode}
										onCompletionChange={params.onCompletionChange}
									/>
								);
							case "detailed":
								return (
									<DetailedEpisodeNode
										key={uuid()}
										season={season}
										episode={episode}
										updateEpisodes={() => setEpisodes(season.episodes)}
										listRef={listRef}
										scrollElementRef={params.scrollElementRef}
										autoSelect={index === autoSelectEpisodeIndex}
									/>
								);
						}
					})}
					{type === "detailed" ? (
						<AddEpisodeNode
							season={season}
							updateEpisodes={() => {
								setEpisodes(season.episodes);
								setAutoSelectEpisodeIndex(season.episodes.length - 1);
							}}
						/>
					) : null}
				</>
			) : null}
		</ul>
	);
};

export default EpisodeList;
