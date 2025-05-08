import { db } from "$lib/server/db";
import { updateHistory } from "$lib/server/db/schema";

export async function GET() {
  let tasks = await db.select().from(updateHistory);
  return Response.json(tasks);
}
