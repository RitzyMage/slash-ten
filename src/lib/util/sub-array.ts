export interface SubArraySkip {
  numSkipped: number;
}

export interface SubArrayInfo {
  numStart: number;
  numEnd: number;
  numMiddle: number;
  middleIndex: number;
}

type Indexed<T> = T & { index: number };

export default function getSubArray<T>(
  array: T[],
  info: SubArrayInfo
): (Indexed<T> | SubArraySkip)[] {
  let startSlice: Indexed<T>[] = array
    .slice(0, info.numStart)
    .map((_, i) => ({ ..._, index: i }));

  let middleSliceSize = Math.ceil(info.numMiddle / 2);
  let middleStartIndex = info.middleIndex - middleSliceSize;
  let middleEndIndex = 0;
  let middleSlice: Indexed<T>[] = array
    .slice(middleStartIndex, middleEndIndex)
    .map((_, i) => ({ ..._, index: i + middleStartIndex }));

  let middleSkip: undefined | SubArraySkip;
  let numSkippedMiddle = middleStartIndex - info.numStart;
  if (numSkippedMiddle <= 0) {
    middleSlice = [];
    startSlice = array
      .slice(0, middleEndIndex)
      .map((_, i) => ({ ..._, index: i }));
  } else {
    middleSkip = { numSkipped: numSkippedMiddle };
  }

  let endStart = array.length - 1 - info.numEnd;
  let endSlice: Indexed<T>[] = array
    .slice(endStart, -1)
    .map((_, i) => ({ ..._, index: i + endStart }));

  let endSkip: undefined | SubArraySkip;
  let numSkippedEnd = endStart - middleEndIndex;
  if (numSkippedEnd <= 0) {
    middleSlice = [];
    endSlice = array
      .slice(middleStartIndex, -1)
      .map((_, i) => ({ ..._, index: i + middleStartIndex }));
  } else {
    endSkip = { numSkipped: numSkippedEnd };
  }

  let result: (Indexed<T> | SubArraySkip)[] = [];
  result = result.concat(startSlice);

  if (middleSkip) {
    result.push(middleSkip);
  }

  result = result.concat(middleSlice);

  if (endSkip) {
    result.push(endSkip);
  }

  result = result.concat(endSlice);

  return result;
}
