import {
	BarChartNode,
	type BarChartOptions,
} from "@izumiano/react-assembled-graph";

export default function WatchedStatus({
	watchedStatus,
	options,
}: {
	watchedStatus: {
		watched: number;
		watching: number;
		unwatched: number;
	};
	options: BarChartOptions;
}) {
	return (
		<>
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
		</>
	);
}
