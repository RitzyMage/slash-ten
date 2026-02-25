import { asc, isNull, lt, or } from "drizzle-orm";
import { db } from "..";
import { users } from "../schema";

 export default async function GetStaleUsers(limit: number) {
    return await db
      .select()
      .from(users)
      .limit(limit)
      .orderBy(asc(users.nextUpdateOn))
      .where(
        or(isNull(users.nextUpdateOn), lt(users.nextUpdateOn, new Date()))
      );
  }