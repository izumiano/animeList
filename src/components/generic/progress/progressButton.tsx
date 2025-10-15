import type { ReactNode } from "react";
import "./progressButton.css";
import { clamp } from "../../../utils/utils";
import LoadingSpinner from "../loadingSpinner";

export type ProgressButtonState = {
	progress: number;
	state: "enabled" | "loading";
};

const ProgressButton = ({
	state,
	disabled,
	className,
	onClick,
	children,
}: {
	state: ProgressButtonState;
	disabled: boolean;
	className?: string;
	onClick: React.MouseEventHandler<HTMLButtonElement>;
	children: ReactNode;
}) => {
	const progress = clamp(state.progress, { min: 0, max: 1 });
	return (
		<button
			className={`progressButton ${className}`}
			disabled={disabled || state.state !== "enabled"}
			onClick={onClick}
		>
			<span
				className="progress"
				style={{ width: `calc(${progress} * 100%)` }}
			></span>
			{state.state === "enabled" ? (
				<span className="content">{children}</span>
			) : (
				<LoadingSpinner props={{ centered: true, size: "0.4rem" }} />
			)}
		</button>
	);
};

export default ProgressButton;
