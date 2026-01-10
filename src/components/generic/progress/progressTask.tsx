import { useState } from "react";
import type ActivityTask from "../../../utils/activityTask";
import { parseError, type UUIDType } from "../../../utils/utils";
import ProgressBar from "./progressBar";
import "./progressTask.css";
import warnIcon from "assets/warning.png";

const ProgressTask = ({
	task,
	onDelete,
}: {
	task: ActivityTask<unknown>;
	onDelete: (id: UUIDType) => void;
}) => {
	const [forceClose, setForceCloseState] = useState(false);
	const failed = task.failed === true;

	const doClose =
		(task.progress / task.maxProgress === 1 && !failed) || forceClose;

	return (
		<div
			data-disabled={failed}
			className={`progressTask ${doClose ? "hide" : "show"} ${
				failed ? "failed" : ""
			} flexRow flexGrow`}
			onAnimationEnd={(event) => {
				if (event.animationName === "progressTask_hideAnim") {
					onDelete(task.id);
				}
			}}
		>
			<div className="flexColumn flexGrow0Width">
				<div className="progressLabel spaceBetween flexRow flexGrow">
					<span style={{ flex: "1 1 0px", width: "0" }}>
						{failed
							? parseError(task.result, {
									showDetails: true,
									title: task.label,
								})
							: task.label}
					</span>
					{failed ? (
						<img
							src={warnIcon}
							alt="warn icon"
							className="mediumIcon smallPadding verticalCenter"
						></img>
					) : null}
				</div>
				<ProgressBar
					progress={task.progress / task.maxProgress}
					clamping={{ min: task.maxProgress * 0.07 }}
					showPercentage={true}
					className="progressTaskBar"
					progressClassName={failed ? "fail" : undefined}
				/>
				{failed ? (
					<button
						type="button"
						onClick={() => {
							setForceCloseState(true);
						}}
					>
						Dismiss
					</button>
				) : null}
			</div>
		</div>
	);
};

export default ProgressTask;
