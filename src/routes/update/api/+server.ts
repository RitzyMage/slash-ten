import TaskStream from "$lib/server/tasks/task-stream";
import TimeoutTask from "$lib/server/tasks/timeout-task";
import UpdateRunner from "$lib/server/update-runner";

let runner = new UpdateRunner();

export async function GET() {
  let task = runner.GetTask(-1);
  if (task) {
    let taskStream = new TaskStream(task);
    return new Response(taskStream.stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } else {
    return Response.json(
      { message: "No tasks running for current user" },
      { status: 404 }
    );
  }
}

export async function POST() {
  let task = new TimeoutTask(30000);
  runner.AddTask(task, -1);
  return Response.json({ taskId: -1 });
}
