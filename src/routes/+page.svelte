<script lang="ts">
  import ClientsPage from "$lib/components/clients/clients-page.svelte";
  import MediaCard from "$lib/components/media-card.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  let { clients } = data;
</script>

<ClientsPage {clients} />
