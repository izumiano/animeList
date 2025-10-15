import { useEffect } from "react";
import type Signal from "./signal";

/**
 *
 * @param signal
 * @param onNotify Make sure the function is wrapped in a useCallback
 */
export default function useSignal<T>(
	signal: Signal<T>,
	onNotify: (value: T) => void,
) {
	useEffect(() => {
		onNotify(signal.value);

		signal.observe(onNotify);

		return () => signal.unobserve(onNotify);
	}, [onNotify, signal]);
}
