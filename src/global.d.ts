import Task from "./UpdateRunner/Task";

export {};

declare global {
  var __tasks: Record<string, Task>;
  var __taskTags: Record<string, number>;
  var __tagTasks: Record<string, string>;
}
