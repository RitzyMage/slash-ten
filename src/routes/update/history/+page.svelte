<script lang="ts">
  import { toHumanReadable } from "$lib/util/dates";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<h1>Update History</h1>
<ul class="updateHistory">
  {#each data.history as updateHistory}
    <li>
      <a href="/update/history/{updateHistory.id}">
        Update on {toHumanReadable(updateHistory.ran, { includeTime: true })}
      </a>
    </li>
  {/each}
</ul>

<style>
  .updateHistory {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: var(--1);
    padding: 0;
  }

  .updateHistory li {
    border: 1px solid var(--theme-2);
    border-radius: var(--rounded);
    transition: border 200ms ease-out;
    transition: background-color 200ms ease-out;
    cursor: pointer;
  }

  .updateHistory li:hover {
    border: 1px solid var(--theme-1);
  }

  .updateHistory a {
    padding: var(--1);
    display: block;
  }
</style>
