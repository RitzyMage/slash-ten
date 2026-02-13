import { Status } from '$lib/task-info';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { clients, userClientSimilarity, users } from '../db/schema';
import Task from './task';
import type { Review } from '../db/types';

const MIN_COMMON_REVIEWS = 20;

async function getValidMedia(clientId: number, minCommonReviews: number): Promise<Review[]> {
	// let similarUsers = await db
	// 	.select()
	// 	.from(userClientSimilarity)
	// 	.where(eq(userClientSimilarity.clientId, clientId));
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
      JOIN ValidMedia ON r."mediaId" = ValidMedia."mediaId";
    `);
}

export default class UpdateUserBookSimilarityTask extends Task {
	protected async _Run(): Promise<void> {
		let allClientsWithUsers = await db
			.select()
			.from(clients)
			.innerJoin(users, eq(users.id, clients.userId));

		this.updateStatus({
			status: Status.IN_PROGRESS,
			message: `finished getting reviews`,
			completion: 0.1,
		});
		await new Promise((res) => setTimeout(res, 2000));

		for (let _i in allClientsWithUsers) {
			let i = parseInt(_i);
			let { Client, User } = allClientsWithUsers[i];
			let validMedia = await getValidMedia(Client.id, MIN_COMMON_REVIEWS);
			console.log('for client', Client.name, 'valid media is', validMedia.length);

			this.updateStatus({
				status: Status.IN_PROGRESS,
				message: `finished client ${Client.name} (${i + 1} /${allClientsWithUsers.length})`,
				completion: 0.1 + i / allClientsWithUsers.length / 0.9,
			});
		}

		this.updateStatus({
			status: Status.SUCCESSFUL,
			message: `Finished updating book-user similarity`,
			completion: 1,
		});
	}
}
