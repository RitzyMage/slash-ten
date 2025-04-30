<script lang="ts">
  import { onMount } from "svelte";
  import { isComplete, type TaskInfo } from "$lib/data-types/task-info";
  import Button from "./button.svelte";

  type UpdateState = TaskInfo | null | "loading";

  let updateReviewsState: UpdateState = null;
  let updateUsersState: UpdateState = null;
  let updateOtherReviewsState: UpdateState = null;
  let initialized = false;

  function setUpSse(url: string, setState: (v: UpdateState) => void) {
    setState("loading");
    const eventSource = new EventSource(url);

    eventSource.onmessage = (e) => {
      const data: TaskInfo = JSON.parse(e.data);
      setState(data);
      if (isComplete(data)) {
        eventSource.close();
        setState(null);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close();
      setState(null);
    };
  }

  async function initializeTaskStatus(
    tag: string,
    setState: (v: UpdateState) => void
  ) {
    const res = await fetch(`/tasks/api?tag=${tag}`);
    const job = await res.json();
    if (job.taskId) {
      setUpSse(`/tasks/api/${job.taskId}`, setState);
    }
  }

  async function updateReviews() {
    setUpSse("/update/api/reviews/mine", (v) => (updateReviewsState = v));
  }

  async function updateUsers() {
    setUpSse("/update/api/users", (v) => (updateUsersState = v));
  }

  async function updateOtherReviews() {
    setUpSse("/update/api/reviews/all", (v) => (updateOtherReviewsState = v));
  }

  onMount(async () => {
    await Promise.all([
      initializeTaskStatus("update-mine", (v) => (updateReviewsState = v)),
      initializeTaskStatus("update-users", (v) => (updateUsersState = v)),
      initializeTaskStatus("update-all", (v) => (updateOtherReviewsState = v)),
    ]);
    initialized = true;
  });

  function stringWithNewLines(text: string) {
    return text.split("\n");
  }
</script>

{#if !initialized}
  loadin'
{:else}
  <div class="actions">
    <div>
      <Button on:click={updateReviews} disabled={!!updateReviewsState}>
        Update My Reviews
      </Button>
      {#if updateReviewsState}
        <div>
          {#if updateReviewsState === "loading"}
            loading
          {:else}
            {#each stringWithNewLines(updateReviewsState.info) as line}
              {line}<br />
            {/each}
          {/if}
        </div>
      {/if}
    </div>

    <div>
      <Button on:click={updateUsers} disabled={!!updateUsersState}>
        Update Users
      </Button>
      {#if updateUsersState}
        <div>
          {#if updateUsersState === "loading"}
            loading
          {:else}
            {updateUsersState.info}
          {/if}
        </div>
      {/if}
    </div>

    <div>
      <Button
        on:click={updateOtherReviews}
        disabled={!!updateOtherReviewsState}
      >
        Update Other Users' Reviews
      </Button>
      {#if updateOtherReviewsState}
        <div>
          {#if updateOtherReviewsState === "loading"}
            loading
          {:else}
            {#each stringWithNewLines(updateOtherReviewsState.info) as line}
              {line}<br />
            {/each}
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
