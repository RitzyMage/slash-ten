import GetUserReviewsTask from "./get-user-reviews-task";
import ParallelTasks from "./parallel-tasks";

export default async function GetUpdateTask() {
  return new ParallelTasks([
    new GetUserReviewsTask(1),
    new GetUserReviewsTask(10),
  ]);
}
