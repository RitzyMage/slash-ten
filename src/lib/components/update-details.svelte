<script lang="ts">
  import { Status, type TaskDetails } from "$lib/task-info";
  import IndentedString from "./indented-string.svelte";

  export let details: TaskDetails;
</script>

<div class="updateDetails">
  <div class="header">
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
    <div class="message">
      <IndentedString contents={details.message} />
    </div>
  </div>
</div>

<style>
  .updateDetails {
    font-size: var(--font-small);
  }

  .header {
    position: relative;
  }

  .message {
    padding: 0 var(--1);
  }

  .progress {
    border: none;
    background-color: var(--bg);
    border-radius: var(--rounded);
    z-index: -1;
    width: 100%;
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
