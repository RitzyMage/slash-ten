export const FIVE_YEARS = 157680000000 as const;
export const TWO_YEARS = 63072000000 as const;
export const YEAR = 31536000000 as const;
export const SIX_MONTHS = 16610400000 as const;
export const MONTH = 2768400000 as const;

type DATE_RANGE =
  | typeof YEAR
  | typeof MONTH
  | typeof SIX_MONTHS
  | typeof FIVE_YEARS
  | typeof TWO_YEARS;

export function randomDateInRange(range: DATE_RANGE) {
  let randomOffset = Math.round(Math.random() * range);
  return new Date(Date.now() + randomOffset);
}
