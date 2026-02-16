import { FilledStar, StarIcon } from "../generic/starRating";

export function statsPageValid(path: string) {
	return { valid: !!/\/stats/g.exec(path) };
}

export function createScoresData(scores: { [score: number]: number }) {
	return [
		{
			label: (
				<>
					<StarIcon />
				</>
			),
			displayLabel: <FilledStar />,
			value: scores[0.5] ?? 0,
		},
		{
			label: (
				<>
					<FilledStar />
				</>
			),
			displayLabel: null,
			value: scores[1] ?? 0,
		},
		{
			label: (
				<>
					<FilledStar />
					<StarIcon />
				</>
			),
			displayLabel: null,
			value: scores[1.5] ?? 0,
		},
		{
			label: (
				<>
					<FilledStar />
					<FilledStar />
				</>
			),
			displayLabel: null,
			value: scores[2] ?? 0,
		},
		{
			label: (
				<>
					<FilledStar />
					<FilledStar />
					<StarIcon />
				</>
			),
			displayLabel: null,
			value: scores[2.5] ?? 0,
		},
		{
			label: (
				<>
					<FilledStar />
					<FilledStar />
					<FilledStar />
				</>
			),
			displayLabel: null,
			value: scores[3] ?? 0,
		},
		{
			label: (
				<>
					<FilledStar />
					<FilledStar />
					<FilledStar />
					<StarIcon />
				</>
			),
			displayLabel: null,
			value: scores[3.5] ?? 0,
		},
		{
			label: (
				<>
					<FilledStar />
					<FilledStar />
					<FilledStar />
					<FilledStar />
				</>
			),
			displayLabel: null,
			value: scores[4] ?? 0,
		},
		{
			label: (
				<>
					<FilledStar />
					<FilledStar />
					<FilledStar />
					<FilledStar />
					<StarIcon />
				</>
			),
			displayLabel: null,
			value: scores[4.5] ?? 0,
		},
		{
			label: (
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
