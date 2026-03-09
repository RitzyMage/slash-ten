<script lang="ts">
  import type { Media } from "$lib/server/db/types";

  export let recommendations: Media[];

  import MediaCard from "$lib/components/media-card.svelte";
</script>

<div class="recommendations">
  {#each recommendations as recommendation}
    <MediaCard {recommendation} />
  {/each}
  {#if recommendations.length < 1}
    <span class="placeholder">No Recommendations Found</span>
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

  .placeholder {
    color: var(--text-muted);
  }
</style>
