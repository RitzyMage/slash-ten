import { isComplete, Status, type TaskDetails } from "$lib/types/task-info";
import Indent from "$lib/util/indent";
import Task from "./task";
import type TaskObserver from "./task-observer";

export default class TaskSequence extends Task implements TaskObserver {
  constructor(
    tasks: Task[],
    {
      stopOnFail,
      prefix,
      indent,
    }: { stopOnFail?: boolean; prefix?: string; indent?: number } = {}
  ) {
    super();
    this._subtasks = tasks;
    this._stopOnFail = stopOnFail ?? false;
    this._prefix = prefix || "";
    this._indent = indent ?? 0;

    tasks.forEach((_) => _.addObserver(this));
    this.updateStatus({
      status: Status.STARTED,
      message: this.Prefix("Sequence queued"),
      completion: 0,
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

    let currentlyRunningIndex = subtaskInfo.findIndex(
      (_) => _.status === Status.IN_PROGRESS
    );

    let message: string;
    if (status === Status.IN_PROGRESS) {
      let thisMessage = `running task ${currentlyRunningIndex + 1} / ${
        subtaskInfo.length
      }`;
      let subtaskMessage =
        subtaskInfo[currentlyRunningIndex]?.message ?? "initializing...";
      subtaskMessage = Indent(subtaskMessage, 1);
      message = `${thisMessage}:\n${subtaskMessage}`;
    } else {
      message = `Finished ${subtaskInfo.length} subtasks`;
    }
    message = this.Prefix(message);
    message = Indent(message, this._indent);

    let completion =
      subtaskInfo.reduce((total, _) => total + _.completion, 0) /
      subtaskInfo.length;

    this.updateStatus({
      status,
      message,
      completion,
    });
  }

  private Prefix(message: string) {
    return this._prefix ? `${this._prefix}: ${message}` : message;
  }

  private _subtasks: Task[];
  private _stopOnFail: boolean;
  private _prefix: string;
  private _indent: number;
}
