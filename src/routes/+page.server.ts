import { db } from "$lib/server/db";
import { clients} from "$lib/server/db/schema";
import { asc } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import type { Client } from "$lib/server/db/types";

export const load: PageServerLoad = async (): Promise<{
  clients: Client[];
}> => {
  return {
    clients: await db
      .select()
      .from(clients)
      .orderBy(asc(clients.id)),
  };
};
