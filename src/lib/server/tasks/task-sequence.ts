import {
  isComplete,
  Status,
  type TaskDetails,
} from "$lib/data-types/task-info";
import Task from "./task";
import type TaskObserver from "./task-observer";

export default class TaskSequence extends Task implements TaskObserver {
  constructor(tasks: Task[], { stopOnFail }: { stopOnFail?: boolean } = {}) {
    super();
    this._subtasks = tasks;
    this._stopOnFail = stopOnFail ?? false;

    tasks.forEach((_) => _.addObserver(this));
    this.updateStatus({
      status: Status.STARTED,
      message: "Sequence queued",
      completion: 0,
      details: this.GetStatuses(),
      parallel: false,
    });
  }

  notify(info: TaskDetails): void {
    this.Update();
  }

  protected async _Run(): Promise<void> {
    for (let task of this._subtasks) {
      await task.Run(() => task.removeObserver(this));
      if (this.currentInfo.status === Status.FAILED) {
        return;
      }
    }
  }

  private GetStatuses() {
    return this._subtasks.map((_) => _.currentInfo);
  }

  private Update() {
    let subtaskInfo = this.GetStatuses();

    let status: Status = Status.IN_PROGRESS;
    if (
      this._stopOnFail
        ? subtaskInfo.some((_) => _.status === Status.FAILED)
        : subtaskInfo.every((_) => _.status === Status.FAILED)
    ) {
      status = Status.FAILED;
    } else if (subtaskInfo.every((_) => isComplete(_))) {
      status = Status.SUCCESSFUL;
    }

    let message =
      status === Status.IN_PROGRESS
        ? `running task ${
            subtaskInfo.findIndex((_) => _.status === Status.IN_PROGRESS) + 1
          } / ${subtaskInfo.length}`
        : `Finished ${subtaskInfo.length} subtasks`;

    let completion =
      subtaskInfo.reduce((total, _) => total + _.completion, 0) /
      subtaskInfo.length;

    this.updateStatus({
      status,
      message,
      completion,
      details: subtaskInfo,
      parallel: false,
    });
  }

  private _subtasks: Task[];
  private _stopOnFail: boolean;
}
