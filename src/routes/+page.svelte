<script lang="ts">
  import MediaCard from "$lib/components/media-card.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  let { clients } = data;
</script>

<h1>Clients</h1>
{#each clients as client}
  <div>{JSON.stringify(client)}</div>
{/each}
