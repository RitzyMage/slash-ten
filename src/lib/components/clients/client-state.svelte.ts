import type { MediaType } from "$lib/server/db/types";

let client = $state<{id: number | null, mediaType: MediaType}>({id: null, mediaType: 'BOOK'});

export default client;