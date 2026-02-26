import type { PageServerLoad } from "./$types";
import GetAllClients from "$lib/server/db/clients/get-all-clients";

export const load: PageServerLoad = async () => {
  return {
    clients: await GetAllClients(),
  };
};
