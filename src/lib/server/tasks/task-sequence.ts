import { Status, type TaskInfo } from "$lib/data-types/task-info";
import Task from "./task";
import type TaskObserver from "./task-observer";

export default class TaskSequence extends Task implements TaskObserver {
  constructor(tasks: Task[]) {
    super();
    this._subtasks = tasks;
    tasks.forEach((_) => _.addObserver(this));
  }

  notify(info: TaskInfo): void {
    this.Update();
  }

  protected async _Run(): Promise<void> {
    for (let task of this._subtasks) {
      await task.Run(() => task.removeObserver(this));
    }
  }

  private GetStatuses() {
    return this._subtasks.map((_) => _.currentInfo);
  }

  private Update() {
    let subtaskInfo = this.GetStatuses();

    let status: Status = Status.IN_PROGRESS;
    if (subtaskInfo.some((_) => _.status === Status.FAILED)) {
      status = Status.FAILED;
    } else if (subtaskInfo.every((_) => _.status === Status.SUCCESSFUL)) {
      status = Status.SUCCESSFUL;
    }

    let message =
      `running tasks:\n` +
      subtaskInfo.map((_, i) => `\t${i + 1}: ${_.info}`).join("\n");

    let percentComplete =
      subtaskInfo.reduce((total, _) => total + _.completion, 0) /
      subtaskInfo.length;

    this.updateStatus(status, message, percentComplete);
  }

  private _subtasks: Task[];
}
