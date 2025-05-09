<script lang="ts">
  import H1 from "$lib/components/h1.svelte";

  import { onMount } from "svelte";
  import { isComplete, type TaskDetails } from "$lib/data-types/task-info";
  import Button from "$lib/components/button.svelte";
  import axios from "axios";
  import UpdateDetails from "$lib/components/update-details.svelte";

  type UpdateState = TaskDetails | null | "loading";

  let updateStatus: UpdateState = "loading";

  function setUpUpdateStream() {
    updateStatus = "loading";
    const eventSource = new EventSource("/update/api");

    eventSource.onmessage = (e) => {
      const data: TaskDetails = JSON.parse(e.data);
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
    <a href="/update/history">View History</a>
    <p>no updates running right now</p>
    <Button onclick={update} disabled={!!updateStatus}>Update</Button>
  {:else}
    <UpdateDetails details={updateStatus} />
  {/if}
</div>
