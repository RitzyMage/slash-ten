import { Status } from "$lib/task-info";
import type ReviewFetcher from "../review-fetchers/review-fetcher";
import type { UserInfo } from "../review-fetchers/types";
import GetUserReviewPageTask from "./get-user-review-page-task";
import type Task from "./task";
import TaskSequenceWithInitialize from "./task-sequence-with-initialize";

export default class GetUserReviewsTask extends TaskSequenceWithInitialize {
  constructor({
    userInfo,
    reviewFetcher,
  }: {
    userInfo: UserInfo;
    reviewFetcher: ReviewFetcher;
  }) {
    super();
    this._userInfo = userInfo;
    this._reviewFetcher = reviewFetcher;
  }

  protected async GetSequence(): Promise<Task[]> {
    this.updateStatus({
      status: Status.IN_PROGRESS,
      message: `${this.prefix}: Fetching number of pages for user`,
      completion: 0,
    });
    let numPages = await this._reviewFetcher.getNumPages(this._userInfo.id);
    this.updateStatus({
      status: Status.IN_PROGRESS,
      message: `${this.prefix}: Fetched number of pages`,
      completion: 1 / (numPages + 1),
    });

    let pagesToFetch = Array.from({ length: numPages }).map((_, i) => i + 1);
    return pagesToFetch.map(
      (page) =>
        new GetUserReviewPageTask({
          userId: this._userInfo.id,
          page,
          reviewFetcher: this._reviewFetcher,
        })
    );
  }

  protected get prefix(): string {
    return `Getting info for user ${this._userInfo.name}`;
  }

  private _reviewFetcher: ReviewFetcher;
  private _userInfo: UserInfo;
}
