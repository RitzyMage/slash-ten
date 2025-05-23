import Task from "./tasks/task";
import { db } from "./db";
import { updateHistory } from "./db/schema";

class UpdateRunner {
  public RunTask(task: Task) {
    if (this.task) {
      throw new Error("Cannot start a new task while one is running!");
    }
    this.task = task;
    task.Run(() => this.RemoveTask());
  }

  private async RemoveTask() {
    if (!this.task) {
      throw new Error(`Not currently running a task`);
    }
    await db.insert(updateHistory).values({
      ran: new Date(),
      updateData: JSON.stringify(this.task.currentInfo),
    });
    this.task = undefined;
  }

  private set task(task: Task | undefined) {
    globalThis.__task = task;
  }

  public get task() {
    return globalThis.__task;
  }
}

export default UpdateRunner;
