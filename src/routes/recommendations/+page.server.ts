import { db } from "$lib/server/db";
import { media, userPredictedScores } from "$lib/server/db/schema";
import { desc, eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import DEFAULT_CLIENT from "$lib/tmp/default-client";
import type ScoreWithMedia from "$lib/types/score-with-media";

export const load: PageServerLoad = async (): Promise<{
  recommendations: ScoreWithMedia[];
}> => {
  return {
    recommendations: await db
      .select()
      .from(userPredictedScores)
      .where(eq(userPredictedScores.clientId, DEFAULT_CLIENT))
      .innerJoin(media, eq(media.id, userPredictedScores.mediaId))
      .orderBy(desc(userPredictedScores.score))
      .limit(50),
  };
};
