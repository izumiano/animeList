import type { ReactNode } from "react";
import "./toggle.css";
import type { Property } from "csstype";

const Toggle = ({
	label,
	checked,
	margin,
	onChange,
}: {
	label?: ReactNode | undefined;
	checked: boolean;
	margin?: Property.Margin;
	onChange: () => void;
}) => {
	const checkedClass = checked ? "checked" : "";

	margin ??= "var(--mediumMargin)";

	return (
		<label
			className={`flexRow toggleContainer ${checkedClass}`}
			style={{ margin: margin }}
		>
			<span className="flexGrow leftAlignedText verticalCenterItems">
				{label}
			</span>
			<input type="checkbox" checked={checked} onChange={onChange} />
			<div className="toggle"></div>
		</label>
	);
};

export default Toggle;
