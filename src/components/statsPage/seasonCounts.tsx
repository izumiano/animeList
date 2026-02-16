import {
	BarChartNode,
	type BarChartOptions,
} from "@izumiano/react-assembled-graph";

export default function SeasonCounts({
	seasonCounts,
	options,
}: {
	seasonCounts: [string, number][];
	options: BarChartOptions;
}) {
	return (
		<>
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
					return { label: key, value };
				})}
				options={{
					...options,
					barOptions: { ...options.barOptions, minHeight: 0 },
					valueAxis: { ...options.valueAxis, minPixelDistance: 16 },
				}}
			/>
		</>
	);
}
