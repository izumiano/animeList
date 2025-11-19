import { useCallback, useEffect, useRef } from "react";

type ClickProps = { x: number; y: number };

export default function useDrag({
	onClick,
	onMove,
	onRelease,
}: {
	onClick: (props: ClickProps) => void;
	onMove: (props: ClickProps & { isClicking: boolean }) => void;
	onRelease: (props: ClickProps) => void;
}) {
	const isClicking = useRef(false);
	const isTouching = useRef(false);

	const element = useRef<HTMLElement>(null);

	const getValueFromEvent = useCallback(
		(
			event: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent | Touch,
		) => {
			const currElem = element.current;
			if (!currElem) {
				return;
			}

			const boundingRect = currElem.getBoundingClientRect();
			return {
				x: (event.clientX - boundingRect.left) / boundingRect.width,
				y: (event.clientY - boundingRect.top) / boundingRect.height,
			};
		},
		[element],
	);

	useEffect(() => {
		const currElem = element.current;

		const handleMouseDown = (event: MouseEvent) => {
			event.preventDefault();
			isClicking.current = true;
			const relativeMousePos = getValueFromEvent(event);
			if (relativeMousePos == null) {
				return;
			}
			onClick(relativeMousePos);
		};

		const handleMouseMove = (event: MouseEvent) => {
			const relativeMousePos = getValueFromEvent(event);
			if (relativeMousePos == null) {
				return;
			}
			onMove({ ...relativeMousePos, isClicking: isClicking.current });
		};

		const handleTouchStart = (event: TouchEvent) => {
			event.stopImmediatePropagation();
			event.preventDefault();
			isTouching.current = true;
			const relativeMousePos = getValueFromEvent(event.touches[0]);
			if (relativeMousePos == null) {
				return;
			}
			onClick(relativeMousePos);
		};

		if (currElem) {
			currElem.addEventListener("mousedown", handleMouseDown);
			currElem.addEventListener("mousemove", handleMouseMove);

			currElem.addEventListener("touchstart", handleTouchStart);
		}

		return () => {
			if (currElem) {
				currElem.removeEventListener("mousedown", handleMouseDown);
				currElem.removeEventListener("mousemove", handleMouseMove);

				currElem.removeEventListener("touchstart", handleTouchStart);
			}
		};
	}, [element, getValueFromEvent, onClick, onMove]);

	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			if (isClicking.current) {
				const newValue = getValueFromEvent(event);
				if (newValue == null) {
					return;
				}
				onMove({ ...newValue, isClicking: true });
			}
		};
		const handleMouseUp = (event: MouseEvent) => {
			if (isClicking.current) {
				const newValue = getValueFromEvent(event);
				if (newValue == null) {
					return;
				}
				onRelease(newValue);
			}
			isClicking.current = false;
		};

		const handleTouchMove = (event: TouchEvent) => {
			if (isTouching.current) {
				const newValue = getValueFromEvent(event.touches[0]);
				if (newValue == null) {
					return;
				}
				onMove({ ...newValue, isClicking: isTouching.current });
			}
		};

		const handleTouchEnd = (event: TouchEvent) => {
			if (isTouching.current) {
				const newValue = getValueFromEvent(event.changedTouches[0]);
				if (newValue == null) {
					return;
				}
				onRelease(newValue);
			}
			isTouching.current = false;
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		document.addEventListener("touchmove", handleTouchMove);
		document.addEventListener("touchend", handleTouchEnd);
		document.addEventListener("touchcancel", handleTouchEnd);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);

			document.removeEventListener("touchmove", handleTouchMove);
			document.removeEventListener("touchend", handleTouchEnd);
			document.removeEventListener("touchcancel", handleTouchEnd);
		};
	}, [getValueFromEvent, onClick, onMove, onRelease]);

	return element;
}
