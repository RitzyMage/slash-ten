<script lang="ts">
  import { Status, type TaskDetails } from "$lib/data-types/task-info";
  import UpdateDetails from "./update-details.svelte";

  export let details: TaskDetails;
</script>

<div class="updateDetails">
  <div class="header">
    <div class="message">
      {details.message}
    </div>
    <progress
      max="1"
      value={details.completion}
      class={{
        progress: true,
        progress_error: details.status === Status.FAILED,
        progress_done: details.status === Status.SUCCESSFUL,
      }}
    >
      {details.completion}
    </progress>
  </div>

  {#if "details" in details}
    <ol
      class={[
        "subdetails",
        details.parallel ? "subdetails_parallel" : "subdetails_sequence",
      ]}
    >
      {#each details.details as subtask}
        <li class="detailsItem"><UpdateDetails details={subtask} /></li>
      {/each}
    </ol>
  {/if}
</div>

<style>
  .updateDetails {
    font-size: var(--font-small);
  }

  .header {
    position: relative;
  }

  .subdetails {
    margin: var(--1) 0 0 var(--2);
    display: flex;
    flex-direction: column;
    gap: var(--1);
    border-left: 1px solid var(--text);
  }

  .subdetails_parallel {
    list-style-type: none;
  }

  .message {
    padding: 0 var(--1);
  }

  .progress {
    width: 100%;
    top: 0;
    bottom: 0;
    border: none;
    background-color: var(--bg);
    border-radius: var(--rounded);
    position: absolute;
    z-index: -1;
  }

  .progress::-webkit-progress-bar {
    background-color: var(--bg);
    border-radius: var(--rounded);
  }

  .progress::-webkit-progress-value {
    background-color: var(--theme-3);
    border-radius: var(--rounded);
  }

  .progress::-moz-progress-bar {
    background-color: var(--theme-3);
    border-radius: var(--rounded);
  }

  .progress_done::-webkit-progress-value {
    background-color: var(--success-dark);
  }

  .progress_done::-moz-progress-bar {
    background-color: var(--success-dark);
  }

  .progress_error::-webkit-progress-value {
    background-color: var(--error-dark);
  }

  .progress_error::-moz-progress-bar {
    background-color: var(--error-dark);
  }
</style>
