<script lang="ts">
  import type { BookMetadata } from "$lib/server/db/types";

  export let metadata: { BookMetadata: BookMetadata | null };
  let { BookMetadata: book } = metadata;
</script>

{#if book}
  <div class="metadata book-metadata">
    {book.author}
    {#if book.series}
      <div>
        {book.series}
        #{book.seriesOrder}
      </div>
    {/if}
  </div>
{/if}
