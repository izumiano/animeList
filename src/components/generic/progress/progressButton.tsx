import type { ReactNode } from "react";
import "./progressButton.css";
import { clamp } from "../../../utils/utils";
import LoadingSpinner from "../loadingSpinner";
import RainbowOutline from "../rainbowOutline";

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
		<RainbowOutline
			elementType={"button"}
			borderSize={2}
			blurSize={5}
			className={`progressButton ${className}`}
			disabled={disabled || state.state !== "enabled"}
			onClick={onClick}
		>
			<span
				className="progress"
				style={{ width: `calc(${progress} * 100%)` }}
			></span>
			<div className="progress__content">
				{state.state === "enabled" ? (
					<span>{children}</span>
				) : (
					<LoadingSpinner props={{ centered: true, size: "0.4rem" }} />
				)}
			</div>
		</RainbowOutline>
	);
};

export default ProgressButton;
