import { db } from "$lib/server/db";
import { media, userPredictedScores } from "$lib/server/db/schema";
import { desc, eq } from "drizzle-orm";
import DEFAULT_CLIENT from "$lib/tmp/default-client";

export async function GET() {
return Response.json( await db
      .select()
      .from(userPredictedScores)
      .where(eq(userPredictedScores.clientId, DEFAULT_CLIENT))
      .innerJoin(media, eq(media.id, userPredictedScores.mediaId))
      .orderBy(desc(userPredictedScores.score))
      .limit(50),
  );
}