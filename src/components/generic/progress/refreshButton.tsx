import "./refreshButton.css";
import refreshIcon from "assets/refresh.png";
import { useRef, useState } from "react";
import { sleepFor } from "../../../utils/utils";

export default function RefreshButton({
	onClick,
	allowSimultaneousClicks,
	className,
}: {
	onClick: (params: { refreshDone: () => void }) => void | Promise<void>;
	allowSimultaneousClicks?: boolean;
	className?: string;
}) {
	const [isRefreshing, setIsRefreshingState] = useState(false);
	const [isTransitioning, setIsTransitioningState] = useState(false);

	const abortController = useRef(new AbortController());

	function onTransitionEnd() {
		setIsTransitioningState(false);
	}

	allowSimultaneousClicks ??= false;

	return (
		<button
			className={className}
			onClick={async () => {
				abortController.current.abort();
				abortController.current = new AbortController();
				const currAbortController = abortController.current;
				setIsRefreshingState(true);
				if (
					!allowSimultaneousClicks &&
					(await sleepFor(500, currAbortController.signal)).wasAborted
				) {
					return;
				}
				await onClick({
					refreshDone: () => {
						setIsRefreshingState(false);
					},
				});

				if (currAbortController.signal.aborted) {
					return;
				}

				setIsRefreshingState(false);
				setIsTransitioningState(true);
			}}
		>
			<img
				src={refreshIcon}
				onTransitionEnd={onTransitionEnd}
				onTransitionCancel={onTransitionEnd}
				className={`refreshImg ${isRefreshing && !isTransitioning ? "refreshing" : ""}`}
			></img>
		</button>
	);
}
