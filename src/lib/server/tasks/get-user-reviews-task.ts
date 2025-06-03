import { Status } from "$lib/data-types/task-info";
import GetUserReviewPageTask from "./get-user-review-page-task";
import type Task from "./task";
import TaskSequenceWithInitialize from "./task-sequence-with-initialize";

const CHUNKS = 10;
const TIME = 2000;

export default class GetUserReviewsTask extends TaskSequenceWithInitialize {
  constructor(userId: number) {
    super();
    this._userId = userId;
  }

  protected async GetSequence(): Promise<Task[]> {
    // IMPLEMENT I: get number of pages for user
    for (let i = 0; i < CHUNKS; ++i) {
      await new Promise((res) => setTimeout(res, TIME / CHUNKS));
      let timeLeft = ((1 - i / CHUNKS) * TIME) / 1000;
      this.updateStatus({
        status: Status.IN_PROGRESS,
        message: `Fetching user ${this._userId} (${timeLeft.toFixed(2)}s left)`,
        completion: i / CHUNKS,
      });
    }

    let numPages = 10;
    let pagesToFetch = Array.from({ length: numPages }).map((_, i) => i + 1);
    return pagesToFetch.map(
      (page) => new GetUserReviewPageTask({ userId: this._userId, page })
    );
  }

  protected get prefix(): string {
    return `Getting info for user ${this._userId}`;
  }

  private _userId: number;
}
