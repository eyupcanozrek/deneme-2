import { Database } from "./models";
import { migrate } from "./migrations";
export const STORAGE_KEY = "lifeos.database.v1";
const lists = [
  "exercises",
  "workouts",
  "meals",
  "water",
  "targets",
  "trades",
  "subjects",
  "tasks",
  "speech",
  "notes",
  "events",
] as const;
type RecordValue = Record<string, unknown>;
function object(value: unknown): RecordValue {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid record.");
  return value as RecordValue;
}
function text(r: RecordValue, key: string, required = false) {
  if (typeof r[key] !== "string" || (required && !(r[key] as string).trim()))
    throw new Error(`Invalid ${key}.`);
}
function number(
  r: RecordValue,
  key: string,
  min = 0,
  max = Infinity,
  integer = false,
) {
  if (
    typeof r[key] !== "number" ||
    !Number.isFinite(r[key]) ||
    (r[key] as number) < min ||
    (r[key] as number) > max ||
    (integer && !Number.isInteger(r[key]))
  )
    throw new Error(`Invalid ${key}.`);
}
function oneOf(r: RecordValue, key: string, options: string[]) {
  if (!options.includes(r[key] as string)) throw new Error(`Invalid ${key}.`);
}
function date(r: RecordValue, key: string, timestamp = false) {
  text(r, key, true);
  const s = r[key] as string;
  if (
    !(
      timestamp ? /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/ : /^\d{4}-\d{2}-\d{2}$/
    ).test(s) ||
    Number.isNaN(Date.parse(s)) ||
    new Date(`${s.slice(0, 10)}T12:00:00Z`).toISOString().slice(0, 10) !==
      s.slice(0, 10)
  )
    throw new Error(`Invalid ${key} date.`);
}
function entity(value: unknown) {
  const r = object(value);
  text(r, "id", true);
  for (const key of ["createdAt", "updatedAt"]) {
    text(r, key, true);
    if (Number.isNaN(Date.parse(r[key] as string)))
      throw new Error("Invalid timestamp.");
  }
  return r;
}
function collection(value: unknown, check: (r: RecordValue) => void) {
  if (!Array.isArray(value)) throw new Error("Invalid collection.");
  const ids = new Set<string>();
  for (const v of value) {
    const r = entity(v);
    if (ids.has(r.id as string)) throw new Error("Duplicate record ID.");
    ids.add(r.id as string);
    check(r);
  }
}
function currency(value: unknown) {
  if (typeof value !== "string" || !/^[A-Z]{3}$/.test(value))
    throw new Error("Invalid currency.");
  try {
    new Intl.NumberFormat(undefined, { style: "currency", currency: value });
  } catch {
    throw new Error("Invalid currency.");
  }
}
export function validateDatabase(value: unknown): Database {
  const root = object(value);
  const allIds = new Set<string>();
  function checkIds(value: unknown): void {
    if (Array.isArray(value)) {
      value.forEach(checkIds);
      return;
    }
    if (value && typeof value === "object") {
      const record = value as RecordValue;
      if ("id" in record) {
        const id = record.id as string;
        if (allIds.has(id)) throw new Error("Duplicate record ID.");
        allIds.add(id);
      }
      Object.values(record).forEach(checkIds);
    }
  }
  checkIds(root);
  if (root.schemaVersion !== 1)
    throw new Error("This data version is not supported.");
  const settings = object(root.settings);
  text(settings, "name", true);
  oneOf(settings, "theme", ["light", "dark"]);
  oneOf(settings, "weightUnit", ["kg", "lb"]);
  currency(settings.currency);
  for (const key of lists)
    if (!Array.isArray(root[key]))
      throw new Error(`Missing ${key} collection.`);
  collection(root.exercises, (r) => {
    text(r, "name", true);
    text(r, "category");
    oneOf(r, "unit", ["kg", "lb"]);
  });
  collection(root.subjects, (r) => {
    text(r, "name", true);
    text(r, "color", true);
  });
  const db = value as Database;
  const base = (r: RecordValue, timestamp = false) => {
    text(r, "title", true);
    date(r, "date", timestamp);
  };
  collection(root.workouts, (r) => {
    base(r);
    text(r, "notes");
    oneOf(r, "status", ["Planned", "Completed"]);
    collection(r.exercises, (e) => {
      if (!db.exercises.some((x) => x.id === e.exerciseId))
        throw new Error("Invalid exercise reference.");
      collection(e.sets, (s) => {
        number(s, "reps", 1, Infinity, true);
        number(s, "weight");
      });
      if (!(e.sets as unknown[]).length)
        throw new Error("Exercise needs at least one set.");
    });
    if (!(r.exercises as unknown[]).length)
      throw new Error("Workout needs an exercise.");
  });
  collection(root.meals, (r) => {
    base(r);
    collection(r.foods, (f) => {
      text(f, "name", true);
      text(f, "unit", true);
      number(f, "quantity", Number.MIN_VALUE);
      for (const k of ["calories", "protein", "carbs", "fat"]) number(f, k);
    });
    if (!(r.foods as unknown[]).length) throw new Error("Meal needs a food.");
  });
  collection(root.water, (r) => {
    date(r, "date");
    number(r, "amount", 1);
  });
  const targetDates = new Set<string>();
  collection(root.targets, (r) => {
    date(r, "date");
    if (targetDates.has(r.date as string))
      throw new Error("Duplicate target effective date.");
    targetDates.add(r.date as string);
    for (const k of ["calories", "protein", "carbs", "fat", "water"])
      number(r, k, 1);
  });
  collection(root.trades, (r) => {
    base(r, true);
    if (!/Z$|[+-]\d{2}:\d{2}$/.test(r.date as string))
      throw new Error("Timestamp needs timezone information.");
    text(r, "market", true);
    oneOf(r, "direction", ["Long", "Short"]);
    number(r, "entry", Number.MIN_VALUE);
    if (r.exit !== null) number(r, "exit");
    number(r, "quantity", Number.MIN_VALUE);
    number(r, "fees");
    currency(r.currency);
    for (const k of ["reason", "notes", "mistakes", "lessons"]) text(r, k);
  });
  collection(root.tasks, (r) => {
    base(r);
    if (!db.subjects.some((s) => s.id === r.subjectId))
      throw new Error("Invalid subject reference.");
    oneOf(r, "type", ["Homework", "Exam", "Project"]);
    oneOf(r, "priority", ["Low", "Medium", "High"]);
    oneOf(r, "status", ["Not started", "In progress", "Completed"]);
    text(r, "notes");
  });
  collection(root.speech, (r) => {
    base(r);
    text(r, "exercises", true);
    number(r, "duration", 1);
    number(r, "difficulty", 1, 5, true);
    text(r, "notes");
    text(r, "observations");
  });
  collection(root.notes, (r) => {
    base(r);
    text(r, "notes");
  });
  collection(root.events, (r) => {
    base(r, true);
    if (!/Z$|[+-]\d{2}:\d{2}$/.test(r.date as string))
      throw new Error("Timestamp needs timezone information.");
    date(r, "end", true);
    if (!/Z$|[+-]\d{2}:\d{2}$/.test(r.end as string))
      throw new Error("Timestamp needs timezone information.");
    if (Date.parse(r.end as string) < Date.parse(r.date as string))
      throw new Error("Invalid event end time.");
    text(r, "notes");
  });
  return db;
}
/** Synchronous V1 adapter. Replace this boundary with an async repository when a backend is introduced. */
export const browserStorage = {
  load(): Database | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? validateDatabase(migrate(JSON.parse(raw))) : null;
  },
  save(db: Database) {
    validateDatabase(db);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  },
};
