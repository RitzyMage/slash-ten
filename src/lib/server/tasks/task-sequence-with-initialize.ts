import { Status, type TaskDetails } from "$lib/data-types/task-info";
import Task from "./task";
import type TaskObserver from "./task-observer";
import TaskSequence from "./task-sequence";

export default abstract class TaskSequenceWithInitialize
  extends Task
  implements TaskObserver
{
  notify(info: TaskDetails): void {
    this.updateStatus(info);
  }

  protected async _Run(): Promise<void> {
    this.updateStatus({
      completion: 0,
      message: this.GetMessageLine(),
      status: Status.STARTED,
    });
    let tasks = await this.GetSequence();
    this.updateStatus({
      completion: 0,
      message: this.GetMessageLine(),
      status: Status.IN_PROGRESS,
    });

    let sequence = new TaskSequence(tasks);
    sequence.addObserver(this);
    await sequence.Run(() => sequence.removeObserver(this));
  }

  protected abstract GetSequence(): Promise<Task[]>;
  protected abstract GetMessageLine(): string;
}
