import { Status } from "$lib/task-info";
import { MONTH, randomDateInRange } from "../date-utils/date-ranges";
import Database from "../db/database";
import Task from "./task";

export default class UpdateUserCacheTask extends Task {
  constructor({ id }: { id: number }) {
    super();
    this._id = id;
  }

  protected async _Run(): Promise<void> {
    this.updateStatus({
      status: Status.IN_PROGRESS,
      message: `Updating cache for user ${this._id}`,
      completion: 0,
    });

    await this._database.updateUserNextUpdate(
      this._id,
      randomDateInRange(MONTH)
    );

    this.updateStatus({
      status: Status.SUCCESSFUL,
      message: `Updating cache for user ${this._id}`,
      completion: 1,
    });
  }

  private _id: number;
  private _database = new Database();
}
