import { Status, type TaskInfo } from "../../data-types/task-info";

abstract class Task {
  constructor() {
    this._id = Task.lastID++;
  }

  public async Run(cleanup: () => void): Promise<void> {
    try {
      await this._Run();
    } catch (e) {
      this.updateStatus(Status.FAILED, `exception thrown: ${e?.toString()}`);
    } finally {
      cleanup();
      this.closeStreams();
    }
  }

  protected abstract _Run(): Promise<void>;

  public get id() {
    return this._id;
  }

  public async getStream() {
    this._streams.push(null);
    this._streamControllers.push(null);
    let index = this._streams.length;
    let stream = new ReadableStream({
      start: (controller) => {
        this._streamControllers[index] = controller;
        this.sendMessage();
      },
    });
    this._streams[index] = stream;
    return stream;
  }

  public sendStreamUpdate() {
    this.sendMessage();
  }

  public get currentInfo() {
    return this._currentInfo;
  }

  protected updateStatus(status: Status, info: string) {
    console.log(`Task ${this.id} is now ${status} with message ${info}`);
    this._currentInfo = { status, info };
    this.sendMessage();
  }

  private sendMessage() {
    let message = JSON.stringify(this._currentInfo);
    this._streamControllers
      .filter((_, i) => this._streams[i]?.locked)
      .forEach((controller) =>
        controller?.enqueue(this._encoder.encode(`data: ${message}\n\n`))
      );
  }

  private _currentInfo: TaskInfo = {
    status: Status.STARTED,
    info: "Job queued",
  };

  private closeStreams() {
    this._streamControllers
      .filter((_, i) => this._streams[i]?.locked)
      .forEach((controller) => controller?.close());
  }

  private _id: number;
  private _streamControllers: (ReadableStreamDefaultController<any> | null)[] =
    [];
  private _streams: (ReadableStream | null)[] = [];
  private _encoder = new TextEncoder();
  static lastID = 1;
}

export default Task;
