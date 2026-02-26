<script>
  import ClientSelector from "$lib/components/clients/client-selector.svelte";
  import Header from "$lib/components/header.svelte";
  import "../app.css";
</script>

<Header />
<article>
  <slot />
</article>
<ClientSelector />
