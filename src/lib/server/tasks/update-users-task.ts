import { Status } from "$lib/task-info";
import Database from "../db/database";
import type ReviewFetcher from "../review-fetchers/review-fetcher";
import GetUserReviewsTask from "./get-user-reviews-task";
import Task from "./task";
import TaskSequenceWithInitialize from "./task-sequence-with-initialize";

const CHUNKS = 10;
const TIME = 200;

export default class UpdateUsersTask extends TaskSequenceWithInitialize {
  constructor({ reviewFetcher }: { reviewFetcher: ReviewFetcher }) {
    super();
    this._reviewFetcher = reviewFetcher;
  }

  protected async GetSequence(): Promise<Task[]> {
    this.updateStatus({
      status: Status.IN_PROGRESS,
      message: `${this.prefix}: Fetching stale users`,
      completion: 0,
    });

    let staleUsers = await this._database.getStaleUsers();

    this.updateStatus({
      status: Status.IN_PROGRESS,
      message: `${this.prefix}: Fetched ${staleUsers.length} stale users`,
      completion: 1 / (staleUsers.length + 1),
    });

    return staleUsers.map(
      (user) =>
        new GetUserReviewsTask({
          userId: user.id,
          externalUserId: user.externalId,
          reviewFetcher: this._reviewFetcher,
          username: user.name,
        })
    );
  }

  protected get prefix(): string {
    return "getting all users";
  }

  private _database = new Database();
  private _reviewFetcher: ReviewFetcher;
}
