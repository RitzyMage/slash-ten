import GoodreadsReviewFetcher from "$lib/server/review-fetchers/goodreads-review-fetcher";
import UpdateUsersTask from "$lib/server/tasks/update-users-task";
import UpdateRunner from "$lib/server/update-runner";

const runner = new UpdateRunner();

export async function GET() {
  let task = new UpdateUsersTask(new GoodreadsReviewFetcher());
  runner.AddTask(task, "update-users");
  return new Response(await task.getStream(), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
