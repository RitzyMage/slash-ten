import { eq } from "drizzle-orm";
import { db } from "..";
import { media } from "../schema";

 export default async function UpdateMediaDate(id: number, date: Date) {
    await db.update(media).set({ nextUpdateOn: date }).where(eq(media.id, id));
  }