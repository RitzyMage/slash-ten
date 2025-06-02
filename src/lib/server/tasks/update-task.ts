import ParallelTasks from "./parallel-tasks";
import TaskSequence from "./task-sequence";
import TimeoutTask from "./timeout-task";

export default async function GetUpdateTask() {
  return new ParallelTasks([
    new TimeoutTask(8000),
    new TaskSequence(
      [
        new TimeoutTask(5000),
        new TimeoutTask(3000, true),
        new TimeoutTask(2000),
      ],
      { stopOnFail: true }
    ),
    new TaskSequence([
      new TimeoutTask(2000),
      new TimeoutTask(3000, true),
      new ParallelTasks([
        new TimeoutTask(8000, true),
        new TimeoutTask(10000),
        new TimeoutTask(4000, true),
      ]),
    ]),
    new TimeoutTask(4000),
  ]);
}
