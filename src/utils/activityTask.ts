type ActivityTaskType<T> = (params: {
  addProgress: (count?: number) => void;
  addMaxProgress: (count?: number) => void;
}) => Promise<T>;

export default class ActivityTask<T> {
  label: string;
  maxProgress: number;
  task: ActivityTaskType<T>;

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
    return await this.task({
      addProgress: (_count) => {},
      addMaxProgress: (_count) => {},
    });
  }
}
