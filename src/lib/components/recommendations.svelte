<script lang="ts">
  import { onMount } from "svelte";
  import type { Recommendation } from "$lib/data-types/recommendation";
  import RecommendationDisplay from "./recommendation-display.svelte";

  const NUM_BOOKS = 40;

  let recommendations: Recommendation[] = [];
  let loading = true;

  onMount(async () => {
    const res = await fetch(`/recommendations/api?limit=${NUM_BOOKS}`);
    recommendations = await res.json();
    loading = false;
  });
</script>

<div class="recommendations">
  {#if loading}
    <div>Loading</div>
  {:else if recommendations.length}
    {#each recommendations as recommendation (recommendation.id)}
      <RecommendationDisplay {recommendation} />
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
