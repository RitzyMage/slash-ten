<script lang="ts">
  import { Status, type TaskDetails } from "$lib/task-info";

  export let details: TaskDetails;
  export let index: number | undefined = undefined;
</script>

<div class="updateDetails">
  <div class="header">
    <div class="message">
      {index ? `${index}: ` : ""}
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
    width: calc(100% - var(--2));
    display: flex;
    justify-content: space-between;
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
