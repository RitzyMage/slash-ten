import { Status } from "$lib/data-types/task-info";
import Database from "../db/database";
import type ReviewFetcher from "../review-fetchers/review-fetcher";
import Task from "./task";
import UserUpdater from "../user-updater";

class UpdateReviewsTask extends Task {
  constructor(fetcher: ReviewFetcher) {
    super();
    this._database = new Database();
    this._updater = new UserUpdater(fetcher, this._database);
  }

  protected async _Run(): Promise<void> {
    this.updateStatus(Status.IN_PROGRESS, "job started");
    try {
      let users = await this._database.getUsersWithNoReviews();
      for (let i in users) {
        let user = users[i];
        try {
          this.updateStatus(
            Status.IN_PROGRESS,
            `fetching ${user.name} (${i}/${users.length})`
          );
          await this._updater.Update(
            user.id,
            user.externalId,
            true,
            (message) =>
              this.updateStatus(
                Status.IN_PROGRESS,
                `${user.name} (${i}/${users.length}):\n${message}\n`
              )
          );
        } catch (e) {
          console.error("error while updating", user);
          console.error(e);
        }
      }
      this.updateStatus(Status.SUCCESSFUL, "job finished");
    } catch (e) {
      let error = e as Error;
      console.error(e);
      this.updateStatus(Status.FAILED, `failed with error ${error.message}`);
    }
  }

  private _database: Database;
  private _updater: UserUpdater;
}

export default UpdateReviewsTask;
