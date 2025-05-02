import Task from "./tasks/task";
import { isComplete } from "../data-types/task-info";

// apparently static members get reset on HMR so had to make a global
if (!globalThis.__tasks) {
  globalThis.__tasks = {};
}

class UpdateRunner {
  public AddTask(task: Task, userId: number) {
    this.tasks[userId] = task;
    task.Run(() => this.RemoveTask(userId));
  }

  private RemoveTask(id: number) {
    let task = this.tasks[id];
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }
    if (!isComplete(task.currentInfo)) {
      throw new Error(`Cannot remove task ${id}; it has not finished!`);
    }
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
