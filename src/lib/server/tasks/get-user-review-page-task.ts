import { Status } from "$lib/task-info";
import Database from "../db/database";
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
    userId: string;
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
      message: `Get User ${this._userId} page ${this._page} calling ${this._reviewFetcher.serviceName} API`,
      completion: 0,
    });

    let reviews = await this._reviewFetcher.getUserReviews(
      this._userId,
      this._page
    );
    this.updateStatus({
      status: Status.IN_PROGRESS,
      message: `Get User ${this._userId} page ${this._page}, inserting into database...`,
      completion: 0.7,
    });

    await this._database.addMedia(reviews.media);

    this.updateStatus({
      status: Status.SUCCESSFUL,
      message: `Got User ${this._userId} page ${this._page}`,
      completion: 1,
    });
  }

  private _userId: string;
  private _page: number;
  private _reviewFetcher: ReviewFetcher;
  private _database = new Database();
}
