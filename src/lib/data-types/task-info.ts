export enum Status {
  STARTED,
  IN_PROGRESS,
  SUCCESSFUL,
  FAILED,
}

interface BasicTaskDetails {
  status: Status;
  message: string;
  completion: number;
}

interface ParentTaskDetails extends BasicTaskDetails {
  details: TaskDetails[];
}

export type TaskDetails = ParentTaskDetails | BasicTaskDetails;

export function isComplete(info: TaskDetails) {
  return [Status.SUCCESSFUL, Status.FAILED].includes(info.status);
}
