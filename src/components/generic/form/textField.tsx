import { TextField as MuiTextField } from "@mui/material";
import { useEffect, useState } from "react";
import type { MuiProps } from "./params";
import "./form.css";

const TextField = ({
	id,
	ref,
	inputRef,
	label,
	fullWidth,
	variant,
	defaultValue,
	placeholder,
	onChange,
	margin,
	className,
}: {
	placeholder?: string | { useDefaultValue?: boolean };
} & MuiProps<string>) => {
	const [{ value }, setValue] = useState({ value: defaultValue });

	useEffect(() => {
		setValue({ value: defaultValue });
	}, [defaultValue, id]);

	fullWidth ??= true;

	variant ??= "outlined";
	variant = variant === "noOutline" ? undefined : variant;

	margin ??= "none";

	placeholder ??= { useDefaultValue: true };
	placeholder =
		typeof placeholder === "object"
			? placeholder.useDefaultValue
				? defaultValue
				: ""
			: placeholder;

	return (
		<MuiTextField
			ref={ref}
			inputRef={inputRef}
			fullWidth={fullWidth}
			label={label}
			variant={variant}
			value={value ?? ""}
			placeholder={placeholder}
			onChange={(event) => {
				const value = event.target.value;
				setValue({ value: value });
				onChange?.call(this, value);
			}}
			margin={margin}
			className={`baseFormItem formTextField ${className}`}
		/>
	);
};

export default TextField;
