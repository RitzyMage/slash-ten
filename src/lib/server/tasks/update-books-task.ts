import { Status } from "$lib/data-types/task-info";
import GetBookReviewersTask from "./get-book-reviewers-task";
import Task from "./task";
import TaskSequenceWithInitialize from "./task-sequence-with-initialize";

const CHUNKS = 10;
const TIME = 200;

export default class UpdateBooksTask extends TaskSequenceWithInitialize {
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
    return books.map((bookId) => new GetBookReviewersTask({ bookId }));
  }

  protected get prefix(): string {
    return "getting all books";
  }
}
