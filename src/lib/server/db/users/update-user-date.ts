import { eq } from "drizzle-orm";
import { db } from "..";
import { users } from "../schema";

export async function UpdateUserDate(id: number, date: Date) {
  await db.update(users).set({ nextUpdateOn: date }).where(eq(users.id, id));
}
