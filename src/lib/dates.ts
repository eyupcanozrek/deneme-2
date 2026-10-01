export const day = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const relativeDay = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return day(d);
};
export const dateLabel = (value: string) =>
  new Date(
    value.length === 10 ? `${value}T12:00:00` : value,
  ).toLocaleDateString(undefined, { month: "short", day: "numeric" });
/** Timestamp fields persist as UTC ISO strings; daily fields stay calendar dates. */
export const timestamp = (local: string) => new Date(local).toISOString();
export const localDateTime = (iso: string) => {
  const date = new Date(iso);
  return `${day(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};
export const entryDay = (value: string) =>
  value.length === 10 ? value : day(new Date(value));
