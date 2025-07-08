import { Status } from "$lib/task-info";
import type ReviewFetcher from "../review-fetchers/review-fetcher";
import Task from "./task";

const TEST_TIME = 200;
const CHUNKS = 10;

export default class GetMediaReviewersTask extends Task {
  constructor({
    mediaId,
    mediaLink,
    reviewFetcher,
  }: {
    mediaId: number;
    mediaLink: string;
    reviewFetcher: ReviewFetcher;
  }) {
    super();
    this._mediaId = mediaId;
    this._mediaLink = mediaLink;
    this._reviewFetcher = reviewFetcher;
  }

  protected async _Run(): Promise<void> {
    // IMPLEMENT II: get user reviews for book
    this.updateStatus({
      status: Status.IN_PROGRESS,
      message: `Get Reviewers for Book ${this._mediaId} started`,
      completion: 0,
    });

    const reviews = await this._reviewFetcher.getMediaReviewers(
      this._mediaLink
    );
    console.log(reviews);

    // add reviewers

    // update stale

    this.updateStatus({
      status: Status.SUCCESSFUL,
      message: `Got Reviewers for Book ${this._mediaId}`,
      completion: 1,
    });
  }

  private _mediaId: number;
  private _mediaLink: string;
  private _reviewFetcher: ReviewFetcher;
}
