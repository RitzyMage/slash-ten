import Database from "../db/database";
import type ReviewFetcher from "../review-fetchers/review-fetcher";
import GetMediaReviewersTask from "./get-media-reviewers-task";
import Task from "./task";
import TaskSequenceWithInitialize from "./task-sequence-with-initialize";

const LIMIT = 100;

export default class UpdateBooksTask extends TaskSequenceWithInitialize {
  constructor({ reviewFetcher }: { reviewFetcher: ReviewFetcher }) {
    super();
    this._reviewFetcher = reviewFetcher;
  }

  protected async GetSequence(): Promise<Task[]> {
    let staleMedia = await this._database.getStaleMedia(
      this._reviewFetcher.mediaType,
      LIMIT
    );
    return staleMedia.map(
      (media) =>
        new GetMediaReviewersTask({
          mediaId: media.id,
          mediaLink: media.link,
          reviewFetcher: this._reviewFetcher,
        })
    );
  }

  protected get prefix(): string {
    return "getting stale books";
  }

  private _reviewFetcher: ReviewFetcher;
  private _database: Database = new Database();
}
