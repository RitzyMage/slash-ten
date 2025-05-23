import ParallelTasks from "$lib/server/tasks/parallel-tasks";
import TaskSequence from "$lib/server/tasks/task-sequence";
import TaskStream from "$lib/server/tasks/task-stream";
import TimeoutTask from "$lib/server/tasks/timeout-task";
import UpdateRunner from "$lib/server/update-runner";

let runner = new UpdateRunner();

export async function GET() {
  let task = runner.task ?? null;
  let taskStream = new TaskStream(task);
  return new Response(taskStream.stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function POST() {
  let task = new ParallelTasks([
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
  runner.RunTask(task);
  return Response.json({ taskId: -1 });
}
