import { Status } from "$lib/types/task-info";
import randomDateInRange, {  TWO_YEARS } from "$lib/util/random-date-in-range";
import { UpdateUserDate } from "$lib/server/db/users/update-user-date";
import Task from "../task";

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

    await UpdateUserDate(
      this._id,
      randomDateInRange(TWO_YEARS)
    );

    this.updateStatus({
      status: Status.SUCCESSFUL,
      message: `Updating cache for user ${this._id}`,
      completion: 1,
    });
  }

  private _id: number;
}
