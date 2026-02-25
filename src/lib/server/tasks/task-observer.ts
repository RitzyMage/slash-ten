import type { TaskDetails } from "$lib/types/task-info";

export default interface TaskObserver {
  notify(info: TaskDetails): void;
}
