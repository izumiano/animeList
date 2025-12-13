import type { ReactNode } from "react";
import "./toggle.css";
import type { Property } from "csstype";

const Toggle = ({
	label,
	checked,
	margin,
	showToggleSlider,
	onChange,
}: {
	label?: ReactNode | undefined;
	checked: boolean;
	margin?: Property.Margin;
	showToggleSlider?: boolean;
	onChange: () => void;
}) => {
	const checkedClass = checked ? "checked" : "";

	margin ??= "var(--mediumMargin)";
	showToggleSlider ??= true;

	return (
		<label
			className={`flexRow toggleContainer ${checkedClass}`}
			style={{ margin: margin }}
		>
			<span className="flexGrow leftAlignedText alignContentCenter">
				{label}
			</span>
			<input type="checkbox" checked={checked} onChange={onChange} />
			{showToggleSlider ? <div className="toggle"></div> : null}
		</label>
	);
};

export default Toggle;
