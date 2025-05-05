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
  let task = new TaskSequence([new TimeoutTask(2000), new TimeoutTask(1000)]);
  runner.AddTask(task, -1);
  return Response.json({ taskId: -1 });
}
