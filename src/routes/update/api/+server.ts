import TaskStream from "$lib/server/tasks/task-stream";
import GetUpdateTask from "$lib/server/tasks/update-task";
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
  let task = await GetUpdateTask();
  runner.RunTask(task);
  return Response.json({ success: true });
}
