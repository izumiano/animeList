type ActivityTaskType<T> = (params: {
  addProgress: (count?: number) => void;
  addMaxProgress: (count?: number) => void;
}) => Promise<T>;

export default class ActivityTask<T> {
  label: string;
  progress = 0;
  maxProgress: number;
  task: ActivityTaskType<T>;

  onProgressUpdate:
    | ((params: { progress: number; maxProgress: number }) => void)
    | undefined;

  constructor(params: {
    label: string;
    maxProgress: number;
    task: ActivityTaskType<T>;
  }) {
    this.label = params.label;
    this.maxProgress = params.maxProgress;
    this.task = params.task;
  }

  public async start() {
    this.onProgressUpdate?.call(this, {
      progress: this.progress,
      maxProgress: this.maxProgress,
    });

    return await this.task({
      addProgress: (count) => {
        this.progress += count ?? 1;

        this.onProgressUpdate?.call(this, {
          progress: this.progress,
          maxProgress: this.maxProgress,
        });
      },
      addMaxProgress: (count) => {
        this.maxProgress += count ?? 1;

        this.onProgressUpdate?.call(this, {
          progress: this.progress,
          maxProgress: this.maxProgress,
        });
      },
    });
  }
}
