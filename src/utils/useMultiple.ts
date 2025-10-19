import { type RefObject } from "react";

export default function useMultipleRef<T extends HTMLElement>(
	...refs: (
		| RefObject<T | null>
		| ((ref: T | null) => void)
		| null
		| undefined
	)[]
) {
	return (node: T | null) => {
		for (const ref of refs) {
			if (!ref) {
				continue;
			} else if (typeof ref === "function") {
				ref(node);
			} else if (ref) {
				ref.current = node;
			}
		}
	};
}
