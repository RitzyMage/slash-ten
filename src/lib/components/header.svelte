<script lang="ts">
  import Menu from "./icons/menu.svelte";

  const headerLinks = [
    { name: "Update", path: "/update" },
    { name: "Read", path: "/read" },
    { name: "Settings", path: "/settings" },
  ] as const;

  let toggleMenu = () => {
    menuShown = !menuShown;
  };

  let menuShown = false;
</script>

<nav class="header">
  <div class="header-contents">
    <a href="/" class="homeLink">
      <span class="homeLink-logo">/10</span>
      <span class="homeLink-name">Slash Ten</span>
    </a>
    <div
      class="header-links {menuShown
        ? 'header-links_open'
        : 'header-links_closed'}"
    >
      {#each headerLinks as link}
        <a href={link.path} class="header-link">{link.name}</a>
      {/each}
    </div>
    <span class="header-menu"> <Menu size={24} onclick={toggleMenu} /></span>
  </div>
</nav>

<style>
  .header {
    background-color: var(--bg);
  }

  .header-contents {
    padding: var(--1);
    height: var(--8);
    display: flex;
    align-items: center;
    width: calc(100% - var(--8));
    max-width: var(--128);
    margin: 0 auto;
    gap: var(--4);
  }

  .homeLink {
    text-decoration: none;
    position: relative;
    display: flex;
    align-items: start;
    gap: var(--1);
    font-family: var(--header-font);
    padding-right: var(--4);
  }

  .homeLink-logo {
    background-color: var(--theme-2);
    padding: 0 2px;
    border-radius: var(--rounded);
    font-size: 16px;
  }

  .homeLink-name {
    font-size: var(--font-large);
    color: var(--text-emphasis);
  }

  .homeLink::after {
    content: "";
    display: block;
    height: 2px;
    background-image: linear-gradient(to right, var(--theme-1), var(--theme-2));
    position: absolute;
    top: 38px;
    right: 0;
    left: 44px;
  }

  .header-links {
    display: flex;
    align-items: center;
    gap: var(--2);
  }

  .header-link {
    color: var(--text);
    text-decoration: none;
  }

  .header-link:hover {
    color: var(--text-emphasis);
  }

  .header-menu {
    height: 24px;
  }

  @media screen and (max-width: 600px) {
    .header-links_closed {
      display: none;
    }

    .header-links {
      position: absolute;
      flex-direction: column;
      left: 0;
      right: 0;
      top: var(--8);
      background-color: var(--bg);
      bottom: 0;
      padding: var(--4);
    }

    .header-contents {
      justify-content: space-between;
    }
  }

  @media screen and (min-width: 600px) {
    .header-menu {
      display: none;
    }
  }
</style>
