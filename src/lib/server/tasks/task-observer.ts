import type { TaskInfo } from "$lib/data-types/task-info";

export default abstract class TaskObserver {
  abstract notify(info: TaskInfo): void;
}
