import type Task from './tasks/task';
import { db } from './db';
import { updateHistory } from './db/schema';
import type TaskObserver from './tasks/task-observer';
import { isComplete, Status, type TaskDetails } from '$lib/task-info';

class UpdateRunner implements TaskObserver {
	async notify(info: TaskDetails): Promise<void> {
		if (isComplete(info)) {
			await db.insert(updateHistory).values({
				ran: new Date(),
				success: info.status === Status.SUCCESSFUL,
				updateData: JSON.stringify(info),
			});
		}
	}

	public RunTask(task: Task) {
		if (this.task) {
			throw new Error('Cannot start a new task while one is running!');
		}
		this.task = task;
		task.addObserver(this);
		task.Run(() => this.RemoveTask());
	}

	private async RemoveTask() {
		if (!this.task) {
			throw new Error(`Not currently running a task`);
		}
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
