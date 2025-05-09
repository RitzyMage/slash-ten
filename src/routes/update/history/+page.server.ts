import { db } from "$lib/server/db";
import { updateHistory } from "$lib/server/db/schema";
import { desc } from "drizzle-orm";

export const load = async () => {
  return {
    history: await db
      .select({ id: updateHistory.id, ran: updateHistory.ran })
      .from(updateHistory)
      .orderBy(desc(updateHistory.ran)),
  };
};
