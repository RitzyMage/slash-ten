<script lang="ts">
  import client from "./client-state.svelte";
</script>

<h1>Client</h1>

<div>
  {#if client.id}
    Client {client.id} selected
  {:else}
    Select a client to see data
  {/if}
</div>
