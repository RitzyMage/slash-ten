import type { TaskDetails } from "$lib/task-info.js";
import { db } from "$lib/server/db";
import { updateHistory } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load = async ({ params }) => {
  let items = await db
    .select({ details: updateHistory.updateData, ran: updateHistory.ran })
    .from(updateHistory)
    .where(eq(updateHistory.id, parseInt(params.id)))
    .limit(1);
  return {
    details: items[0].details as TaskDetails,
    ran: items[0].ran,
  };
};
