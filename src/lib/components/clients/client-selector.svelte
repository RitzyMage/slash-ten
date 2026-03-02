<script lang="ts">
  import type { Client } from "$lib/server/db/types";
  import Close from "../icons/close.svelte";
  import client from "./client-state.svelte";
  const openModal = {
    command: "show-modal",
    commandfor: "clientSelector-modal",
  } as any;
  const closeModal = {
    command: "close",
    commandfor: "clientSelector-modal",
  } as any;

  let { clients } = $props<Client[]>();

  let name = client.id
    ? clients.find((_) => _.id === client.id)?.name
    : undefined;
</script>

<button id="clientSelector-button" {...openModal}>
  {name ? `Client: ${name}` : "No Client Selected"}
</button>

<dialog id="clientSelector-modal">
  <div class="clientSelector-header">
    <button class="clientSelector-close" {...closeModal}
      ><Close size={20} /></button
    >
  </div>
  <h2>Clients</h2>
  <select id="client-select" bind:value={client.id}>
    <option value="" onclick={() => (name = "")}>---</option>
    {#each clients as client}
      <option value={client.id} onclick={() => (name = client.name)}
        >{client.name}</option
      >
    {/each}
  </select>

  <h2>Type</h2>
  <select id="type-select" bind:value={client.mediaType}>
    <option value="BOOK">Book</option>
    <option value="GAME">Game</option>
    <option value="MOVIE">Movie</option>
  </select>
</dialog>

<style>
  #clientSelector-button {
    position: fixed;
    bottom: var(--2);
    right: var(--2);

    background-color: var(--theme-2);
    color: var(--bg);
    border: none;
    padding: var(--1);
    border-radius: var(--rounded);

    cursor: pointer;

    font-size: var(--2);

    transition: all 300ms;
  }

  #clientSelector-button:hover {
    background-color: var(--theme-1);
  }

  #clientSelector-modal::backdrop {
    backdrop-filter: blur(16px);
    background-color: rgba(0, 0, 0, 0.3);
  }

  #clientSelector-modal {
    border-radius: var(--rounded);
    background-color: var(--bg-light);
    color: var(--text);
    border: none;
    width: var(--64);
    max-width: 100vw;
  }

  .clientSelector-close {
    background-color: transparent;
    color: var(--text);
    cursor: pointer;
    border: none;
  }

  .clientSelector-header {
    display: flex;
    justify-content: end;
  }

  select,
  ::picker(select) {
    appearance: base-select;
  }

  select {
    border: 1px solid var(--text);
    border-radius: var(-rounded);
    background: var(--bg);
    color: var(--text);
    padding: var(--1);
    transition: 0.4s;
  }

  select:hover,
  select:focus {
    background: var(--bg-light);
  }
</style>
