import UpdateRunner from "$lib/server/update-runner";

const runner = new UpdateRunner();

export async function GET({ params }) {
  let task = runner.GetTask(parseInt(params.id));
  return new Response(await task.getStream(), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
