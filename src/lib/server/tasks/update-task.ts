import UpdateUsersTask from "./update-users-task";
import TaskSequence from "./task-sequence";
import UpdateBooksTask from "./update-books-task";
import UpdateClientsTask from "./update-clients-task";
import UpdateSimilarityTask from "./udpate-similarity-task";
import GoodreadsReviewFetcher from "../review-fetchers/goodreads-review-fetcher";

export default async function GetUpdateTask() {
  let reviewFetcher = new GoodreadsReviewFetcher();
  return new TaskSequence([
    new UpdateClientsTask({ reviewFetcher }),
    new UpdateBooksTask({ reviewFetcher }),
    new UpdateUsersTask(),
    new UpdateSimilarityTask(),
  ]);
}
