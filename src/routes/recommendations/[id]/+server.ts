import { db } from "$lib/server/db";
import { media, userPredictedScores } from "$lib/server/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET({params}) {
return Response.json( await db
      .select()
      .from(userPredictedScores)
      .where(eq(userPredictedScores.clientId, parseInt(params.id)))
      .innerJoin(media, eq(media.id, userPredictedScores.mediaId))
      .orderBy(desc(userPredictedScores.score))
      .limit(50),
  );
}