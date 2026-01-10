import {
	type CSSProperties,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import "./expandableText.css";
import { useOtherElementEvent } from "../../utils/useEvents";
import { checkElementOverflow, sleepFor } from "../../utils/utils";

interface ExpandableTextCSSProperties extends CSSProperties {
	"--maxLines": number;
}

const ExpandableText = ({
	isExpanded,
	setIsExpandedState,
	text,
	maxLines,
	closeAnimTime,
	className,
}: {
	isExpanded: boolean;
	setIsExpandedState: (expanded: boolean) => void;
	text: string;
	maxLines: number;
	closeAnimTime?: number;
	className: string;
}) => {
	const [textIsExpanded, setTextIsExpandedState] = useState(isExpanded);
	const abortController = useRef<AbortController>(new AbortController());

	const textRef = useRef<HTMLElement>(null);
	const [textIsOverflowing, setTextIsOverflowingState] = useState(false);

	closeAnimTime ??= 1000;

	const setIsExpanded = useCallback(
		async (expanded: boolean) => {
			setIsExpandedState(expanded);
			abortController.current.abort();
			abortController.current = new AbortController();
			if (!expanded) {
				if (
					(await sleepFor(closeAnimTime, abortController.current.signal))
						.wasAborted
				) {
					return;
				}
				setTextIsExpandedState(expanded);
			} else {
				setTextIsExpandedState(expanded);
			}
		},
		[closeAnimTime, setIsExpandedState],
	);

	useEffect(() => {
		setIsExpanded(false);
	}, [text, setIsExpanded]);

	const readMoreButtonEnabled = isExpanded || textIsOverflowing;

	return (
		<div className={`flexGrow flexColumn overflowHidden ${className}`}>
			<span
				ref={useOtherElementEvent({
					element: useHandleTextIsOverflowing(
						setTextIsOverflowingState,
						textRef,
						text,
					),
					eventTypes: ["resize"],
					callback: () => {
						if (textRef.current) {
							setTextIsOverflowingState(
								checkElementOverflow(textRef.current).isVerticallyOverflowing,
							);
						}
					},
				})}
				className={`leftAlignedText breakWord expandableText flexGrow ${
					textIsExpanded ? "expanded" : ""
				}`}
				style={{ "--maxLines": maxLines } as ExpandableTextCSSProperties}
			>
				{text}
			</span>
			<button
				type="button"
				className={`readMoreButton transparentBackground ${
					readMoreButtonEnabled ? "" : "hidden"
				}`}
				disabled={!readMoreButtonEnabled}
				onClick={async () => {
					setIsExpanded(!isExpanded);
				}}
			>
				Read {isExpanded ? "less" : "more"}
			</button>
		</div>
	);
};

function useHandleTextIsOverflowing(
	callback: (overflowing: boolean) => void,
	textRef: React.RefObject<HTMLElement | null>,
	text: string,
) {
	useEffect(() => {
		if (textRef.current) {
			callback(checkElementOverflow(textRef.current).isVerticallyOverflowing);
		}
	}, [callback, textRef, text]);

	return textRef;
}

export default ExpandableText;
