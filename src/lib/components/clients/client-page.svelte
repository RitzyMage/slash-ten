<script lang="ts">
  import type { Media } from "$lib/server/db/types";
  import Backlog from "./client-page-tabs/backlog.svelte";
  import Favorite from "./client-page-tabs/favorite.svelte";
  import Ignored from "./client-page-tabs/ignored.svelte";
  import Recommendations from "./client-page-tabs/recommendations.svelte";
  import client from "./client-state.svelte";

  type ClientTabs = "Recommendations" | "Favorite" | "Ignored" | "Backlog";

  let tab = $state<ClientTabs>("Recommendations");

  let recommendations: Media[] = $state([]);

  $effect(() => {
    let getInfo = async () => {
      let data = await fetch(`/recommendations/${client.id}`);
      let newRecs = await data.json();
      recommendations = newRecs;
    };
    getInfo();
    console.log("CLIENT", client.id);
    // TODO call api for recommendations
  });
</script>

<h1>Client</h1>

<div>
  {#if client.id}
    <div class="tabs">
      <button
        onclick={() => (tab = "Recommendations")}
        class="tab {tab === 'Recommendations' ? 'selected' : ''}"
        >Recommendations</button
      >
      <button
        onclick={() => (tab = "Favorite")}
        class="tab {tab === 'Favorite' ? 'selected' : ''}">Favorite</button
      >
      <button
        onclick={() => (tab = "Ignored")}
        class="tab {tab === 'Ignored' ? 'selected' : ''}">Ignored</button
      >
      <button
        onclick={() => (tab = "Backlog")}
        class="tab {tab === 'Backlog' ? 'selected' : ''}">Backlog</button
      >
    </div>
    {#if tab === "Recommendations"}
      <Recommendations {recommendations} />
    {:else if tab === "Favorite"}
      <Favorite />
    {:else if tab === "Backlog"}
      <Backlog />
    {:else if tab === "Ignored"}
      <Ignored />
    {/if}
  {:else}
    <span class="noClientPlaceholder">Select a client to see data</span>
  {/if}
</div>

<style>
  .tabs {
    display: flex;
    gap: var(--2);
    margin-bottom: var(--2);
  }

  .tab {
    font-size: var(--3);
    font-family: var(--header-font);
    border-radius: var(--rounded) var(--rounded) 0 0;
    padding: var(--1) var(--2);
    border: none;
    background-color: transparent;
    color: var(--text);

    transition: all 300ms;
  }

  .tab.selected {
    background-color: var(--bg);
    color: var(--theme-2);
  }

  .tab:not(.tab.selected):hover {
    cursor: pointer;
    background-color: var(--theme-3);
  }

  .noClientPlaceholder {
    color: var(--text-muted);
  }
</style>
