import { useEffect, useRef } from "react";

type TouchWithTimestamp = { touch: React.Touch; time: DOMHighResTimeStamp };

function calculateSpeed(
  startTouch: TouchWithTimestamp,
  currentTouch: React.Touch
) {
  const deltaTime = performance.now() - startTouch.time;

  const delta = {
    x: currentTouch.clientX - startTouch.touch.clientX,
    y: currentTouch.clientY - startTouch.touch.clientY,
  };

  return { x: delta.x / deltaTime, y: delta.y / deltaTime };
}

export default function useTouch<T extends HTMLElement>({
  onStart,
  onMove,
  onEnd,
}: {
  onStart?: (currentTouches: Map<number, TouchWithTimestamp>) => void;
  onMove?: (params: {
    totalMove: { x: number; y: number };
    speed: { x: number; y: number };
  }) => void;
  onEnd?: (params: {
    currentTouches: Map<number, TouchWithTimestamp>;
    speed: { x: number; y: number };
  }) => void;
}) {
  const touchElemRef = useRef<T>(null);
  const touches = useRef<Map<number, TouchWithTimestamp>>(new Map());

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
      onStart?.call(touchElemRef, touches.current);
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

        // toast(startTouch.clientX === undefined ? "true" : "false");

        totalMove.x += touch.clientX - startTouch.touch.clientX;
        totalMove.y += touch.clientY - startTouch.touch.clientY;

        const speed = calculateSpeed(startTouch, touch);
        totalSpeed.x += speed.x;
        totalSpeed.y += speed.y;
      }
      onMove?.call(touchElemRef, { totalMove: totalMove, speed: totalSpeed });
    };
    currentElem.addEventListener("touchmove", handleMove);

    const handleEnd = (event: TouchEvent) => {
      const totalSpeed = { x: 0, y: 0 };
      const touchesToCheck = new Set(
        Array.from(event.changedTouches).concat(Array.from(event.touches))
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
      });
    };
    currentElem.addEventListener("touchend", handleEnd);
    currentElem.addEventListener("touchcancel", handleEnd);

    return () => {
      currentElem.removeEventListener("touchstart", handleStart);
      currentElem.removeEventListener("touchmove", handleMove);
      currentElem.removeEventListener("touchend", handleEnd);
      currentElem.removeEventListener("touchcancel", handleEnd);
    };
  }, [onStart, onMove, onEnd]);

  return touchElemRef;
}
