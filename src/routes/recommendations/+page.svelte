<script lang="ts">
  import MediaCard from "$lib/components/media-card.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  let { recommendations } = data;
</script>

<h1>Recommendations</h1>
<div class="recommendations">
  {#if recommendations.length}
    {#each recommendations as recommendation (recommendation.Media.id)}
      <MediaCard {recommendation} />
    {/each}
  {:else}
    <div>No books found</div>
  {/if}
</div>

<style>
  .recommendations {
    display: flex;
    flex-wrap: wrap;
    padding: 16px;
    gap: 16px;
    max-width: 1200px;
    margin: 0 auto;
  }
</style>
