import { Status } from "$lib/server/tasks/task-info";
import type ReviewFetcher from "../review-fetchers/review-fetcher";
import GetBookReviewersTask from "./get-book-reviewers-task";
import Task from "./task";
import TaskSequenceWithInitialize from "./task-sequence-with-initialize";

const CHUNKS = 10;
const TIME = 200;

export default class UpdateBooksTask extends TaskSequenceWithInitialize {
  constructor({ reviewFetcher }: { reviewFetcher: ReviewFetcher }) {
    super();
    this._reviewFetcher = reviewFetcher;
  }

  protected async GetSequence(): Promise<Task[]> {
    // IMPLEMENT II: get books with a stale cache
    for (let i = 0; i < CHUNKS; ++i) {
      await new Promise((res) => setTimeout(res, TIME / CHUNKS));
      let timeLeft = ((1 - i / CHUNKS) * TIME) / 1000;
      this.updateStatus({
        status: Status.IN_PROGRESS,
        message: `Fetching book list (${timeLeft.toFixed(2)}s left)`,
        completion: i / CHUNKS,
      });
    }

    let books = [155, 2000, 3003];
    return books.map(
      (bookId) =>
        new GetBookReviewersTask({ bookId, reviewFetcher: this._reviewFetcher })
    );
  }

  protected get prefix(): string {
    return "getting all books";
  }

  private _reviewFetcher: ReviewFetcher;
}
