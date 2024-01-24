import GoodreadsReviewFetcher from "$lib/server/review-fetchers/goodreads-review-fetcher";
import UpdateMineTask from "$lib/server/tasks/update-mine-task";
import UpdateRunner from "$lib/server/update-runner";

const runner = new UpdateRunner();

export async function GET() {
  let task = new UpdateMineTask(new GoodreadsReviewFetcher());
  runner.AddTask(task, "update-mine");
  return new Response(await task.getStream(), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
