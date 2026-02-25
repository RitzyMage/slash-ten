import { Status } from "$lib/types/task-info";
import randomDateInRange, { FIVE_YEARS } from "$lib/util/random-date-in-range";
import addUsers from "$lib/server/db/users/add-users";
import type ReviewFetcher from "$lib/server/review-fetchers/review-fetcher";
import Task from "../task";
import UpdateMediaDate from "$lib/server/db/media/update-media-date";

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
    this.updateStatus({
      status: Status.IN_PROGRESS,
      message: `Get Reviewers for Book ${this._mediaId} started`,
      completion: 0,
    });

    const reviewers = await this._reviewFetcher.getMediaReviewers(
      this._mediaLink
    );

    await addUsers(
      reviewers.map((_) => ({
        externalId: _.id,
        mediaType: this._reviewFetcher.mediaType,
        name: _.name,
      }))
    );

    await UpdateMediaDate(
      this._mediaId,
      randomDateInRange(FIVE_YEARS)
    );

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
