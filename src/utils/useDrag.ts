import { useCallback, useEffect, useRef } from "react";

export default function useDrag({
	onValueChange,
}: {
	onValueChange: (props: {
		horizontal: number;
		vertical: number;
		isConfirm: boolean;
	}) => void;
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
				horizontal: (event.clientX - boundingRect.left) / boundingRect.width,
				vertical: (event.clientY - boundingRect.top) / boundingRect.height,
			};
		},
		[element],
	);

	useEffect(() => {
		const currElem = element.current;

		const hanldeMouseDown = (event: MouseEvent) => {
			event.preventDefault();
			isClicking.current = true;
			const relativeMousePos = getValueFromEvent(event);
			if (relativeMousePos == null) {
				return;
			}
			onValueChange({ ...relativeMousePos, isConfirm: true });
		};

		const handleMouseMove = (event: MouseEvent) => {
			const relativeMousePos = getValueFromEvent(event);
			if (relativeMousePos == null) {
				return;
			}
			onValueChange({ ...relativeMousePos, isConfirm: isClicking.current });
		};

		const handleTouchStart = (event: TouchEvent) => {
			event.stopImmediatePropagation();
			event.preventDefault();
			isTouching.current = true;
			const relativeMousePos = getValueFromEvent(event.touches[0]);
			if (relativeMousePos == null) {
				return;
			}
			onValueChange({ ...relativeMousePos, isConfirm: true });
		};

		if (currElem) {
			currElem.addEventListener("mousedown", hanldeMouseDown);
			currElem.addEventListener("mousemove", handleMouseMove);

			currElem.addEventListener("touchstart", handleTouchStart);
		}

		return () => {
			if (currElem) {
				currElem.removeEventListener("mousedown", hanldeMouseDown);
				currElem.removeEventListener("mousemove", handleMouseMove);

				currElem.removeEventListener("touchstart", handleTouchStart);
			}
		};
	}, [element, getValueFromEvent, onValueChange]);

	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			if (isClicking.current) {
				const newValue = getValueFromEvent(event);
				if (newValue == null) {
					return;
				}
				onValueChange({ ...newValue, isConfirm: isClicking.current });
			}
		};
		const handleMouseUp = () => {
			isClicking.current = false;
		};

		const handleTouchMove = (event: TouchEvent) => {
			if (isTouching.current) {
				const newValue = getValueFromEvent(event.touches[0]);
				if (newValue == null) {
					return;
				}
				onValueChange({ ...newValue, isConfirm: isTouching.current });
			}
		};

		const handleTouchEnd = () => {
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
	}, [getValueFromEvent, onValueChange]);

	return element;
}
