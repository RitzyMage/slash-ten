import type Task from "$lib/server/tasks/task";

declare global {
  var __task: Task | undefined;
}

export {}; // required so this file is treated as a module
