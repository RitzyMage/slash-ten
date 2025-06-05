import type { TaskDetails } from "$lib/server/tasks/task-info";

export default interface TaskObserver {
  notify(info: TaskDetails): void;
}
