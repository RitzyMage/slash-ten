import type { TaskDetails } from "$lib/task-info";

export default interface TaskObserver {
  notify(info: TaskDetails): void;
}
