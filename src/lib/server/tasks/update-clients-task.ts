import { Status } from "$lib/task-info";
import { db } from "../db";
import type ReviewFetcher from "../review-fetchers/review-fetcher";
import GetUserReviewsTask from "./get-user-reviews-task";
import Task from "./task";
import { clients, users } from "../db/schema";

import TaskSequenceWithInitialize from "./task-sequence-with-initialize";
import { eq } from "drizzle-orm";

const CHUNKS = 10;
const TIME = 200;

export default class UpdateClientsTask extends TaskSequenceWithInitialize {
  constructor({ reviewFetcher }: { reviewFetcher: ReviewFetcher }) {
    super();
    this._reviewFetcher = reviewFetcher;
  }

  protected async GetSequence(): Promise<Task[]> {
    let clientList = await db
      .select()
      .from(clients)
      .innerJoin(users, eq(clients.userId, users.id));

    return clientList.map(
      (client) =>
        new GetUserReviewsTask({
          username: client.Client.name,
          externalUserId: client.User.externalId,
          userId: client.User.id,
          reviewFetcher: this._reviewFetcher,
        })
    );
  }

  protected get prefix(): string {
    return "getting clients";
  }

  private _reviewFetcher: ReviewFetcher;
}
