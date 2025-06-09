import { Status } from "$lib/task-info";
import Task from "./task";

const CHUNKS = 20;
const TIME = 2000;

export default class UpdateUsersSimilarityTask extends Task {
  protected async _Run(): Promise<void> {
    // IMPLEMENT IV: fetch users that need similarity updated, update similarity
    for (let i = 0; i < CHUNKS; ++i) {
      await new Promise((res) => setTimeout(res, TIME / CHUNKS));
      let timeLeft = ((1 - i / CHUNKS) * TIME) / 1000;
      this.updateStatus({
        status: Status.IN_PROGRESS,
        message: `Updating user similarity (${timeLeft.toFixed(2)}s left)`,
        completion: i / CHUNKS,
      });
    }

    this.updateStatus({
      status: Status.SUCCESSFUL,
      message: `finished updating user similarity`,
      completion: 1,
    });
  }
}
