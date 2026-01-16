import { BarChartNode, GraphContext } from "@izumiano/react-assembled-graph";
import type Anime from "../../models/anime";
import { roundToNearestDecimal } from "../../utils/utils";

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
	const {
		watchedStatus,
		scores,
		seasonCounts: _seasonCounts,
	} = calculateAnimeStats(animes);

	const options = {
		backgroundColor: { r: 10, g: 10, b: 10, a: 100 },
		barOptions: {
			gap: 10,
			minWidth: 10,
			minHeight: 2,
		},
		titleFontSize: 15,
		valueAxis: { width: 40, minPixelDistance: 38 },
		positioning: 20,
	};

	return (
		<div>
			<GraphContext>
				<h1>
					{"<"}--Season Scores--{">"}
				</h1>
				<BarChartNode
					height="50%"
					style={{
						margin: "2rem",
						border: "1px solid white",
					}}
					data={[
						{
							title: "1/2",
							displayTitle: "⭐",
							value: scores.seasons[0.5] ?? 0,
						},
						{ title: "⭐", displayTitle: "", value: scores.seasons[1] ?? 0 },
						{
							title: "⭐1/2",
							displayTitle: "",
							value: scores.seasons[1.5] ?? 0,
						},
						{ title: "⭐⭐", displayTitle: "", value: scores.seasons[2] ?? 0 },
						{
							title: "⭐⭐1/2",
							displayTitle: "",
							value: scores.seasons[2.5] ?? 0,
						},
						{
							title: "⭐⭐⭐",
							displayTitle: "",
							value: scores.seasons[3] ?? 0,
						},
						{
							title: "⭐⭐⭐1/2",
							displayTitle: "",
							value: scores.seasons[3.5] ?? 0,
						},
						{
							title: "⭐⭐⭐⭐",
							displayTitle: "",
							value: scores.seasons[4] ?? 0,
						},
						{
							title: "⭐⭐⭐⭐1/2",
							displayTitle: "",
							value: scores.seasons[4.5] ?? 0,
						},
						{ title: "⭐⭐⭐⭐⭐", value: scores.seasons[5] ?? 0 },
					]}
					options={options}
				/>

				<h1>
					{"<"}--Show Scores--{">"}
				</h1>
				<BarChartNode
					height="50%"
					style={{
						margin: "2rem",
						border: "1px solid white",
					}}
					data={[
						{
							title: "1/2",
							displayTitle: "⭐",
							value: scores.animes[0.5] ?? 0,
						},
						{ title: "⭐", displayTitle: "", value: scores.animes[1] ?? 0 },
						{
							title: "⭐1/2",
							displayTitle: "",
							value: scores.animes[1.5] ?? 0,
						},
						{ title: "⭐⭐", displayTitle: "", value: scores.animes[2] ?? 0 },
						{
							title: "⭐⭐1/2",
							displayTitle: "",
							value: scores.animes[2.5] ?? 0,
						},
						{
							title: "⭐⭐⭐",
							displayTitle: "",
							value: scores.animes[3] ?? 0,
						},
						{
							title: "⭐⭐⭐1/2",
							displayTitle: "",
							value: scores.animes[3.5] ?? 0,
						},
						{
							title: "⭐⭐⭐⭐",
							displayTitle: "",
							value: scores.animes[4] ?? 0,
						},
						{
							title: "⭐⭐⭐⭐1/2",
							displayTitle: "",
							value: scores.animes[4.5] ?? 0,
						},
						{ title: "⭐⭐⭐⭐⭐", value: scores.animes[5] ?? 0 },
					]}
					options={options}
				/>

				<h1>
					{"<"}--Watched Status--{">"}
				</h1>
				<BarChartNode
					height="50%"
					style={{
						margin: "2rem",
						border: "1px solid white",
					}}
					data={[
						{ title: "Watched", value: watchedStatus.watched },
						{ title: "Watching", value: watchedStatus.watching },
						{ title: "Unwatched", value: watchedStatus.unwatched },
					]}
					options={{
						...options,
						barOptions: { ...options.barOptions, gap: 100 },
					}}
				/>

				{/* FIXME: make work with variable `data` length 
				<h1>
					{"<"}--Season Counts--{">"}
				</h1>
				<BarChartNode
					height="50%"
					style={{
						margin: "2rem",
						border: "1px solid white",
					}}
					data={seasonCounts.map(([key, value]) => {
						return { title: key, value };
					})}
					options={{
						...options,
						barOptions: { ...options.barOptions, minHeight: 0 },
						valueAxis: { ...options.valueAxis, minPixelDistance: 15 },
					}}
				/> */}
			</GraphContext>
		</div>
	);
}
