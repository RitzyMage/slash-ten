import { db } from "$lib/server/db";
import { bookMetadata, media, userPredictedScores } from "$lib/server/db/schema";
import type {  MediaType } from "$lib/server/db/types.js";
import type Recommendation from "$lib/types/recommendation";
import { and, desc, eq } from "drizzle-orm";



export async function GET({ params, url }) {
  let type = url.searchParams.get("type") as MediaType | undefined;
  if (!type) {
    return Response.json(
      { message: `${type} is not a valid media type` },
      { status: 400 },
    );
  }

  let recommendations: Recommendation[] =  await db
      .select()
      .from(userPredictedScores)
      .where(and(eq(userPredictedScores.clientId, parseInt(params.id)), eq(media.mediaType, type)))
      .innerJoin(media, eq(media.id, userPredictedScores.mediaId))
      .leftJoin(bookMetadata, eq(media.id, bookMetadata.mediaId))
      .orderBy(desc(userPredictedScores.score))
      .limit(50)

  return Response.json(
   recommendations
  );
}
