import type { LayoutServerLoad } from "./$types";
import GetAllClients from "$lib/server/db/clients/get-all-clients";

export const load: LayoutServerLoad = async () => {
  return {
    clients: await GetAllClients(),
  };
};
