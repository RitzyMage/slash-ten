import UpdateUsersTask from "./update-users-task";
import TaskSequence from "./task-sequence";
import UpdateBooksTask from "./update-books-task";
import UpdateClientsTask from "./update-clients-task";

export default async function GetUpdateTask() {
  return new TaskSequence([
    new UpdateClientsTask(),
    new UpdateBooksTask(),
    new UpdateUsersTask(),
  ]);
}
