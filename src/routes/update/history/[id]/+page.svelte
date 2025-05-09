<script lang="ts">
  import RightArrow from "$lib/components/icons/right-arrow.svelte";

  import UpdateDetails from "$lib/components/update-details.svelte";
  import { toHumanReadable } from "$lib/util/dates";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<h1>Update on {toHumanReadable(data.ran)}</h1>
<a href="/update/history" class="goBack"><RightArrow width={20} />Go Back</a>
<UpdateDetails details={data.details} />

<style>
  .goBack {
    display: flex;
    margin: var(--1) 0;
    align-items: center;
    gap: var(--1);
  }
</style>
