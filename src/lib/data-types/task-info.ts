export enum Status {
  STARTED,
  IN_PROGRESS,
  SUCCESSFUL,
  FAILED,
}

export interface TaskInfo {
  status: Status;
  info: string;
}

export function isComplete(info: TaskInfo) {
  return [Status.SUCCESSFUL, Status.FAILED].includes(info.status);
}
