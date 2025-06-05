import TaskSequence from "./task-sequence";
import UpdateUserBookSimilarityTask from "./udpate-user-book-similarity-task";
import UpdateUsersSimilarityTask from "./udpate-users-similarity-task";
import UpdateBooksSimilarityTask from "./update-book-similarity-task";

export default class UpdateSimilarityTask extends TaskSequence {
  constructor() {
    super([
      new UpdateUsersSimilarityTask(),
      new UpdateUserBookSimilarityTask(),
      new UpdateBooksSimilarityTask(),
    ]);
  }
}
