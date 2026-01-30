import { FilledStar, StarIcon } from "../generic/starRating";

export function statsPageValid(path: string) {
	return { valid: !!/\/stats/g.exec(path) };
}

export function createScoresData(scores: { [score: number]: number }) {
	return [
		{
			title: (
				<>
					<StarIcon />
				</>
			),
			displayTitle: <FilledStar />,
			value: scores[0.5] ?? 0,
		},
		{
			title: (
				<>
					<FilledStar />
				</>
			),
			displayTitle: null,
			value: scores[1] ?? 0,
		},
		{
			title: (
				<>
					<FilledStar />
					<StarIcon />
				</>
			),
			displayTitle: null,
			value: scores[1.5] ?? 0,
		},
		{
			title: (
				<>
					<FilledStar />
					<FilledStar />
				</>
			),
			displayTitle: null,
			value: scores[2] ?? 0,
		},
		{
			title: (
				<>
					<FilledStar />
					<FilledStar />
					<StarIcon />
				</>
			),
			displayTitle: null,
			value: scores[2.5] ?? 0,
		},
		{
			title: (
				<>
					<FilledStar />
					<FilledStar />
					<FilledStar />
				</>
			),
			displayTitle: null,
			value: scores[3] ?? 0,
		},
		{
			title: (
				<>
					<FilledStar />
					<FilledStar />
					<FilledStar />
					<StarIcon />
				</>
			),
			displayTitle: null,
			value: scores[3.5] ?? 0,
		},
		{
			title: (
				<>
					<FilledStar />
					<FilledStar />
					<FilledStar />
					<FilledStar />
				</>
			),
			displayTitle: null,
			value: scores[4] ?? 0,
		},
		{
			title: (
				<>
					<FilledStar />
					<FilledStar />
					<FilledStar />
					<FilledStar />
					<StarIcon />
				</>
			),
			displayTitle: null,
			value: scores[4.5] ?? 0,
		},
		{
			title: (
				<>
					<FilledStar />
					<FilledStar />
					<FilledStar />
					<FilledStar />
					<FilledStar />
				</>
			),
			value: scores[5] ?? 0,
		},
	];
}
