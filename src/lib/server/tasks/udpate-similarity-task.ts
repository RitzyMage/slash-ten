import TaskSequence from "./task-sequence";
import UpdateUserBookSimilarityTask from "./update-user-book-similarity-task";
import UpdateUsersSimilarityTask from "./update-users-similarity-task";
import UpdateBooksSimilarityTask from "./update-book-similarity-task";

export default class UpdateSimilarityTask extends TaskSequence {
  constructor() {
    super([
      // new UpdateUsersSimilarityTask(),
      new UpdateUserBookSimilarityTask(),
      // new UpdateBooksSimilarityTask(),
    ]);
  }
}
