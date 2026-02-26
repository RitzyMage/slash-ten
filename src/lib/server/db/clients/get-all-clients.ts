import { asc } from "drizzle-orm";
import { db } from "..";
import { clients } from "../schema";

export default function GetAllClients() {
    return db
          .select()
          .from(clients)
          .orderBy(asc(clients.id))
}