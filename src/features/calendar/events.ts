import { entryDay } from "../../lib/dates";
import { Database, Entry, EntryKind } from "../../data/models";
export interface CalendarItem {
  id: string;
  date: string;
  title: string;
  kind: EntryKind;
  entry: Entry;
}
export function calendarItems(db: Database): CalendarItem[] {
  return (["workouts", "tasks", "speech", "events"] as EntryKind[]).flatMap(
    (kind) =>
      db[kind].map((entry) => ({
        id: entry.id,
        date: entryDay(entry.date),
        title: entry.title,
        kind,
        entry,
      })),
  );
}
