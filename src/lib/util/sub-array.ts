export interface SubArraySkip {
  numSkipped: number;
}

interface SubArrayInfoStartEnd {
  numStart: number;
  numEnd: number;
}

interface SubArrayInfoMiddle {
  numMiddle: number;
  middleIndex: number;
}

export type SubArrayInfo = SubArrayInfoStartEnd | SubArrayInfoMiddle;

type Indexed<T> = T & { index: number };

function GetStartAndEnd<T>(array: T[], info: SubArrayInfoStartEnd) {
  let startSlice: Indexed<T>[] = array
    .slice(0, info.numStart)
    .map((_, i) => ({ ..._, index: i }));

  let endStart = array.length - 1 - info.numEnd;
  let endSlice: Indexed<T>[] = array
    .slice(endStart, -1)
    .map((_, i) => ({ ..._, index: i + endStart }));

  let numSkipped = endStart - info.numStart;
  if (numSkipped <= 0) {
    return array.map((_, i) => ({ ..._, index: i }));
  }
  return [...startSlice, { numSkipped }, ...endSlice];
}

function GetMiddle<T>(array: T[], info: SubArrayInfoMiddle) {
  let middleIndex = info.middleIndex;
  if (middleIndex > array.length) {
    middleIndex = array.length;
  }
  let middleSliceSize = Math.ceil(info.numMiddle / 2);
  let middleStartIndex = Math.max(middleIndex - middleSliceSize, 0);
  let middleEndIndex = Math.min(middleIndex + middleSliceSize, array.length);
  let middleSlice: Indexed<T>[] = array
    .slice(middleStartIndex, middleEndIndex)
    .map((_, i) => ({ ..._, index: i + middleStartIndex }));

  let startGap =
    middleStartIndex > 0 ? { numSkipped: middleStartIndex } : undefined;
  let endSkipCount = array.length - middleEndIndex;
  let endGap = endSkipCount > 0 ? { numSkipped: endSkipCount } : undefined;

  let result: (Indexed<T> | SubArraySkip)[] = [];
  if (startGap) {
    result.push(startGap);
  }
  result = result.concat(middleSlice);
  if (endGap) {
    result.push(endGap);
  }

  return result;
}

export default function getSubArray<T>(
  array: T[],
  info: SubArrayInfo
): (Indexed<T> | SubArraySkip)[] {
  if ("numStart" in info) {
    return GetStartAndEnd(array, info);
  }

  return GetMiddle(array, info);
}
