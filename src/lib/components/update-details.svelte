<script lang="ts">
  import type { TaskDetails } from "$lib/data-types/task-info";
  import UpdateDetails from "./update-details.svelte";

  export let details: TaskDetails;
</script>

<div class="updateDetails">
  <div class="updateDetails-message">
    {details.message}
  </div>
  <progress max="1" value={details.completion}>
    {details.completion}
  </progress>
  {#if "details" in details}
    <ol class="updateDetails-subdetails">
      {#each details.details as subtask}
        <li><UpdateDetails details={subtask} /></li>
      {/each}
    </ol>
  {/if}
</div>
