import type { ReactNode } from "react";
import { v4 as uuid } from "uuid";
import type BadResponse from "../external/responses/badResponse";
import { type ShowErrorParams, showError, type UUIDType } from "./utils";

export type ActivityTaskQueueType = Map<UUIDType, ActivityTask<unknown>>;
const taskQueue: ActivityTaskQueueType = new Map();

type ActivityTaskObserver = (args: {
	task: ActivityTask<unknown>;
	isDeletion: boolean;
}) => void;

export async function pushTask<T>(
	task: ActivityTask<T> | { label: ReactNode; value: T; isError?: boolean },
) {
	if (!(task instanceof ActivityTask)) {
		const obj = task;
		task = new ActivityTask({
			label: task.label,
			value: obj.value,
			failed: obj.isError,
		});
	}

	taskQueue.set(task.id, task);
	await task.start();
	return task;
}

class ActivityTaskListener {
	private observers: Set<ActivityTaskObserver> = new Set();

	public observe(observer: ActivityTaskObserver) {
		this.observers.add(observer);
	}

	public unobserve(observer: ActivityTaskObserver) {
		this.observers.delete(observer);
	}

	public notify(task: ActivityTask<unknown>, args?: { isDeletion: boolean }) {
		const isDeletion = args?.isDeletion ?? false;
		this.observers.forEach((notifyObserver) => {
			notifyObserver({ task: task, isDeletion: isDeletion });
		});
	}
}
export const activityTaskListener = new ActivityTaskListener();

type ActivityTaskReturnType<T> = T | BadResponse | Error | undefined | null;

type ActivityTaskType<T> = (params: {
	addProgress: (count?: number) => void;
	addMaxProgress: (count?: number) => void;
}) => Promise<ActivityTaskReturnType<T>>;

export default class ActivityTask<T> {
	id: UUIDType;

	label: ReactNode;
	progress = 0;
	maxProgress: number;
	task?: ActivityTaskType<T>;

	result: ActivityTaskReturnType<T> | undefined;
	failed: boolean;

	private started = false;

	onProgressUpdate:
		| ((params: { progress: number; maxProgress: number }) => void)
		| undefined;

	constructor(
		params: {
			label: ReactNode;
			maxProgress?: number;
		} & (
			| { task: ActivityTaskType<T> }
			| { value: ActivityTaskReturnType<T>; failed?: boolean; task?: undefined }
		),
	) {
		this.id = uuid() as UUIDType;
		this.label = params.label;
		this.maxProgress = params.maxProgress ?? 1;
		this.task = params.task;

		this.failed = false;

		if (!params.task) {
			this.result = params.value;
			this.failed = !!params.failed;
		}
	}

	private _onProgressUpdate(params: { progress: number; maxProgress: number }) {
		this.onProgressUpdate?.call(this, params);

		if (taskQueue.has(this.id)) {
			activityTaskListener.notify(this);
		}
	}

	public async start() {
		if (this.started) return this.result;
		this.started = true;

		if (taskQueue.has(this.id)) {
			activityTaskListener.notify(this);
		}

		this._onProgressUpdate({
			progress: this.progress,
			maxProgress: this.maxProgress,
		});

		if (this.result) {
			return this.result;
		}

		let taskResult: ActivityTaskReturnType<T> | undefined;
		let failed = false;
		try {
			taskResult = await this.task?.call(this, {
				addProgress: (count) => {
					this.progress += count ?? 1;

					this._onProgressUpdate({
						progress: this.progress,
						maxProgress: this.maxProgress,
					});
				},
				addMaxProgress: (count) => {
					this.maxProgress += count ?? 1;

					this._onProgressUpdate({
						progress: this.progress,
						maxProgress: this.maxProgress,
					});
				},
			});
		} catch (ex) {
			taskResult = ex as Error;
			failed = true;
		}

		if (taskResult instanceof Error) {
			failed = true;
		} else {
			this.progress = this.maxProgress;
		}
		this.result = taskResult;
		this.failed = failed;
		this._onProgressUpdate({
			progress: this.progress,
			maxProgress: this.maxProgress,
		});

		if (taskQueue.delete(this.id)) {
			activityTaskListener.notify(this, { isDeletion: true });
		}

		return taskResult;
	}

	public showError(params?: ShowErrorParams) {
		showError(this.result, this.label, params);
	}
}
