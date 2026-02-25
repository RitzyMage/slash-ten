import { db } from "..";
import { users } from "../schema";
import type { CreateUser, User } from "../types";

async function UpsertUser(data: CreateUser) {
  const inserted = await db
    .insert(users)
    .values(data)
    .onConflictDoUpdate({
      target: [users.externalId, users.mediaType],
      set: { name: data.name },
    })
    .returning();

  return inserted[0];
}

export default async function addUsers(media: CreateUser[]) {
  let addedUsers: User[] = [];
  for (let data of media) {
    let item = await UpsertUser(data);
    addedUsers.push(item);
  }
  return addedUsers;
}
