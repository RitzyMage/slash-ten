import { Status } from "$lib/data-types/task-info";
import Task from "./task";

export default class TimeoutTask extends Task {
  constructor(time: number) {
    super();
    this._time = time;
  }

  protected async _Run(): Promise<void> {
    this.updateStatus(Status.IN_PROGRESS, `Timeout for ${this._time} started`);
    await new Promise((res) => setTimeout(res, this._time));
    this.updateStatus(Status.SUCCESSFUL, `Timeout for ${this._time} finished`);
  }

  private _time: number;
}
