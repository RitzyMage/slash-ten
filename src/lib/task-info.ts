export enum Status {
  STARTED,
  IN_PROGRESS,
  SUCCESSFUL,
  FAILED,
}

export interface TaskDetails {
  status: Status;
  message: string;
  completion: number;
}

export function isComplete(info: TaskDetails) {
  return [Status.SUCCESSFUL, Status.FAILED].includes(info.status);
}
