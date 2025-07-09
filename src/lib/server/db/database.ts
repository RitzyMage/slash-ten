import { keyBy } from "$lib/util";
import { eq, inArray, and, sql, or, isNull, lt, min } from "drizzle-orm";
import { bookMetadata, externalLinks, media, reviews, users } from "./schema";
import { db } from "./index";
import type {
  BookMetadata,
  CreateUser,
  Media,
  MediaType,
  Review,
  User,
} from "./types";

export type CreateMedia = Pick<Media, "externalId" | "name" | "mediaType"> & {
  metadata: Pick<BookMetadata, "author" | "series" | "seriesOrder">;
  externalLinks: string[];
};

export type CreateReview = Pick<Review, "score"> & {
  mediaExternalId: string;
};

class Database {
  // async getReviews(users: number[], media: number[]) {
  //   return await db
  //     .select()
  //     .from(reviews)
  //     .where(
  //       and(inArray(reviews.userId, users), inArray(reviews.mediaId, media))
  //     );
  // }

  async getExternalLinks() {
    return await db
      .select({
        id: externalLinks.id,
        mediaId: externalLinks.mediaId,
        link: externalLinks.link,
        mediaName: media.name,
      })
      .from(externalLinks)
      .innerJoin(media, eq(externalLinks.mediaId, media.id));
  }

  async getUsersWithNoReviews(): Promise<User[]> {
    return await db.execute(sql`
      SELECT *
      FROM "User" u
      WHERE NOT EXISTS (
        SELECT 1
        FROM "Review" r
        WHERE r."userId" = u."id"
      );
    `);
  }

  async getMediaInfo(ids: number[]) {
    return await db.select().from(media).where(inArray(media.id, ids));
  }

  async addUserIfNotExists(user: CreateUser) {
    const existing = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.externalId, user.externalId),
          eq(users.mediaType, user.mediaType)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const inserted = await db.insert(users).values(user).returning();

    return inserted[0];
  }

  private async getExistingMedia(
    input: Pick<Media, "externalId" | "mediaType">
  ) {
    const result = await db
      .select()
      .from(media)
      .where(
        and(
          eq(media.externalId, input.externalId),
          eq(media.mediaType, input.mediaType)
        )
      )
      .limit(1);

    return result[0] ?? null;
  }

  private async UpsertMedia(
    data: Pick<Media, "externalId" | "name" | "mediaType">
  ) {
    let existing = await this.getExistingMedia({
      externalId: data.externalId,
      mediaType: data.mediaType,
    });

    if (existing) {
      return existing;
    }

    const inserted = await db.insert(media).values(data).returning();

    return inserted[0];
  }

  private async UpsertUser(data: CreateUser) {
    const inserted = await db
      .insert(users)
      .values(data)
      .onConflictDoUpdate({
        target: [users.externalId, users.mediaType],
        set: { name: data.name },
      })
      .returning();

    return inserted[0];
  }

  private async UpsertBookMetadata(
    mediaId: number,
    data: Omit<BookMetadata, "mediaId">
  ): Promise<BookMetadata> {
    const existing = await db
      .select()
      .from(bookMetadata)
      .where(eq(bookMetadata.mediaId, mediaId))
      .limit(1);

    if (existing.length) {
      return existing[0];
    }

    const inserted = await db
      .insert(bookMetadata)
      .values({ ...data, mediaId })
      .returning();

    return inserted[0];
  }

  private async UpsertExternalLinks(mediaId: number, links: string[]) {
    const existingEntries = await db
      .select()
      .from(externalLinks)
      .where(
        and(
          eq(externalLinks.mediaId, mediaId),
          inArray(externalLinks.link, links)
        )
      );

    const existingMap = keyBy(existingEntries, "link");
    const toCreate = links.filter((link) => !existingMap[link]);

    if (toCreate.length > 0) {
      await db
        .insert(externalLinks)
        .values(toCreate.map((link) => ({ link, mediaId })));
    }

    return await db
      .select()
      .from(externalLinks)
      .where(
        and(
          eq(externalLinks.mediaId, mediaId),
          inArray(externalLinks.link, links)
        )
      );
  }

  async UpsertReview(mediaId: number, userId: number, score: number) {
    await db
      .delete(reviews)
      .where(and(eq(reviews.mediaId, mediaId), eq(reviews.userId, userId)));

    await db.insert(reviews).values({ mediaId, userId, score });
  }

  async addMedia(media: CreateMedia[]) {
    let addedMedia: Media[] = [];
    for (let data of media) {
      let item = await this.UpsertMedia(data);
      addedMedia.push(item);
      await this.UpsertBookMetadata(item.id, data.metadata);
      await this.UpsertExternalLinks(item.id, data.externalLinks);
    }
    return addedMedia;
  }

  async addUsers(media: CreateUser[]) {
    let addedUsers: User[] = [];
    for (let data of media) {
      let item = await this.UpsertUser(data);
      addedUsers.push(item);
    }
    return addedUsers;
  }

  async addReviews(userId: number, toCreate: CreateReview[], media: Media[]) {
    let mediaByExternalId = keyBy(media, "externalId");
    for (let review of toCreate) {
      let mediaId = mediaByExternalId[review.mediaExternalId].id;
      await db
        .insert(reviews)
        .values({
          mediaId,
          score: review.score,
          userId,
        })
        .onConflictDoUpdate({
          target: [reviews.mediaId, reviews.userId],
          set: { score: review.score },
        });
    }
  }

  async getStaleMedia(type: MediaType) {
    return (await db
      .select({ id: media.id, link: min(externalLinks.link) })
      .from(media)
      .where(
        and(
          eq(media.mediaType, type),
          or(isNull(media.nextUpdateOn), lt(media.nextUpdateOn, new Date()))
        )
      )
      .innerJoin(externalLinks, eq(media.id, externalLinks.mediaId))
      .groupBy(media.id)) as { id: number; link: string }[];
  }

  async getStaleUsers() {
    return await db
      .select()
      .from(users)
      .where(
        or(isNull(users.nextUpdateOn), lt(users.nextUpdateOn, new Date()))
      );
  }

  async updateMediaNextUpdate(id: number, date: Date) {
    await db.update(media).set({ nextUpdateOn: date }).where(eq(media.id, id));
  }

  async getValidReviews(
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
}

export default Database;
