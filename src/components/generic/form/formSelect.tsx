import {
	FormControl,
	InputLabel,
	MenuItem as MuiMenuItem,
	Select as MuiSelect,
} from "@mui/material";
import { useEffect, useId, useState, type ReactNode } from "react";
import type { MuiProps } from "./params";
import "./form.css";

export default function FormSelect<T extends string>({
	id,
	ref,
	inputRef,
	label,
	fullWidth,
	defaultValue,
	onChange,
	margin,
	variant,
	className,
	children,
	menuClassName,
}: {
	children: { value: T; children: ReactNode }[];
	menuClassName?: string;
} & MuiProps<T>) {
	const [{ value }, setValue] = useState<{ value: string | undefined }>({
		value: defaultValue,
	});

	useEffect(() => {
		setValue({ value: defaultValue });
	}, [defaultValue, id]);

	const labelId = useId();

	fullWidth ??= true;

	variant ??= "outlined";
	variant = variant === "noOutline" ? undefined : variant;

	margin ??= "none";

	return (
		<FormControl
			fullWidth={fullWidth}
			className={`baseFormItem formSelect ${className}`}
			margin={margin}
		>
			<InputLabel id={labelId}>{label}</InputLabel>
			<MuiSelect
				variant={variant}
				label="Media Type"
				value={value ?? ""}
				ref={ref}
				inputRef={inputRef}
				labelId={labelId}
				onChange={(event) => {
					const value = event.target.value;
					setValue({ value: value });
					onChange?.call(null, value as T);
				}}
				MenuProps={{ className: `formSelectMenu ${menuClassName}` }}
			>
				{children.map((child) => {
					return (
						<MuiMenuItem value={child.value}>{child.children}</MuiMenuItem>
					);
				})}
			</MuiSelect>
		</FormControl>
	);
}
