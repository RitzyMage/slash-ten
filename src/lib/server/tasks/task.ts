import { Status, type TaskDetails } from "../../task-info";
import type TaskObserver from "./task-observer";

abstract class Task {
  public async Run(cleanup: () => void): Promise<void> {
    try {
      await this._Run();
    } catch (e) {
      console.error(e);
      this.updateStatus({
        status: Status.FAILED,
        message: `exception thrown: ${e?.toString()}`,
        completion: 1,
      });
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

  protected updateStatus(newDetails: TaskDetails) {
    this._currentInfo = newDetails;
    this.notifyObservers();
  }

  private notifyObservers() {
    for (let observer of this._observers) {
      observer.notify(this._currentInfo);
    }
  }

  private _currentInfo: TaskDetails = {
    status: Status.STARTED,
    message: "Job queued",
    completion: 0,
  };

  private _observers: TaskObserver[] = [];
}

export default Task;
