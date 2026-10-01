import { TradeFields, TradeReflection } from "../features/trading/TradeFields";
import { TaskFields } from "../features/school/TaskFields";
import { SpeechFields } from "../features/speech/SpeechFields";
import { useState } from "react";
import { WorkoutFields } from "../features/fitness/WorkoutFields";
import { MealFields } from "../features/nutrition/MealFields";
import {
  Entry,
  EntryKind,
  Workout,
  Meal,
  Trade,
  Task,
  PersonalEvent,
  metadata,
} from "../data/models";
import { useStore } from "../app/Store";
import { day, localDateTime, timestamp } from "../lib/dates";
import { Field, Modal } from "./UI";
export const names: Record<EntryKind, string> = {
  workouts: "workout",
  meals: "meal",
  trades: "trade",
  tasks: "school task",
  speech: "practice entry",
  notes: "note",
  events: "personal event",
};
function fresh(kind: EntryKind, date = day()): Entry {
  const base = { ...metadata(), date, title: "" };
  switch (kind) {
    case "workouts":
      return { ...base, status: "Planned", notes: "", exercises: [] };
    case "meals":
      return { ...base, foods: [] };
    case "trades":
      return {
        ...base,
        date: date + "T09:00",
        market: "Stocks",
        direction: "Long",
        entry: 0,
        exit: null,
        quantity: 1,
        fees: 0,
        currency: "USD",
        reason: "",
        notes: "",
        mistakes: "",
        lessons: "",
      };
    case "tasks":
      return {
        ...base,
        subjectId: "",
        type: "Homework",
        priority: "Medium",
        status: "Not started",
        notes: "",
      };
    case "speech":
      return {
        ...base,
        exercises: "",
        duration: 15,
        difficulty: 3,
        notes: "",
        observations: "",
      };
    case "events":
      return {
        ...base,
        date: date + "T09:00",
        end: date + "T10:00",
        notes: "",
      };
    default:
      return { ...base, notes: "" };
  }
}
export function EntryEditor({
  kind,
  entry,
  date,
  onClose,
}: {
  kind: EntryKind;
  entry?: Entry;
  date?: string;
  onClose: () => void;
}) {
  const { db, update } = useStore();
  const [record, setRecord] = useState<Entry>(() =>
    entry
      ? {
          ...structuredClone(entry),
          ...(kind === "trades" || kind === "events"
            ? {
                date: localDateTime(entry.date),
                ...(kind === "events"
                  ? { end: localDateTime((entry as PersonalEvent).end) }
                  : {}),
              }
            : {}),
        }
      : kind === "trades"
        ? { ...fresh(kind, date), currency: db.settings.currency }
        : fresh(kind, date),
  );
  const [catalog, setCatalog] = useState(db.exercises),
    [subjects, setSubjects] = useState(db.subjects),
    [message, setMessage] = useState("");
  const patch = (key: string, value: unknown) =>
    setRecord((r) => ({ ...r, [key]: value }));
  const text = (
    label: string,
    key: string,
    required = false,
    type = "text",
  ) => (
    <Field label={label}>
      <input
        autoFocus={key === "title"}
        required={required}
        type={type}
        value={String(
          (record as unknown as Record<string, unknown>)[key] ?? "",
        )}
        onChange={(e) => patch(key, e.target.value)}
      />
    </Field>
  );
  const number = (label: string, key: string, min = 0, max?: number) => (
    <Field label={label}>
      <input
        type="number"
        required
        min={min}
        max={max}
        step={key === "difficulty" ? "1" : "any"}
        value={Number((record as unknown as Record<string, unknown>)[key])}
        onChange={(e) =>
          patch(key, e.target.value === "" ? "" : Number(e.target.value))
        }
      />
    </Field>
  );
  const area = (label: string, key: string) => (
    <Field label={label}>
      <textarea
        rows={3}
        value={String(
          (record as unknown as Record<string, unknown>)[key] ?? "",
        )}
        onChange={(e) => patch(key, e.target.value)}
      />
    </Field>
  );
  const select = (label: string, key: string, values: string[]) => (
    <Field label={label}>
      <select
        value={String((record as unknown as Record<string, unknown>)[key])}
        onChange={(e) => patch(key, e.target.value)}
      >
        {values.map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
    </Field>
  );
  const fields = { text, number, area, select, patch };
  const w = record as Workout,
    m = record as Meal;
  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!record.title.trim()) {
      setMessage("Please enter a title.");
      return;
    }
    if (kind === "workouts" && !w.exercises.length) {
      setMessage("Add at least one exercise.");
      return;
    }
    if (kind === "meals" && !m.foods.length) {
      setMessage("Add at least one food.");
      return;
    }
    if (kind === "tasks" && !(record as Task).subjectId) {
      setMessage("Choose or create a subject.");
      return;
    }
    if (kind === "events" && (record as PersonalEvent).end < record.date) {
      setMessage("End time must be after start time.");
      return;
    }
    if (kind === "trades") {
      try {
        new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: (record as Trade).currency,
        });
      } catch {
        setMessage("Use a valid three-letter currency code.");
        return;
      }
    }
    const saved = {
      ...record,
      title: record.title.trim(),
      ...(kind === "trades" || kind === "events"
        ? { date: timestamp(record.date) }
        : {}),
      ...(kind === "events"
        ? { end: timestamp((record as PersonalEvent).end) }
        : {}),
      updatedAt: new Date().toISOString(),
    };
    if (
      update((d) => ({
        ...d,
        exercises: [
          ...d.exercises,
          ...catalog.filter((c) => !d.exercises.some((x) => x.id === c.id)),
        ],
        subjects: [
          ...d.subjects,
          ...subjects.filter((s) => !d.subjects.some((x) => x.id === s.id)),
        ],
        [kind]: [...d[kind].filter((x) => x.id !== saved.id), saved],
      }))
    )
      onClose();
    else setMessage("Unable to save. Please check browser storage.");
  }
  return (
    <Modal title={`${entry ? "Edit" : "Add"} ${names[kind]}`} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-grid">
          {text(
            kind === "trades"
              ? "Asset / pair"
              : kind === "speech"
                ? "Practice title"
                : "Title",
            "title",
            true,
          )}
          {text(
            kind === "tasks"
              ? "Due date"
              : kind === "events"
                ? "Start"
                : "Date",
            "date",
            true,
            kind === "trades" || kind === "events" ? "datetime-local" : "date",
          )}
          {kind === "workouts" &&
            select("Status", "status", ["Planned", "Completed"])}
          {kind === "trades" && (
            <TradeFields fields={fields} trade={record as Trade} />
          )}
          {kind === "tasks" && (
            <TaskFields
              fields={fields}
              task={record as Task}
              subjects={subjects}
              setSubjects={setSubjects}
            />
          )}
          {kind === "speech" && <SpeechFields fields={fields} />}
          {kind === "events" && text("End", "end", true, "datetime-local")}
        </div>
        {kind === "workouts" && (
          <WorkoutFields
            workout={w}
            catalog={catalog}
            setCatalog={setCatalog}
            onChange={(exercises) => patch("exercises", exercises)}
          />
        )}
        {kind === "meals" && (
          <MealFields meal={m} onChange={(foods) => patch("foods", foods)} />
        )}
        {kind === "trades" ? (
          <TradeReflection fields={fields} />
        ) : (
          kind !== "meals" &&
          area(kind === "notes" ? "Content" : "Notes", "notes")
        )}
        {kind === "speech" && area("Progress observations", "observations")}
        {message && (
          <p className="error" role="alert">
            {message}
          </p>
        )}
        <footer className="form-footer">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button primary">
            Save {names[kind]}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
