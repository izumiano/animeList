import { useEffect, useRef, useState } from "react";

export const useOutsideClick = <T extends HTMLElement>(
	callback: () => void,
) => {
	const ref = useRef<T>(null);
	// const [isAdded, setIsAdded] = useState(false);

	useEffect(() => {
		// if (isAdded) return;

		const handleClickOutside = (event: MouseEvent | TouchEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				callback();
			}
		};

		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
		// setIsAdded(true);
	}, [callback]);

	return ref;
};

export const useWindowEvent = <T extends HTMLElement>(
	type: keyof WindowEventMap,
	callback: () => void,
) => {
	const ref = useRef<T>(null);

	useEffect(() => {
		const handleScroll = () => {
			callback();
		};

		window.addEventListener(type, handleScroll);

		return () => {
			window.removeEventListener(type, handleScroll);
		};
	}, [callback, type]);

	return ref;
};

export const useDomEvent = <T extends HTMLElement>({
	event,
	callback,
}: {
	event: keyof HTMLElementEventMap;
	callback: (element: T | null) => void;
}) => {
	const element = useRef<T>(null);

	useEffect(() => {
		const currentElement = element.current;
		if (!currentElement) {
			return;
		}

		const onEvent = () => {
			callback(element.current);
		};

		if (event === "resize") {
			const resizeObserver = new ResizeObserver(() => {
				onEvent();
			});
			resizeObserver.observe(currentElement);

			return () => {
				resizeObserver.unobserve(currentElement);
			};
		}

		currentElement.addEventListener(event, () => onEvent);
		return () => {
			currentElement.removeEventListener(event, onEvent);
		};
	}, [callback, element, event]);

	return element;
};

export const useOtherElementEvent = <T extends HTMLElement>({
	element,
	eventTypes,
	callback,
}: {
	element: React.RefObject<T | null>;
	eventTypes: readonly (keyof HTMLElementEventMap)[];
	callback: () => void;
}) => {
	const [isAdded, setIsAdded] = useState(false);

	useEffect(() => {
		if (isAdded) return;

		const handleEvent = () => {
			callback();
		};

		const currentElement = element.current;
		if (currentElement) {
			for (const eventType of eventTypes) {
				if (eventType === "resize") {
					const resizeObserver = new ResizeObserver(() => {
						callback();
					});
					resizeObserver.observe(currentElement);
					continue;
				}

				currentElement.addEventListener(eventType, handleEvent);
			}
			setIsAdded(true);
		}
	}, [callback, isAdded, element, eventTypes]);

	return element;
};
