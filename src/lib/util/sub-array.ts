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
  let middleSlice: Indexed<T>[] = array
    .slice(
      info.middleIndex - middleSliceSize,
      info.middleIndex + middleSliceSize
    )
    .map((_, i) => ({ ..._, index: i + info.middleIndex - middleSliceSize }));

  let endSlice: Indexed<T>[] = array
    .slice(-info.numEnd - 1, -1)
    .map((_, i) => ({ ..._, index: i + array.length - 1 - info.numEnd }));

  return [...startSlice, ...middleSlice, ...endSlice];
}
