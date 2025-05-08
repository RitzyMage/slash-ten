import Task from "./tasks/task";
import { db } from "./db";
import { updateHistory } from "./db/schema";

// apparently static members get reset on HMR so had to make a global
if (!globalThis.__tasks) {
  globalThis.__tasks = {};
}

class UpdateRunner {
  public AddTask(task: Task, userId: number) {
    this.tasks[userId] = task;
    task.Run(() => this.RemoveTask(userId));
  }

  private async RemoveTask(id: number) {
    let task = this.tasks[id];
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }
    await db.insert(updateHistory).values({
      ran: new Date(),
      updateData: JSON.stringify(task.currentInfo),
    });
    delete this.tasks[id];
  }

  public GetTask(id: number) {
    return this.tasks[id];
  }

  private get tasks() {
    return globalThis.__tasks;
  }
}

export default UpdateRunner;
