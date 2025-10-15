import { clamp, type MinMaxType, type ProgressCSS } from "../../../utils/utils";
import "./progressBar.css";

const ProgressBar = ({
	progress,
	showPercentage,
	className,
	progressClassName,
	backgroundClassName,
	clamping,
}: {
	progress: number;
	showPercentage?: boolean;
	className?: string;
	progressClassName?: string;
	backgroundClassName?: string;
	clamping?: MinMaxType;
}) => {
	return (
		<div className={`flexRow spaceBetween verticalCenterItems ${className}`}>
			<div
				className={`progressBar flexGrow ${backgroundClassName}`}
				style={
					{
						"--progress": clamp(clamp(progress, clamping), { min: 0, max: 1 }),
					} as ProgressCSS
				}
			>
				<span className={progressClassName ?? "default"}></span>
			</div>
			{showPercentage ? (
				<span className="progressPercentage">
					{Math.round(progress * 100)}%
				</span>
			) : null}
		</div>
	);
};

export default ProgressBar;
