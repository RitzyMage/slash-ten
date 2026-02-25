import { and, eq, inArray } from "drizzle-orm";
import { db } from "..";
import { bookMetadata, externalLinks, media } from "../schema";
import type { BookMetadata, Media } from "../types";
import { keyBy } from "$lib/util";
export type CreateMedia = Pick<Media, "externalId" | "name" | "mediaType"> & {
  metadata: Pick<BookMetadata, "author" | "series" | "seriesOrder">;
  externalLinks: string[];
};

async function getExistingMedia(
  input: Pick<Media, "externalId" | "mediaType">,
) {
  const result = await db
    .select()
    .from(media)
    .where(
      and(
        eq(media.externalId, input.externalId),
        eq(media.mediaType, input.mediaType),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

async function UpsertMedia(
  data: Pick<Media, "externalId" | "name" | "mediaType">,
) {
  let existing = await getExistingMedia({
    externalId: data.externalId,
    mediaType: data.mediaType,
  });

  if (existing) {
    return existing;
  }

  const inserted = await db.insert(media).values(data).returning();

  return inserted[0];
}

async function UpsertBookMetadata(
  mediaId: number,
  data: Omit<BookMetadata, "mediaId">,
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

async function UpsertExternalLinks(mediaId: number, links: string[]) {
  const existingEntries = await db
    .select()
    .from(externalLinks)
    .where(
      and(
        eq(externalLinks.mediaId, mediaId),
        inArray(externalLinks.link, links),
      ),
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
        inArray(externalLinks.link, links),
      ),
    );
}

export default async function AddMedia(media: CreateMedia[]) {
  let addedMedia: Media[] = [];
  for (let data of media) {
    let item = await UpsertMedia(data);
    addedMedia.push(item);
    await UpsertBookMetadata(item.id, data.metadata);
    await UpsertExternalLinks(item.id, data.externalLinks);
  }
  return addedMedia;
}
