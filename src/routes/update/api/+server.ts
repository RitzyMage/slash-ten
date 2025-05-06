import ParallelTasks from "$lib/server/tasks/parallel-tasks";
import TaskSequence from "$lib/server/tasks/task-sequence";
import TaskStream from "$lib/server/tasks/task-stream";
import TimeoutTask from "$lib/server/tasks/timeout-task";
import UpdateRunner from "$lib/server/update-runner";

let runner = new UpdateRunner();

export async function GET() {
  let task = runner.GetTask(-1);
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
    new TaskSequence([
      new TimeoutTask(5000),
      new TimeoutTask(3000),
      new TimeoutTask(2000),
    ]),
    new TaskSequence([
      new TimeoutTask(2000),
      new TimeoutTask(3000),
      new ParallelTasks([
        new TimeoutTask(8000),
        new TimeoutTask(10000),
        new TimeoutTask(4000),
      ]),
    ]),
    new TimeoutTask(4000),
  ]);
  runner.AddTask(task, -1);
  return Response.json({ taskId: -1 });
}
