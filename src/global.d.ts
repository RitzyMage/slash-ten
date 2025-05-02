import type Task from "$lib/server/tasks/task";

declare global {
  var __tasks: Record<number, Task>;
}

export {}; // required so this file is treated as a module
