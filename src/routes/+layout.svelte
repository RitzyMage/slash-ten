<script lang="ts">
  import ClientSelector from "$lib/components/clients/client-selector.svelte";
  import Header from "$lib/components/header.svelte";
  import "../app.css";
  let { children, data } = $props();

  let { clients } = data;
</script>

<Header />
<article>
  {@render children?.()}
</article>
<ClientSelector {clients} />
