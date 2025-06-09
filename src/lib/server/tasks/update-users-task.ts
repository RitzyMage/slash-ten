import { Status } from "$lib/task-info";
import GetBookReviewersTask from "./get-book-reviewers-task";
import GetUserReviewsTask from "./get-user-reviews-task";
import Task from "./task";
import TaskSequenceWithInitialize from "./task-sequence-with-initialize";

const CHUNKS = 10;
const TIME = 200;

export default class UpdateUsersTask extends TaskSequenceWithInitialize {
  protected async GetSequence(): Promise<Task[]> {
    // IMPLEMENT III: get users with a stale cache
    for (let i = 0; i < CHUNKS; ++i) {
      await new Promise((res) => setTimeout(res, TIME / CHUNKS));
      let timeLeft = ((1 - i / CHUNKS) * TIME) / 1000;
      this.updateStatus({
        status: Status.IN_PROGRESS,
        message: `Fetching book list (${timeLeft.toFixed(2)}s left)`,
        completion: i / CHUNKS,
      });
    }

    let users = [30, 100, 2000];
    return users.map((userId) => new GetUserReviewsTask(userId));
  }

  protected get prefix(): string {
    return "getting all users";
  }
}
