import type ReviewFetcher from "./review-fetchers/review-fetcher";
import type Database from "./db/database";
import type { MediaTemp } from "./review-fetchers/review-fetcher";
import { keyBy } from "$lib/util";
import type { Review } from "./review-fetchers/types";
import type { CreateMedia } from "./db/database";

class Subtask {
  constructor(
    action: (setStatus: (status: string) => void) => Promise<void>,
    setStatus: (status: string) => void
  ) {
    this._action = action(setStatus);
  }

  public get action() {
    return this._action;
  }

  public then(action: () => void) {
    this._action.then(action);
  }

  private _action: Promise<void>;
}

class SubtaskRunner {
  constructor(setStatus: (status: string) => void) {
    this._setStatus = setStatus;
  }

  public enqueue(
    name: string,
    action: (setStatus: (status: string) => void) => Promise<void>
  ) {
    let id = this._nextId++;
    let task = new Subtask(action, (status) => {
      this._statuses[id] = status;
      this.updateStatuses();
    });
    this._tasks[id] = task;
    this._statuses[id] = `Started subtask ${name} with id ${id}`;
    this.updateStatuses();
    task.then(() => this.dequeue(id));
    return task.action;
  }

  public get numTasks() {
    return Object.keys(this._tasks).length;
  }

  private getStatuses() {
    return Object.values(this._statuses).join("\n");
  }

  private updateStatuses() {
    this._setStatus(this.getStatuses());
  }

  public async finish() {
    let waitingFor = Object.values(this._tasks).map((_) => _.action);
    await Promise.all(waitingFor);
  }

  private dequeue(id: number) {
    delete this._tasks[id];
    delete this._statuses[id];
    this.updateStatuses();
  }

  private _tasks: Record<number, Subtask> = {};
  private _statuses: Record<number, string> = {};
  private _nextId = 0;
  private _setStatus: (status: string) => void;
}

const MAX_TASK_TIME = 500;
const MAX_TASKS = 10;
const generateTimeout = () =>
  new Promise((res) => setTimeout(res, MAX_TASK_TIME));

export default class UserUpdater {
  constructor(fetcher: ReviewFetcher, database: Database) {
    this._fetcher = fetcher;
    this._database = database;
  }

  public async Update(
    userId: number,
    externalId: number | string,
    loggedIn: boolean,
    updateStatus: (_: string) => void
  ) {
    let firstPage = await this.getPage(1, externalId, loggedIn);
    if (!firstPage.nextPage) {
      updateStatus(`failed to get page 1; returning`);
      return;
    }

    let taskQueue = new SubtaskRunner(updateStatus);

    await this.addPageToDatabase(firstPage.media, firstPage.reviews, userId);
    for (let i = 2; i <= firstPage.numPages; ++i) {
      let task = this.generateGetTask(
        i,
        externalId,
        userId,
        loggedIn,
        firstPage.numPages
      );
      let taskPromise = taskQueue.enqueue(
        `page ${i}/${firstPage.numPages}`,
        task
      );
      await Promise.any([taskPromise, generateTimeout()]);

      if (taskQueue.numTasks >= MAX_TASKS) {
        await taskQueue.finish();
      }
    }
    await taskQueue.finish();
  }

  private generateGetTask =
    (
      pageNumber: number,
      externalId: string | number,
      userId: number,
      loggedIn: boolean,
      numPages: number
    ) =>
    async (updateStatus: (message: string) => void) => {
      let page = await this.getPage(pageNumber, externalId, loggedIn);
      if (!page.nextPage && numPages && pageNumber < numPages) {
        updateStatus(
          `failed on page ${pageNumber}/${page.numPages || pageNumber}`
        );
        return;
      }
      updateStatus(
        `got page ${pageNumber}/${page.numPages || pageNumber} with ${
          page.reviews.length
        } reviews`
      );

      await this.addPageToDatabase(page.media, page.reviews, userId);
    };

  private async getPage(
    page: number,
    userId: number | string,
    loggedIn: boolean
  ) {
    return await this._fetcher.getUserReviews(userId, page, { loggedIn });
  }

  private async addPageToDatabase(
    media: MediaTemp[],
    reviews: Review[],
    userId: number
  ) {
    let reviewsByMedia = keyBy(reviews, "media");

    let dbMedia: CreateMedia[] = media
      .filter((_) => !!reviewsByMedia[_.id])
      .map((_) => ({
        externalId: _.id,
        name: _.title,
        mediaType: "BOOK",
        metadata: {
          author: _.metadata.author,
          series: _.metadata.series?.name || null,
          seriesOrder: _.metadata.series?.order || null,
        },
        externalLinks: _.externalLinks,
        review: reviewsByMedia[_.id],
      }));

    await this._database.addMedia(dbMedia, userId);
  }

  private _fetcher: ReviewFetcher;
  private _database: Database;
}
