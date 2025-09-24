import { Status } from "$lib/task-info";
import { eq, sql } from "drizzle-orm";
import { db } from "../db";
import { clients, users } from "../db/schema";
import Task from "./task";
import type { Review } from "../db/types";

const MIN_COMMON_REVIEWS = 10;
const MIN_REVIEW_COUNT = 10;

async function getValidReviews(
  userId: number,
  minCommon: number,
  minReviews: number
): Promise<Review[]> {
  return await db.execute(sql`
      WITH ValidUsers AS (
          SELECT r1."userId"
          FROM "Review" r1
          JOIN "Review" r2 ON r1."mediaId" = r2."mediaId"
          WHERE r2."userId" = ${userId}
          GROUP BY r1."userId"
          HAVING COUNT(r1."mediaId") >= ${minCommon}
      ),
      ValidMedia AS (
          SELECT r."mediaId"
          FROM "Review" r
          JOIN ValidUsers ON r."userId" = ValidUsers."userId"
          GROUP BY "mediaId"
          HAVING COUNT(DISTINCT r."userId") >= ${minReviews}
      )
      SELECT r.*
      FROM "Review" r
      JOIN ValidUsers ON r."userId" = ValidUsers."userId"
      JOIN ValidMedia ON r."mediaId" = ValidMedia."mediaId";
    `);
}

export default class UpdateUsersSimilarityTask extends Task {
  protected async _Run(): Promise<void> {
    // IMPLEMENT IV: fetch users that need similarity updated, update similarity

    let allClientsWithUsers = await db
      .select()
      .from(clients)
      .innerJoin(users, eq(users.id, clients.userId));

    for (let { Client, User } of allClientsWithUsers) {
      let validReviews = await getValidReviews(
        User.id,
        MIN_COMMON_REVIEWS,
        MIN_REVIEW_COUNT
      );
      console.log(Client, validReviews.length);
    }

    this.updateStatus({
      status: Status.SUCCESSFUL,
      message: `finished updating user similarity`,
      completion: 1,
    });
  }
}
