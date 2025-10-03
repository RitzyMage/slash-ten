import { Status } from "$lib/task-info";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { clients, userClientSimilarity, users } from "../db/schema";
import Task from "./task";
import type { Review } from "../db/types";
import { groupBy, keyBy } from "$lib/util";

const MIN_COMMON_REVIEWS = 10;
const MIN_REVIEW_COUNT = 10;

const USER_MEDIA_EXPONENT = 0.02;
const USER_REVIEW_EXPONENT = 3.5;

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

function getUserDistance(
  user1Reviews: Review[],
  user2Reviews: Review[]
): { distance: number; count: number } {
  let user2ReviewsById = user2Reviews.reduce((obj, review) => {
    obj[String(review.mediaId)] = review;
    return obj;
  }, {} as Record<string, Review>);

  let result = user1Reviews.reduce(
    (stats, review) => {
      let user1Score = review.score;
      let user2Score = user2ReviewsById[String(review.mediaId)]?.score;
      if (!user2Score) {
        return stats;
      }
      let difference = Math.abs(user1Score - user2Score);
      let differenceSquared = difference * difference;
      return {
        distance: stats.distance + differenceSquared,
        count: stats.count + 1,
      };
    },
    { distance: 0, count: 0 }
  );

  return result;
}

function getMediaSimilarity(
  user1Reviews: Review[],
  user2Reviews: Review[]
): number {
  let user1TotalReviewScore = user1Reviews.reduce((total, review) => {
    return total + review.score;
  }, 0);

  let user2ReviewsById = keyBy(user2Reviews, "mediaId");

  let totalReviewPointsInCommon = user1Reviews.reduce((total, review) => {
    if (user2ReviewsById[review.mediaId]) {
      return total + review.score;
    }
    return total;
  }, 0); // basically, which media user 2 has consumed that user 1 consumed weighted by user 1's scores

  let mediaSimilarity = Math.pow(
    totalReviewPointsInCommon / user1TotalReviewScore,
    USER_MEDIA_EXPONENT
  );

  return mediaSimilarity;
}

function getReviewSimilarity(difference: number, count: number) {
  const maxDistancePerEntry = 81; // (10  - 1) ^ 2
  const averageDistancePerEntry = difference / count;
  let percentageOfMaxDifference = averageDistancePerEntry / maxDistancePerEntry; // should be between 0 1nd 1, with 0 indicating similarity
  let similarity = 1 - percentageOfMaxDifference; // make higher more similar
  return Math.pow(similarity, USER_REVIEW_EXPONENT);
}

function getUserSimilarity(clientUser: Review[], otherUser: Review[]) {
  let { count, distance } = getUserDistance(clientUser, otherUser);
  let reviewSimilarity = getReviewSimilarity(distance, count);
  let mediaSimilarity = getMediaSimilarity(clientUser, otherUser);
  let similarity = reviewSimilarity * mediaSimilarity;
  return similarity;
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
      let reviewsByUser = groupBy(validReviews, "userId");
      let clientsReviews = reviewsByUser[User.id];
      let similarities = Object.values(reviewsByUser).map((reviews) => ({
        userId: reviews[0].userId,
        similarity: getUserSimilarity(clientsReviews, reviews),
        clientId: Client.id,
      }));

      for (let similarityEntry of similarities) {
        let inDb = await db
          .select()
          .from(userClientSimilarity)
          .where(
            and(
              eq(userClientSimilarity.clientId, similarityEntry.clientId),
              eq(userClientSimilarity.userId, similarityEntry.userId)
            )
          );
        if (inDb.length) {
          await db
            .update(userClientSimilarity)
            .set({ similarity: similarityEntry.similarity })
            .where(
              and(
                eq(userClientSimilarity.clientId, similarityEntry.clientId),
                eq(userClientSimilarity.userId, similarityEntry.userId)
              )
            );
        } else {
          await db.insert(userClientSimilarity).values(similarityEntry);
        }
      }
    }

    this.updateStatus({
      status: Status.SUCCESSFUL,
      message: `finished updating user similarity`,
      completion: 1,
    });
  }
}
