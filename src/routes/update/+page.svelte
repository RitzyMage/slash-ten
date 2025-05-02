<script lang="ts">
  import H1 from "$lib/components/h1.svelte";

  import { onMount } from "svelte";
  import { isComplete, type TaskInfo } from "$lib/data-types/task-info";
  import Button from "$lib/components/button.svelte";
  import axios from "axios";

  type UpdateState = TaskInfo | null | "loading";

  let updateStatus: UpdateState = "loading";

  function setUpUpdateStream() {
    updateStatus = "loading";
    const eventSource = new EventSource("/update/api");

    eventSource.onmessage = (e) => {
      const data: TaskInfo = JSON.parse(e.data);
      updateStatus = data;
      if (isComplete(data)) {
        eventSource.close();
        updateStatus = null;
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close();
      updateStatus = null;
    };
  }

  async function update() {
    console.log("calling update");
    await axios.post("/update/api");
    setUpUpdateStream();
  }

  onMount(async () => {
    await setUpUpdateStream();
  });
</script>

<div class="updatePage">
  <H1>Update</H1>

  {#if updateStatus === "loading"}
    loadin'
  {:else if !updateStatus}
    no updates running right now
  {:else}
    <div>
      {#each updateStatus.info.split("\n") as line}
        {line}<br />
      {/each}
    </div>
  {/if}
  <div class="actions">
    <Button onclick={update} disabled={!!updateStatus}>Update</Button>
  </div>
</div>

<style>
  .actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
