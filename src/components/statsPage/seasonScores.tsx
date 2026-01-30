import {
	BarChartNode,
	type BarChartOptions,
} from "@izumiano/react-assembled-graph";
import { createScoresData } from "./statsPageConsts";

export default function SeasonScores({
	scores,
	options,
}: {
	scores: { [score: number]: number };
	options: BarChartOptions;
}) {
	const data = createScoresData(scores);

	return (
		<>
			<h1>
				{"<"}--Season Scores--{">"}
			</h1>
			<BarChartNode
				height="50%"
				style={{
					margin: "2rem",
					border: "1px solid white",
				}}
				data={data}
				options={options}
			/>
		</>
	);
}
