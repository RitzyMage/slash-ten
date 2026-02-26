<script lang="ts">
  import type { Client } from "$lib/server/db/types";
  import ClientCard from "./client-card.svelte";

  export let clients: Client[];
</script>

<h1>Clients</h1>
{#each clients as client}
  <ClientCard {client} />
{/each}
