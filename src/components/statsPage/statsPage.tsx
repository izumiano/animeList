import { GraphContext } from "@izumiano/react-assembled-graph";
import type Anime from "../../models/anime";
import { roundToNearestDecimal } from "../../utils/utils";
import SeasonScores from "./seasonScores";
import ShowScores from "./showScores";
import WatchedStatus from "./watchedStatus";
import SeasonCounts from "./seasonCounts";

function calculateAnimeStats(animes: Map<string, Anime>) {
	const seasonScores: { [score: number]: number } = {};
	const animeScores: { [score: number]: number } = {};

	const seasonCounts: { [seasonCount: number]: number } = {};
	let seasonCountsMaxValue = 0;

	const watchedStatus: {
		watched: number;
		watching: number;
		unwatched: number;
	} = { watched: 0, watching: 0, unwatched: 0 };

	animes.forEach((anime) => {
		if (anime.watched) {
			watchedStatus.watched++;
		} else if (anime.watching) {
			watchedStatus.watching++;
		} else {
			watchedStatus.unwatched++;
		}

		let seasonTotalScores = 0;
		anime.seasons.forEach((season) => {
			const score = season.score ?? 0;
			if (anime.watched) {
				seasonTotalScores += score;
			}
			if (!seasonScores[score]) {
				seasonScores[score] = 0;
			}
			seasonScores[score]++;
		});

		const average = roundToNearestDecimal(
			seasonTotalScores / anime.seasons.length,
			0.5,
		);

		if (!animeScores[average]) {
			animeScores[average] = 0;
		}
		animeScores[average]++;

		if (!seasonCounts[anime.seasons.length]) {
			seasonCounts[anime.seasons.length] = 0;
		}
		seasonCounts[anime.seasons.length]++;

		seasonCountsMaxValue = Math.max(seasonCountsMaxValue, anime.seasons.length);
	});

	for (let i = 1; i < seasonCountsMaxValue + 1; i++) {
		if (!seasonCounts[i]) {
			seasonCounts[i] = 0;
		}
	}

	return {
		watchedStatus,
		scores: { animes: animeScores, seasons: seasonScores },
		seasonCounts: Object.entries(seasonCounts).sort(([lhs], [rhs]) => {
			if (parseInt(lhs) < parseInt(rhs)) {
				return -1;
			}
			return 1;
		}),
	};
}

export default function StatsPage({ animes }: { animes: Map<string, Anime> }) {
	const { watchedStatus, scores, seasonCounts } = calculateAnimeStats(animes);

	const options = {
		backgroundColor: { r: 10, g: 10, b: 10, a: 100 },
		barOptions: {
			gap: 10,
			minWidth: 10,
			minHeight: 2,
		},
		titleFontSize: 15,
		valueAxis: { width: 40, minPixelDistance: 38 },
		positioning: { top: 20, left: 20, right: 20, bottom: 30 },
	};

	return (
		<div>
			<GraphContext>
				<SeasonScores scores={scores.seasons} options={options} />

				<ShowScores scores={scores.animes} options={options} />

				<WatchedStatus watchedStatus={watchedStatus} options={options} />

				<SeasonCounts seasonCounts={seasonCounts} options={options} />
			</GraphContext>
		</div>
	);
}
