import { Status } from "$lib/data-types/task-info";
import Database from "../db/database";
import type ReviewFetcher from "../review-fetchers/review-fetcher";
import Task from "./task";
import UserUpdater from "../user-updater";

class UpdateMineTask extends Task {
  constructor(fetcher: ReviewFetcher) {
    super();
    this._fetcher = fetcher;
    this._database = new Database();
    this._userUpdater = new UserUpdater(this._fetcher, this._database);
  }

  protected async _Run(): Promise<void> {
    this.updateStatus(Status.IN_PROGRESS, "job started");
    try {
      let userInfo = await this._fetcher.getUser(this._userId);
      if (!userInfo) {
        this.updateStatus(Status.FAILED, "failed to get user info");
        return;
      }
      this.updateStatus(Status.IN_PROGRESS, "got user info");

      let userDB = await this.addUserToDatabase(
        String(userInfo.id),
        userInfo?.name
      );
      this.updateStatus(Status.IN_PROGRESS, "added user to database");

      // goodreads shows different HTML when logged in, so we need to not be logged in when fetching
      // the original users' info
      await this._userUpdater.Update(
        userDB.id,
        this._userId,
        false,
        (message) => this.updateStatus(Status.IN_PROGRESS, message)
      );

      this.updateStatus(Status.SUCCESSFUL, `finished update`);
    } catch (e) {
      let error = e as Error;
      console.error(e);
      this.updateStatus(Status.FAILED, `failed with error ${error.message}`);
    }
  }

  private async addUserToDatabase(externalId: string, name: string) {
    return await this._database.addUserIfNotExists({
      externalId,
      name,
      mediaType: "BOOK",
    });
  }

  private _userId = "174808573";
  private _fetcher: ReviewFetcher;
  private _database: Database;
  private _userUpdater: UserUpdater;
}

export default UpdateMineTask;
