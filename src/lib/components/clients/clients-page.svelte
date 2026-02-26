<script lang="ts">
  import type { Client } from "$lib/server/db/types";

  export let clients: Client[];
</script>

<h1>Clients</h1>
{#each clients as client}
  <div>{JSON.stringify(client)}</div>
{/each}
