<script lang="ts">
  import { Status, type TaskDetails } from "$lib/task-info";
  import ChevronUp from "./icons/chevronUp.svelte";
  import ChevronDown from "./icons/chevronDown.svelte";
  import UpdateDetails from "./update-details.svelte";

  export let details: TaskDetails;
  export let index: number | undefined = undefined;

  let collapsed = true;

  let toggleCollapsed = () => {
    collapsed = !collapsed;
  };

  let shownSubtasks:
    | ((TaskDetails & { index: number }) | { countSkipped: number })[]
    | undefined =
    "details" in details
      ? details.details.slice(0, 10).map((_, i) => ({ ..._, index: i }))
      : undefined;
</script>

<div class="updateDetails">
  <div class="header">
    <div class="message">
      {index ? `${index}: ` : ""}
      {details.message}
      {#if "details" in details}
        <button onclick={toggleCollapsed} class="toggleButton">
          {#if collapsed}
            <ChevronDown size={20} />
          {:else}
            <ChevronUp size={20} />
          {/if}
        </button>
      {/if}
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

  {#if shownSubtasks && !collapsed}
    <ol class={["subdetails"]}>
      {#each shownSubtasks as subtask}
        {#if "countSkipped" in subtask}
          ...
        {:else}
          <li class="detailsItem">
            <UpdateDetails
              details={subtask}
              index={"parallel" in details && !details.parallel
                ? subtask.index + 1
                : undefined}
            />
          </li>
        {/if}
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
    list-style-type: none;
  }

  .message {
    padding: 0 var(--1);
    width: calc(100% - var(--2));
    display: flex;
    justify-content: space-between;
  }

  .toggleButton {
    background-color: transparent;
    border: none;
    color: var(--text);
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
