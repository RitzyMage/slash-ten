import type { TaskDetails } from "$lib/data-types/task-info";

export default interface TaskObserver {
  notify(info: TaskDetails): void;
}
