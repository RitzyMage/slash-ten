import GoodreadsReviewFetcher from "$lib/server/review-fetchers/goodreads-review-fetcher";
import UpdateReviewsTask from "$lib/server/tasks/update-reviews-task";
import UpdateRunner from "$lib/server/update-runner";

const runner = new UpdateRunner();

export async function GET() {
  let task = new UpdateReviewsTask(new GoodreadsReviewFetcher());
  runner.AddTask(task, "update-all");

  return new Response(await task.getStream(), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
