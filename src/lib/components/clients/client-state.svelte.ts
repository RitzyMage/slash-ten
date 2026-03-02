import type { MediaType } from "$lib/server/db/types";
import { browser } from '$app/environment';

type ClientInfo = {id: number | null, mediaType: MediaType}

const DEFAULT_CLIENT = {id: null, mediaType: 'BOOK'};

const key = 'CLIENT';
let client = $state<ClientInfo>(browser ? JSON.parse(localStorage.getItem(key) || 'null') || DEFAULT_CLIENT: DEFAULT_CLIENT);

$effect.root(() => {
$effect(() => {
  localStorage.setItem(key, JSON.stringify(client));
})});


export default client;