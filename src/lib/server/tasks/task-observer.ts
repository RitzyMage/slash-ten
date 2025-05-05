import type { TaskInfo } from "$lib/data-types/task-info";

export default interface TaskObserver {
  notify(info: TaskInfo): void;
}
