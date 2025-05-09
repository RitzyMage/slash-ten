export function toHumanReadable(date: Date, { includeTime = false } = {}) {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: includeTime ? "numeric" : undefined,
    minute: includeTime ? "2-digit" : undefined,
    weekday: "short",
    timeZone: "America/Denver",
  });
}
