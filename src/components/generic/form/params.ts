import type { ReactNode } from "react";

export type MuiProps<T> = {
	id: string;
	ref?: React.RefObject<HTMLDivElement | null> | null | undefined;
	inputRef?: React.RefObject<HTMLInputElement | null> | null | undefined;
	label?: ReactNode;
	fullWidth?: boolean;
	variant?: "outlined" | "noOutline";
	defaultValue?: T;
	onChange?: (value: T) => void;
	margin?: "normal" | "dense" | "none";
	className?: string;
	disabled?: boolean;
};
