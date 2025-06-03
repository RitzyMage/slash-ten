import { Status } from "$lib/data-types/task-info";
import Task from "./task";

const TEST_TIME = 200;
const CHUNKS = 10;

export default class GetUserReviewPageTask extends Task {
  constructor({ userId, page }: { userId: number; page: number }) {
    super();
    this._userId = userId;
    this._page = page;
  }

  protected async _Run(): Promise<void> {
    // IMPLEMENT I: get user reviews, add to database
    this.updateStatus({
      status: Status.IN_PROGRESS,
      message: `Get User ${this._userId} page ${this._page} started`,
      completion: 0,
    });

    for (let i = 0; i < CHUNKS; ++i) {
      await new Promise((res) => setTimeout(res, TEST_TIME / CHUNKS));
      let timeLeft = ((1 - i / CHUNKS) * TEST_TIME) / 1000;
      this.updateStatus({
        status: Status.IN_PROGRESS,
        message: `Get User ${this._userId} page ${
          this._page
        } (${timeLeft.toFixed(2)}s left)`,
        completion: i / CHUNKS,
      });
    }

    this.updateStatus({
      status: Status.SUCCESSFUL,
      message: `Get User ${this._userId} page ${this._page}`,
      completion: 1,
    });
  }

  private _userId: number;
  private _page: number;
}
