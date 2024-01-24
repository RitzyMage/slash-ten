import Task from "./tasks/task";
import { isComplete } from "../data-types/task-info";

// apparently static members get reset on HMR so had to make a global
if (!global.__tasks) {
  global.__tasks = {};
  global.__taskTags = {};
  global.__tagTasks = {};
}

class UpdateRunner {
  public AddTask(task: Task, tag: string) {
    this.tasks[task.id] = task;
    this.AddTag(task.id, tag);
    task.Run(() => this.RemoveTask(task.id));
  }

  public RemoveTask(id: number) {
    let task = this.tasks[id];
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }
    if (!isComplete(task.currentInfo)) {
      throw new Error(`Cannot remove task ${id}; it has not finished!`);
    }
    delete this.tasks[id];
    let tag = this.tagTasks[id];
    delete this.taskTags[tag];
    delete this.tagTasks[id];
  }

  public GetTask(id: number) {
    return this.tasks[id];
  }

  public GetTaskId(tag: string) {
    return this.taskTags[tag];
  }

  private AddTag(taskId: number, tag: string) {
    if (this.taskTags[tag]) {
      throw new Error(`There is already a task with tag ${tag}`);
    }
    this.taskTags[tag] = taskId;
    this.tagTasks[taskId] = tag;
  }

  private get tasks() {
    return global.__tasks;
  }

  private get taskTags() {
    return global.__taskTags;
  }

  private get tagTasks() {
    return global.__tagTasks;
  }
}

export default UpdateRunner;
