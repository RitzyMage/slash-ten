import { Status } from "$lib/data-types/task-info";
import Task from "./task";

const CHUNKS = 100;

export default class TimeoutTask extends Task {
  constructor(time: number) {
    super();
    this._time = time;
  }

  protected async _Run(): Promise<void> {
    this.updateStatus(
      Status.IN_PROGRESS,
      `Timeout for ${this._time} started`,
      0
    );

    for (let i = 0; i < CHUNKS; ++i) {
      await new Promise((res) => setTimeout(res, this._time / CHUNKS));
      this.updateStatus(Status.IN_PROGRESS, `Waiting...`, i / CHUNKS);
    }

    this.updateStatus(
      Status.SUCCESSFUL,
      `Timeout for ${this._time} finished`,
      1
    );
  }

  private _time: number;
}
