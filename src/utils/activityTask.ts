import type { ReactNode } from "react";
import type BadResponse from "../external/responses/badResponse";
import { type UUIDType } from "./utils";
import { v4 as uuid } from "uuid";

export type ActivityTaskQueueType = Map<UUIDType, ActivityTask<unknown>>;
const taskQueue: ActivityTaskQueueType = new Map();

type ActivityTaskObserver = (args: {
  task: ActivityTask<unknown>;
  isDeletion: boolean;
}) => void;

export function pushTask(task: ActivityTask<unknown>) {
  taskQueue.set(task.id, task);
  return task.start();
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
    this.observers.forEach((notifyObserver) =>
      notifyObserver({ task: task, isDeletion: isDeletion })
    );
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
  task: ActivityTaskType<T>;

  result: { value: ActivityTaskReturnType<T>; failed: boolean } | undefined;

  private started = false;

  onProgressUpdate:
    | ((params: { progress: number; maxProgress: number }) => void)
    | undefined;

  constructor(params: {
    label: ReactNode;
    maxProgress?: number;
    task: ActivityTaskType<T>;
  }) {
    this.id = uuid() as UUIDType;
    this.label = params.label;
    this.maxProgress = params.maxProgress ?? 1;
    this.task = params.task;
  }

  private _onProgressUpdate(params: { progress: number; maxProgress: number }) {
    this.onProgressUpdate?.call(this, params);

    if (taskQueue.has(this.id)) {
      activityTaskListener.notify(this);
    }
  }

  public async start() {
    if (this.started) return;
    this.started = true;

    if (taskQueue.has(this.id)) {
      activityTaskListener.notify(this);
    }

    this._onProgressUpdate({
      progress: this.progress,
      maxProgress: this.maxProgress,
    });

    let taskResult;
    let failed = false;
    try {
      taskResult = await this.task({
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
    this.result = { value: taskResult, failed: failed };
    this._onProgressUpdate({
      progress: this.progress,
      maxProgress: this.maxProgress,
    });

    if (taskQueue.delete(this.id)) {
      activityTaskListener.notify(this, { isDeletion: true });
    }

    return taskResult;
  }
}
