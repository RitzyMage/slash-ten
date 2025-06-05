import { Status } from "$lib/server/tasks/task-info";
import type ReviewFetcher from "../review-fetchers/review-fetcher";
import GetUserReviewsTask from "./get-user-reviews-task";
import Task from "./task";
import TaskSequenceWithInitialize from "./task-sequence-with-initialize";

const CHUNKS = 10;
const TIME = 200;

export default class UpdateClientsTask extends TaskSequenceWithInitialize {
  constructor({ reviewFetcher }: { reviewFetcher: ReviewFetcher }) {
    super();
    this._reviewFetcher = reviewFetcher;
  }

  protected async GetSequence(): Promise<Task[]> {
    // IMPLEMENT I: get clients that need updated, update them
    for (let i = 0; i < CHUNKS; ++i) {
      await new Promise((res) => setTimeout(res, TIME / CHUNKS));
      let timeLeft = ((1 - i / CHUNKS) * TIME) / 1000;
      this.updateStatus({
        status: Status.IN_PROGRESS,
        message: `Fetching clients (${timeLeft.toFixed(2)}s left)`,
        completion: i / CHUNKS,
      });
    }

    let clients = [1, 20, 300];
    return clients.map(
      (client) =>
        new GetUserReviewsTask({
          userId: client,
          reviewFetcher: this._reviewFetcher,
        })
    );
  }

  protected get prefix(): string {
    return "getting all users";
  }

  private _reviewFetcher: ReviewFetcher;
}
