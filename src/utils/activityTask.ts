import type { UUIDType } from "./utils";
import { v4 } from "uuid";

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

type ActivityTaskType<T> = (params: {
  addProgress: (count?: number) => void;
  addMaxProgress: (count?: number) => void;
}) => Promise<T>;

export default class ActivityTask<T> {
  id: UUIDType;

  label: string;
  progress = 0;
  maxProgress: number;
  task: ActivityTaskType<T>;

  private started = false;

  onProgressUpdate:
    | ((params: { progress: number; maxProgress: number }) => void)
    | undefined;

  constructor(params: {
    label: string;
    maxProgress?: number;
    task: ActivityTaskType<T>;
  }) {
    this.id = v4() as UUIDType;
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

    const taskResult = await this.task({
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

    this.progress = this.maxProgress;
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
