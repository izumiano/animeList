import { useEffect, useState } from "react";
import Signal from "./signal";

/**
 *
 * @param signal
 * @param onNotify Make sure the function is wrapped in a useCallback
 */
export default function useSignal<T>(
	signal: Signal<T> | T,
	onNotify: (value: T) => void,
) {
	const [_signal] = useState(
		(() => {
			if (signal instanceof Signal) {
				return signal;
			}
			return new Signal(signal);
		})(),
	);

	useEffect(() => {
		onNotify(_signal.value);

		_signal.observe(onNotify);

		return () => _signal.unobserve(onNotify);
	}, [onNotify, _signal]);

	return _signal;
}
