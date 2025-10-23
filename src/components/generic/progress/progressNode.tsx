import { useEffect, useState } from "react";
import ProgressCircle from "./progressCircle";
import ActivityTask, {
	activityTaskListener,
} from "../../../utils/activityTask";
import { clamp, type Alignment, type UUIDType } from "../../../utils/utils";
import Dropdown from "../dropdown";
import "./progressNode.css";
import ProgressTask from "./progressTask";
import warnIcon from "../../../assets/warningYellow.png";

const ProgressNode = ({
	size,
	className,
	alignment,
}: {
	size?: string;
	className?: string;
	alignment?: Alignment;
}) => {
	const [progress, setProgressState] = useState<number | undefined>();
	const [tasks, setTasksState] = useState<Map<UUIDType, ActivityTask<unknown>>>(
		new Map(),
	);

	useEffect(() => {
		const onProgressChange = ({
			task,
			isDeletion,
		}: {
			task: ActivityTask<unknown>;
			isDeletion: boolean;
		}) => {
			const newTasksMap = new Map(tasks.set(task.id, task));
			setTasksState(newTasksMap);

			if (isDeletion) {
				return;
			}

			const newTasks = Array.from(newTasksMap.values());

			const progresses = newTasks.map((item) => {
				if (item.result?.failed === true) return 1;

				return item.progress / item.maxProgress;
			});
			const progress =
				progresses.length > 0
					? progresses.reduce((prev, curr) => prev + curr) / progresses.length
					: progresses[0];

			setProgressState(progress ?? 1);
		};

		activityTaskListener.observe(onProgressChange);

		return () => {
			activityTaskListener.unobserve(onProgressChange);
		};
	}, [tasks]);

	alignment ??= "left";

	const isFinished = tasks.size === 0;

	const showHideClass =
		progress !== undefined ? (isFinished ? "hide" : "show") : "preHidden";

	const tasksArr = Array.from(tasks.values());

	const hasFailure = tasksArr.some((task) => task.result?.failed === true);

	return (
		<Dropdown
			className={className}
			dropdownButton={
				<div className="relative">
					<ProgressCircle
						progress={clamp(progress ?? 1, { min: 0.03 })}
						size={size}
						className={showHideClass}
						progressIndicatorStyle={{
							...(progress === 0 && tasks.size <= 1
								? {
										transition: "none",
									}
								: {}),
							...{ stroke: hasFailure ? "var(--colWarn)" : undefined },
						}}
					/>
					<img
						src={warnIcon}
						className={`largeIcon warnIcon ${hasFailure ? "show" : "hide"}`}
					></img>
				</div>
			}
			buttonClass="transparentBackground noPadding invisibleDisable"
			buttonProps={{ disabled: isFinished }}
			alignment={alignment}
		>
			{({ closeDropdown }) => {
				if (isFinished) {
					closeDropdown();
				}

				return (
					<div className="progressDropdown">
						{tasksArr.map((task) => {
							return (
								<ProgressTask
									key={task.id}
									task={task}
									onDelete={(id) => {
										tasks.delete(id);
										setTasksState(new Map(tasks));
									}}
								/>
							);
						})}
					</div>
				);
			}}
		</Dropdown>
	);
};

export default ProgressNode;
