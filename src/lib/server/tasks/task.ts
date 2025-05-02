import { Status, type TaskInfo } from "../../data-types/task-info";
import type TaskObserver from "./task-observer";

abstract class Task {
  public async Run(cleanup: () => void): Promise<void> {
    try {
      await this._Run();
    } catch (e) {
      this.updateStatus(Status.FAILED, `exception thrown: ${e?.toString()}`, 1);
    } finally {
      cleanup();
    }
  }

  public addObserver(observer: TaskObserver) {
    this._observers.push(observer);
  }

  public removeObserver(observer: TaskObserver) {
    this._observers = this._observers.filter((_) => _ !== observer);
  }

  protected abstract _Run(): Promise<void>;

  public get currentInfo() {
    return this._currentInfo;
  }

  protected updateStatus(status: Status, info: string, completion: number) {
    console.log(
      `Task is now ${status} with message ${info}, ${(completion * 100).toFixed(
        2
      )}% done`
    );
    this._currentInfo = { status, info, completion };
    this.notifyObservers();
  }

  private notifyObservers() {
    for (let observer of this._observers) {
      observer.notify(this._currentInfo);
    }
  }

  private _currentInfo: TaskInfo = {
    status: Status.STARTED,
    info: "Job queued",
    completion: 0,
  };

  private _observers: TaskObserver[] = [];
}

export default Task;
