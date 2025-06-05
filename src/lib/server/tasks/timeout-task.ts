import { Status } from "$lib/server/tasks/task-info";
import Task from "./task";

const CHUNKS = 20;

export default class TimeoutTask extends Task {
  constructor(time: number, fail: boolean = false) {
    super();
    this._time = time;
    this._fail = fail;
  }

  protected async _Run(): Promise<void> {
    this.updateStatus({
      status: Status.IN_PROGRESS,
      message: `Timeout for ${this._time} started`,
      completion: 0,
    });

    for (let i = 0; i < CHUNKS; ++i) {
      await new Promise((res) => setTimeout(res, this._time / CHUNKS));
      let timeLeft = ((1 - i / CHUNKS) * this._time) / 1000;
      this.updateStatus({
        status: Status.IN_PROGRESS,
        message: `Waiting for ${timeLeft.toFixed(2)}s`,
        completion: i / CHUNKS,
      });
    }

    this.updateStatus({
      status: this._fail ? Status.FAILED : Status.SUCCESSFUL,
      message: `Timeout for ${this._time} finished`,
      completion: 1,
    });
  }

  private _time: number;
  private _fail: boolean;
}
