import { useEffect, useRef } from "react";

type TouchWithTimestamp = { touch: React.Touch; time: DOMHighResTimeStamp };

function calculateSpeed(
	startTouch: TouchWithTimestamp,
	currentTouch: React.Touch,
) {
	const deltaTime = performance.now() - startTouch.time;

	const delta = {
		x: currentTouch.clientX - startTouch.touch.clientX,
		y: currentTouch.clientY - startTouch.touch.clientY,
	};

	return { x: delta.x / deltaTime, y: delta.y / deltaTime };
}

export type OnTouchStartType = (params: {
	currentTouches: Map<number, TouchWithTimestamp>;
	event: TouchEvent;
}) => void;
export type OnTouchMoveType = (params: {
	totalMove: { x: number; y: number };
	speed: { x: number; y: number };
	event: TouchEvent;
}) => void;
export type OnTouchEndType = (params: {
	currentTouches: Map<number, TouchWithTimestamp>;
	speed: { x: number; y: number };
	event: TouchEvent;
}) => void;

export default function useTouch<T extends HTMLElement>({
	onStart,
	onMove,
	onEnd,
	minX: _minX,
	minY: _minY,
}: {
	onStart?: OnTouchStartType;
	onMove?: OnTouchMoveType;
	onEnd?: OnTouchEndType;
	minX?: number | { positive?: number; negative?: number };
	minY?: number | { positive?: number; negative?: number };
}) {
	const touchElemRef = useRef<T>(null);
	const touches = useRef<Map<number, TouchWithTimestamp>>(new Map());

	const hasStartedTouch = useRef(false);

	let minX: { positive: number; negative: number };
	let minY: { positive: number; negative: number };

	if (typeof _minX !== "object") {
		minX = { positive: _minX ?? 0, negative: _minX ?? 0 };
	} else {
		minX = { positive: _minX.positive ?? 0, negative: _minX.negative ?? 0 };
	}
	if (typeof _minY !== "object") {
		minY = { positive: _minY ?? 0, negative: _minY ?? 0 };
	} else {
		minY = { positive: _minY.positive ?? 0, negative: _minY.negative ?? 0 };
	}

	useEffect(() => {
		const currentElem = touchElemRef.current;

		if (!currentElem) return;

		const handleStart = (event: TouchEvent) => {
			for (let i = 0; i < event.changedTouches.length; i++) {
				const touch = event.changedTouches[i];
				touches.current.set(touch.identifier, {
					touch: touch,
					time: performance.now(),
				});
			}
			onStart?.call(touchElemRef, {
				currentTouches: touches.current,
				event: event,
			});
		};
		currentElem.addEventListener("touchstart", handleStart);

		const handleMove = (event: TouchEvent) => {
			const totalMove = { x: 0, y: 0 };
			const totalSpeed = { x: 0, y: 0 };
			for (let i = 0; i < event.touches.length; i++) {
				const touch = event.touches[i];
				const startTouch = touches.current.get(touch.identifier);
				if (!startTouch) {
					continue;
				}

				totalMove.x += touch.clientX - startTouch.touch.clientX;
				totalMove.y += touch.clientY - startTouch.touch.clientY;

				const speed = calculateSpeed(startTouch, touch);
				totalSpeed.x += speed.x;
				totalSpeed.y += speed.y;
			}

			if (
				!hasStartedTouch.current &&
				((totalMove.x < minX.positive && totalMove.x > -minX.negative) ||
					(totalMove.y < minY.positive && totalMove.y > -minY.negative))
			) {
				return;
			}
			hasStartedTouch.current = true;
			event.preventDefault();
			onMove?.call(touchElemRef, {
				totalMove: totalMove,
				speed: totalSpeed,
				event: event,
			});
		};
		currentElem.addEventListener("touchmove", handleMove);

		const handleEnd = (event: TouchEvent) => {
			const totalSpeed = { x: 0, y: 0 };
			const touchesToCheck = new Set(
				Array.from(event.changedTouches).concat(Array.from(event.touches)),
			);
			for (const touch of touchesToCheck) {
				const startTouch = touches.current.get(touch.identifier);
				if (!startTouch) {
					continue;
				}

				const speed = calculateSpeed(startTouch, touch);
				totalSpeed.x += speed.x;
				totalSpeed.y += speed.y;
			}
			for (let i = 0; i < event.changedTouches.length; i++) {
				const touch = event.changedTouches[i];
				touches.current.delete(touch.identifier);
			}
			onEnd?.call(touchElemRef, {
				currentTouches: touches.current,
				speed: totalSpeed,
				event: event,
			});

			if (touches.current.size === 0) {
				hasStartedTouch.current = false;
			}
		};
		currentElem.addEventListener("touchend", handleEnd);
		currentElem.addEventListener("touchcancel", handleEnd);

		return () => {
			currentElem.removeEventListener("touchstart", handleStart);
			currentElem.removeEventListener("touchmove", handleMove);
			currentElem.removeEventListener("touchend", handleEnd);
			currentElem.removeEventListener("touchcancel", handleEnd);
		};
	}, [onStart, onMove, onEnd, minX, minY]);

	return touchElemRef;
}
