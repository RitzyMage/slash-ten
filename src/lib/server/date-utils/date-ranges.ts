export const YEAR = 31536000000 as const;
export const MONTH = 2768400000 as const;

type DATE_RANGE = typeof YEAR | typeof MONTH;

export function randomDateInRange(range: DATE_RANGE) {
  let randomOffset = Math.round(Math.random() * range);
  return new Date(Date.now() + randomOffset);
}
