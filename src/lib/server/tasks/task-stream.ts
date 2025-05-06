import { isComplete, type TaskDetails } from "$lib/data-types/task-info";
import type Task from "./task";
import type TaskObserver from "./task-observer";

export default class TaskStream implements TaskObserver {
  constructor(task: Task | null) {
    if (task) {
      task.addObserver(this);
      this._stream = new ReadableStream({
        start: (controller) => {
          this._controller = controller;
        },
        cancel: () => {
          task.removeObserver(this);
        },
      });
    } else {
      this._stream = new ReadableStream({
        start: (controller) => {
          controller.enqueue(
            this._encoder.encode(
              `event: status\ndata: ${JSON.stringify({
                message: "No tasks running",
              })}\n\n`
            )
          );
          controller.close();
        },
      });
    }
  }

  notify(info: TaskDetails): void {
    this.sendMessage(info);
    if (isComplete(info)) {
      this._controller?.close();
    }
  }

  private sendMessage(info: TaskDetails) {
    let message = JSON.stringify(info);
    this._controller?.enqueue(this._encoder.encode(`data: ${message}\n\n`));
  }

  public get stream() {
    return this._stream;
  }

  private _stream: ReadableStream;
  private _encoder = new TextEncoder();
  private _controller: ReadableStreamDefaultController<any> | null = null;
}
