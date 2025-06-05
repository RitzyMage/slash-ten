import { Status } from "$lib/data-types/task-info";
import Task from "./task";

const TEST_TIME = 200;
const CHUNKS = 10;

export default class GetBookReviewersTask extends Task {
  constructor({ bookId }: { bookId: number }) {
    super();
    this._bookId = bookId;
  }

  protected async _Run(): Promise<void> {
    // IMPLEMENT II: get user reviews for book
    this.updateStatus({
      status: Status.IN_PROGRESS,
      message: `Get Book ${this._bookId} started`,
      completion: 0,
    });

    for (let i = 0; i < CHUNKS; ++i) {
      await new Promise((res) => setTimeout(res, TEST_TIME / CHUNKS));
      let timeLeft = ((1 - i / CHUNKS) * TEST_TIME) / 1000;
      this.updateStatus({
        status: Status.IN_PROGRESS,
        message: `Get Book ${this._bookId} (${timeLeft.toFixed(2)}s left)`,
        completion: i / CHUNKS,
      });
    }

    this.updateStatus({
      status: Status.SUCCESSFUL,
      message: `Get Book ${this._bookId}`,
      completion: 1,
    });
  }

  private _bookId: number;
}
