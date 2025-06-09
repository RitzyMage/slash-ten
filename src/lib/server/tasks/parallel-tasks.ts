import { isComplete, Status, type TaskDetails } from "$lib/task-info";
import Task from "./task";
import type TaskObserver from "./task-observer";

export default class ParallelTasks extends Task implements TaskObserver {
  constructor(tasks: Task[]) {
    super();
    this._subtasks = tasks;

    tasks.forEach((_) => _.addObserver(this));
    this.updateStatus({
      status: Status.STARTED,
      message: "Parallel tasks queued",
      completion: 0,
      details: this.GetStatuses(),
      parallel: true,
    });
  }

  notify(info: TaskDetails): void {
    this.Update();
  }

  protected async _Run(): Promise<void> {
    await Promise.all(
      this._subtasks.map((task) => task.Run(() => task.removeObserver(this)))
    );
  }

  private GetStatuses() {
    return this._subtasks.map((_) => _.currentInfo);
  }

  private Update() {
    let subtaskInfo = this.GetStatuses();

    let status: Status = Status.IN_PROGRESS;
    if (subtaskInfo.every((_) => _.status === Status.FAILED)) {
      status = Status.FAILED;
    } else if (subtaskInfo.every(isComplete)) {
      status = Status.SUCCESSFUL;
    }

    let message = `running tasks in parallel`;

    let completion =
      subtaskInfo.reduce((total, _) => total + _.completion, 0) /
      subtaskInfo.length;

    this.updateStatus({
      status,
      message,
      completion,
      details: subtaskInfo,
      parallel: true,
    });
  }

  private _subtasks: Task[];
}
