import {
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
	type CSSProperties,
} from "react";
import "./starRating.css";
import { ceilToNearestDecimal, clamp } from "../../utils/utils";
import useMultipleRef from "../../utils/useMultiple";
import useDrag from "../../utils/useDrag";

export default function StarRating({
	defaultValue,
	starCount,
	onChange,
	className,
}: {
	defaultValue?: number | null;
	starCount?: number;
	onChange?: (value: number | null) => void;
	className?: string;
}) {
	starCount ??= 5;

	const starRatingContainerRef = useRef<HTMLDivElement>(null);

	const [value, setValueState] = useState(defaultValue ?? null);
	const [hoverValue, setHoverValueState] = useState(defaultValue ?? 0);

	const id = useId();

	const _valueWrapper = useRef(value);
	_valueWrapper.current = value;
	const setValue = useCallback(
		(newValue: number | null) => {
			setHoverValueState(newValue ?? 0);
			if (newValue === _valueWrapper.current) {
				return;
			}
			onChange?.call(null, newValue);
			setValueState(newValue);
		},
		[onChange],
	);

	useEffect(() => {
		setValue(defaultValue ?? null);
	}, [defaultValue, setValue]);

	const hasValue = !!value;

	return (
		<div
			ref={useMultipleRef(
				starRatingContainerRef,
				useDrag({
					onValueChange: useCallback(
						({ horizontal, isConfirm }) => {
							let value = horizontal * starCount;
							if (value < 0.25) {
								value = 0;
							}
							value = clamp(ceilToNearestDecimal(value, 0.5), {
								max: starCount,
							});

							if (isConfirm) {
								setValue(value);
							} else {
								setHoverValueState(value);
							}
						},
						[starCount, setValue],
					),
				}),
			)}
			onMouseLeave={() => {
				setHoverValueState(value ?? 0);
			}}
			className={`flexRow starRatingContainer verticalCenter ${className}`}
		>
			{new Array(starCount).fill(null).map((_, index) => {
				const backgroundFillAmount = clamp(hoverValue - index, {
					min: 0,
					max: 1,
				});
				const mainFillAmount =
					value != null
						? clamp(value - index, {
								min: 0,
								max: 1,
							})
						: 0;

				return (
					<StarIcon
						key={`${id}${index}`}
						mainStarProps={{
							fillAmount: clamp(mainFillAmount, { max: backgroundFillAmount }),
						}}
						backgroundStarProps={{
							fillAmount: clamp(backgroundFillAmount, { min: mainFillAmount }),
						}}
						outlineStarProps={{
							color: hasValue ? "#eee" : "var(--colAccent)",
						}}
					/>
				);
			})}
		</div>
	);
}

function StarIcon({
	mainStarProps,
	outlineStarProps,
	backgroundStarProps,
}: {
	mainStarProps?: FilledStarProps;
	outlineStarProps?: EmptyStarProps;
	backgroundStarProps?: FilledStarProps;
}) {
	mainStarProps ??= { fillAmount: 0.5 };
	outlineStarProps ??= {};
	backgroundStarProps ??= {};
	backgroundStarProps.color ??= "gray";

	return (
		<div className="starIcon">
			<FilledStar {...backgroundStarProps} />
			<EmptyStar {...outlineStarProps} />
			<FilledStar {...mainStarProps} />
		</div>
	);
}

type EmptyStarProps = { color?: string };

function EmptyStar({ color }: EmptyStarProps) {
	color ??= "#eee";

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="star-empty"
		>
			<path
				stroke={color}
				d="M17.286 21.09q -1.69 .001 -5.288 -2.615q -3.596 2.617 -5.288 2.616q -2.726 0 -.495 -6.8q -9.389 -6.775 2.135 -6.775h.076q 1.785 -5.516 3.574 -5.516q 1.785 0 3.574 5.516h.076q 11.525 0 2.133 6.774q 2.23 6.802 -.497 6.8"
			/>
		</svg>
	);
}

interface FilledStarCSSProperties extends CSSProperties {
	"--fillAmount": string;
}

type FilledStarProps = { color?: string; fillAmount?: number };

function FilledStar({ color, fillAmount }: FilledStarProps) {
	color ??= "#eee";
	fillAmount ??= 0;

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="currentColor"
			className="star-filled"
			style={
				{ "--fillAmount": `${fillAmount * 100}%` } as FilledStarCSSProperties
			}
		>
			<path
				stroke="none"
				fill={color}
				d="M17.108 22.085c-1.266 -.068 -2.924 -.859 -5.071 -2.355l-.04 -.027l-.037 .027c-2.147 1.497 -3.804 2.288 -5.072 2.356l-.178 .005c-2.747 0 -3.097 -2.64 -1.718 -7.244l.054 -.178l-.1 -.075c-6.056 -4.638 -5.046 -7.848 2.554 -8.066l.202 -.005l.115 -.326c1.184 -3.33 2.426 -5.085 4.027 -5.192l.156 -.005c1.674 0 2.957 1.76 4.182 5.197l.114 .326l.204 .005c7.6 .218 8.61 3.428 2.553 8.065l-.102 .075l.055 .178c1.35 4.512 1.04 7.137 -1.556 7.24l-.163 .003z"
			/>
		</svg>
	);
}
