<script lang="ts">
  export let contents: string;
</script>

{#each contents.split("\n") as line}
  {#each line.replace(/[^\t]/g, "").split("")}
    <span class="indent">&nbsp;&nbsp;&nbsp;&nbsp;</span>
  {/each}
  {line.trim()} <br />
{/each}
