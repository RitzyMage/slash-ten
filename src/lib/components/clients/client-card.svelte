<script lang="ts">
  import type { Client } from "$lib/server/db/types";

  export let client: Client;
</script>

<div class="clientCard">{JSON.stringify(client)}</div>

<style>
  .clientCard {
    background-color: var(--bg);
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 50%);
    border-radius: var(--rounded);
    padding: var(--2);

    cursor: pointer;
  }

  .clientCard:hover {
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 80%);
    background-color: var(--bg-light);
  }
</style>
