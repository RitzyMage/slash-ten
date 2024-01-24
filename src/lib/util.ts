const rightPad = (val: string, length: number) => {
  val = String(val || '');
  if (val.length > length) {
    return val.substring(0, length);
  }
  const missingLength = length - val.length;
  const spaces = Array(missingLength).fill(' ').join('');
  return val + spaces;
};

const leftPad = (val: string, length: number, char = ' ') => {
  val = String(val || '');
  if (val.length > length) {
    return val.substring(0, length);
  }
  const missingLength = length - val.length;
  const spaces = Array(missingLength).fill(char).join('');
  return spaces + val;
};

function groupBy<T, K extends keyof T>(arr: T[], key: K) {
  return arr.reduce((result, item) => {
    let value = item[key] as string;
    if (!result[value]) {
      result[value] = [];
    }
    result[value].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

function keyBy<T, K extends keyof T>(arr: T[], key: K) {
  return arr.reduce((result, item) => {
    result[item[key] as string] = item;
    return result;
  }, {} as Record<string, T>);
}

function split<T>(arr: T[], filter: (_: T) => boolean) {
  return arr.reduce<[T[], T[]]>(
    ([matches, notMatches], item) => {
      if (filter(item)) {
        matches.push(item);
      } else {
        notMatches.push(item);
      }
      return [matches, notMatches];
    },
    [[], []]
  );
}

export { rightPad, leftPad, groupBy, keyBy, split };
