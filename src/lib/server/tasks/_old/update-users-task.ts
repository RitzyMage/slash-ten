import Task from "./task";
import type ReviewFetcher from "../review-fetchers/review-fetcher";
import Database from "../db/database";
import { Status } from "$lib/data-types/task-info";

class UpdateUsersTask extends Task {
  constructor(fetcher: ReviewFetcher) {
    super();
    this._fetcher = fetcher;
    this._database = new Database();
  }

  protected async _Run(): Promise<void> {
    this.updateStatus(Status.IN_PROGRESS, "job started");
    try {
      this.updateStatus(Status.IN_PROGRESS, "getting media...");
      let externalLinks = await this._database.getExternalLinks();
      for (let index in externalLinks) {
        let link = externalLinks[index];
        this.updateStatus(
          Status.IN_PROGRESS,
          `fetching ${link.mediaName} (${index}/${externalLinks.length})`
        );
        let newUsers = await this._fetcher.getOtherReviewers(link.link);
        this.updateStatus(
          Status.IN_PROGRESS,
          `updating users (${index}/${externalLinks.length})`
        );
        for (let user of newUsers) {
          await this._database.addUserIfNotExists({
            externalId: String(user.id),
            name: user.name,
            mediaType: "BOOK",
          });
        }
      }
      this.updateStatus(Status.SUCCESSFUL, `finished update`);
    } catch (e) {
      let error = e as Error;
      console.error(e);
      this.updateStatus(Status.FAILED, `failed with error ${error.message}`);
    }
  }

  private _fetcher: ReviewFetcher;
  private _database: Database;
}

export default UpdateUsersTask;
