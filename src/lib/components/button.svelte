<button {...$$restProps}><slot /></button>

<style>
  button {
    background-color: var(--theme-2);
    border: 1px solid transparent;
    padding: var(--1);
    border-radius: var(--rounded);
    color: var(--bg-dark);
    transition: border 200ms ease-out;
    transition: background-color 200ms ease-out;
    cursor: pointer;
  }

  button:hover {
    background-color: transparent;
    border: 1px solid var(--theme-2);
    color: var(--theme-2);
  }
</style>
