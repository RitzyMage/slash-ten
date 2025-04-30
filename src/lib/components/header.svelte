<nav class="header">
  <div class="header-contents">
    <a href="/" class="homeLink">
      <span class="homeLink-logo">/10</span>
      <span class="homeLink-name">Slash Ten</span>
    </a>
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
  }

  .homeLink {
    text-decoration: none;
    position: relative;
    display: flex;
    align-items: start;
    gap: var(--1);
  }

  .homeLink-logo {
    background-color: var(--theme-2);
    padding: 0 2px;
    border-radius: var(--rounded);
  }

  .homeLink-name {
    font-size: var(--font-xl);
    color: var(--text-emphasis);
  }

  .homeLink::after {
    content: "";
    display: block;
    height: 2px;
    width: 200px;
    background-image: linear-gradient(to right, var(--theme-1), var(--theme-2));
    position: absolute;
    top: 38px;
    left: 44px;
  }
</style>
