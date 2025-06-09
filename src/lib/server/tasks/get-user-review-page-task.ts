import { Status } from "$lib/task-info";
import type ReviewFetcher from "../review-fetchers/review-fetcher";
import Task from "./task";

const TEST_TIME = 200;
const CHUNKS = 10;

export default class GetUserReviewPageTask extends Task {
  constructor({
    userId,
    page,
    reviewFetcher,
  }: {
    userId: number;
    page: number;
    reviewFetcher: ReviewFetcher;
  }) {
    super();
    this._userId = userId;
    this._page = page;
    this._reviewFetcher = reviewFetcher;
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
  private _reviewFetcher: ReviewFetcher;
}
