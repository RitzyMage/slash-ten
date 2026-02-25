import { and, asc, eq, isNull, min } from "drizzle-orm";
import { db } from "..";
import { externalLinks, media } from "../schema";
import type { MediaType } from "../types";

  export default async function GetStaleMedia(type: MediaType, limit: number) {
    const stale = (await db
      .select({
        id: media.id,
        link: min(externalLinks.link),
        next: media.nextUpdateOn,
      })
      .from(media)
      .where(and(eq(media.mediaType, type), isNull(media.nextUpdateOn)))
      .innerJoin(externalLinks, eq(media.id, externalLinks.mediaId))
      .limit(limit)
      .orderBy(asc(media.nextUpdateOn))
      .groupBy(media.id)) as { id: number; link: string; next: unknown }[];

    return stale;
  }