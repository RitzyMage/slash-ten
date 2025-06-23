import { db } from "$lib/server/db";
import { clients, users } from "$lib/server/db/schema";

const seed = async () => {
  let createdUsers = await db
    .insert(users)
    .values([{ mediaType: "BOOK", name: "RitzyMage", externalId: "174808573" }])
    .onConflictDoUpdate({
      target: users.name,
      set: { externalId: "17488573", mediaType: "BOOK" },
    })
    .returning({ id: users.id });
  await db
    .insert(clients)
    .values([{ name: "Avery Green", userId: createdUsers[0].id }])
    .onConflictDoUpdate({
      target: clients.name,
      set: { userId: createdUsers[0].id },
    });
};

export function POST() {
  seed();
  return Response.json({ seeded: true });
}
