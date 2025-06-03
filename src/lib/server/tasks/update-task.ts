import GetUserReviewsTask from "./get-user-reviews-task";
import ParallelTasks from "./parallel-tasks";
import TaskSequence from "./task-sequence";
import UpdateClientsTask from "./update-clients-task";

export default async function GetUpdateTask() {
  return new TaskSequence([new UpdateClientsTask()]);
}
