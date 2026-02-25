import { Status } from '$lib/task-info';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../../db';
import { clients, userClientSimilarity, userPredictedScores } from '../../db/schema';
import Task from '../task';
import type { Review } from '../../db/types';
import { groupBy, keyBy } from '$lib/util';

const MIN_COMMON_REVIEWS = 20;

async function getCommonUsers(clientId: number) {
	return db.select().from(userClientSimilarity).where(eq(userClientSimilarity.clientId, clientId));
}

async function getValidMedia(clientId: number, minCommonReviews: number): Promise<Review[]> {
	return await db.execute(sql`
      WITH ValidMedia AS (
          SELECT r."mediaId"
          FROM "Review" r
          JOIN "UserClientSimilarity" ON r."userId" = "UserClientSimilarity"."userId"
          WHERE "UserClientSimilarity"."clientId" = ${clientId}
          GROUP BY "mediaId"
          HAVING COUNT(DISTINCT r."userId") >= ${minCommonReviews}
      )
      SELECT r.*
      FROM "Review" r
      JOIN ValidMedia ON r."mediaId" = ValidMedia."mediaId"
      WHERE r."userId" in (
        select "userId" 
        from "UserClientSimilarity" 
        where "clientId" = ${clientId}
      );
    `);
}

function adjustContrast(x: number, exponent: number) {
	if (x > 0.5) {
		return 2 ** (exponent - 1) * (x - 0.5) ** exponent + 0.5;
	}
	return -(2 ** (exponent - 1)) * Math.abs(x - 0.5) ** exponent + 0.5;
}

export default class UpdateUserBookSimilarityTask extends Task {
	protected async _Run(): Promise<void> {
		let allClients = await db.select().from(clients);

		this.updateStatus({
			status: Status.IN_PROGRESS,
			message: `finished getting reviews`,
			completion: 0.1,
		});
		await new Promise((res) => setTimeout(res, 2000));

		for (let _i in allClients) {
			let i = parseInt(_i);
			let Client = allClients[i];
			let validMedia = await getValidMedia(Client.id, MIN_COMMON_REVIEWS);
			let commonUsers = await getCommonUsers(Client.id);

			let reviewsForMedia = groupBy(validMedia, 'mediaId');
			let usersById = keyBy(commonUsers, 'userId');

			let mediaSimilarities = Object.entries(reviewsForMedia).map(([mediaId, reviews]) => {
				let weightedSum = reviews.reduce((total, review) => {
					let score = review.score;
					if (!usersById[review.userId]) {
						console.log('NO SIMILARITY', review, usersById[review.userId]);
					}
					let weightedScore = usersById[review.userId].similarity * (score / 10);
					return total + weightedScore;
				}, 0);

				// was going to try userScoreWeighted * userSimilarity, but it turns out
				// userScoreWeighted = weightedSum / totalSimilarity
				// userSimilarity = totalSimilarity / reviews.length
				// so the below is the simplified version of that equation
				let baseScore = weightedSum / reviews.length;
				return {
					similarity: adjustContrast(baseScore, 0.15) ** 0.3,
					mediaId: parseInt(mediaId, 10),
				};
			});

			for (let similarityEntry of mediaSimilarities) {
				let inDb = await db
					.select()
					.from(userPredictedScores)
					.where(
						and(
							eq(userPredictedScores.clientId, Client.id),
							eq(userPredictedScores.mediaId, similarityEntry.mediaId),
						),
					);
				if (inDb.length) {
					await db
						.update(userPredictedScores)
						.set({ score: similarityEntry.similarity })
						.where(
							and(
								eq(userPredictedScores.clientId, Client.id),
								eq(userPredictedScores.mediaId, similarityEntry.mediaId),
							),
						);
				} else {
					await db.insert(userPredictedScores).values({
						clientId: Client.id,
						mediaId: similarityEntry.mediaId,
						score: similarityEntry.similarity,
					});
				}
			}

			this.updateStatus({
				status: Status.IN_PROGRESS,
				message: `finished client ${Client.name} (${i + 1} /${allClients.length})`,
				completion: 0.1 + i / allClients.length / 0.9,
			});
		}

		this.updateStatus({
			status: Status.SUCCESSFUL,
			message: `Finished updating book-user similarity`,
			completion: 1,
		});
	}
}
