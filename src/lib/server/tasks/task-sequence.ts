import { Status, type TaskInfo } from "$lib/data-types/task-info";
import Task from "./task";
import type TaskObserver from "./task-observer";

export default class TaskSequence extends Task implements TaskObserver {
  constructor(tasks: Task[], indent = 0) {
    super();
    this._subtasks = tasks;
    this._indent = indent;
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
      `${this.GetIndentTabs()}running tasks:\n` +
      subtaskInfo
        .map(
          (_, i) => `${this.GetIndentTabs(this._indent + 1)}${i + 1}: ${_.info}`
        )
        .join("\n");

    let percentComplete =
      subtaskInfo.reduce((total, _) => total + _.completion, 0) /
      subtaskInfo.length;

    this.updateStatus(status, message, percentComplete);
  }

  private GetIndentTabs(numTabs = this._indent) {
    return new Array(numTabs).map((_) => "\t").join("");
  }

  private _subtasks: Task[];
  private _indent = 0;
}
