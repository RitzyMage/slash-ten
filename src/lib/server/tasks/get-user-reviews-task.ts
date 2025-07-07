import { Status } from "$lib/task-info";
import type ReviewFetcher from "../review-fetchers/review-fetcher";
import GetUserReviewPageTask from "./get-user-review-page-task";
import type Task from "./task";
import TaskSequenceWithInitialize from "./task-sequence-with-initialize";

export default class GetUserReviewsTask extends TaskSequenceWithInitialize {
  constructor({
    userId,
    externalUserId,
    reviewFetcher,
    username,
  }: {
    userId: number;
    externalUserId: string;
    reviewFetcher: ReviewFetcher;
    username: string;
  }) {
    super();
    this._externalUserId = externalUserId;
    this._userId = userId;
    this._reviewFetcher = reviewFetcher;
    this._username = username;
  }

  protected async GetSequence(): Promise<Task[]> {
    this.updateStatus({
      status: Status.IN_PROGRESS,
      message: `${this.prefix}: Fetching number of pages for user`,
      completion: 0,
    });
    let numPages = await this._reviewFetcher.getNumPages(this._externalUserId);
    this.updateStatus({
      status: Status.IN_PROGRESS,
      message: `${this.prefix}: Fetched number of pages`,
      completion: 1 / (numPages + 1),
    });

    let pagesToFetch = Array.from({ length: numPages }).map((_, i) => i + 1);
    return pagesToFetch.map(
      (page) =>
        new GetUserReviewPageTask({
          externalUserId: this._externalUserId,
          userId: this._userId,
          page,
          reviewFetcher: this._reviewFetcher,
        })
    );
  }

  protected get prefix(): string {
    return `Getting info for user ${this._username}`;
  }

  private _reviewFetcher: ReviewFetcher;
  private _userId: number;
  private _externalUserId: string;
  private _username: string;
}
