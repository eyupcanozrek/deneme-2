import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  Entry,
  EntryKind,
  Meal,
  Speech,
  Task,
  Trade,
  Workout,
} from "../data/models";
import { useEditor } from "../app/Editor";
import { useStore } from "../app/Store";
import { dateLabel, localDateTime } from "../lib/dates";
import { money, pnl } from "../features/trading/calculations";
import { totals } from "../features/nutrition/calculations";
import { Empty, Modal } from "./UI";
export function EntryList({
  kind,
  entries,
}: {
  kind: EntryKind;
  entries: Entry[];
}) {
  const open = useEditor(),
    { db, remove, put } = useStore(),
    [deleting, setDeleting] = useState<Entry | null>(null);
  return (
    <>
      {entries.length ? (
        <div className={`entry-list ${kind === "notes" ? "notes-grid" : ""}`}>
          {[...entries]
            .sort((a, b) =>
              kind === "tasks" || kind === "events"
                ? a.date.localeCompare(b.date)
                : b.date.localeCompare(a.date),
            )
            .map((e) => (
              <article className="entry-card" key={e.id}>
                <div className="entry-top">
                  <div>
                    <span className="entry-date">
                      {dateLabel(e.date)}
                      {e.date.includes("T")
                        ? ` · ${localDateTime(e.date).split("T")[1]}`
                        : ""}
                    </span>
                    <h3>{e.title}</h3>
                  </div>
                  <div className="entry-actions">
                    <button
                      className="icon-button"
                      aria-label={`Edit ${e.title}`}
                      onClick={() => open(kind, e)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-button delete"
                      aria-label={`Delete ${e.title}`}
                      onClick={() => setDeleting(e)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {kind === "workouts" && (
                  <>
                    <div className="row">
                      <span
                        className={`badge ${(e as Workout).status === "Completed" ? "green" : ""}`}
                      >
                        {(e as Workout).status}
                      </span>
                      <span className="muted tiny">
                        {(e as Workout).exercises.reduce(
                          (a, x) => a + x.sets.length,
                          0,
                        )}{" "}
                        sets
                      </span>
                    </div>
                    {(e as Workout).exercises.map((ex) => (
                      <div className="exercise-summary" key={ex.id}>
                        <strong>
                          {
                            db.exercises.find((x) => x.id === ex.exerciseId)
                              ?.name
                          }
                        </strong>
                        <span>
                          {ex.sets
                            .map(
                              (s) =>
                                `${s.weight} ${db.exercises.find((x) => x.id === ex.exerciseId)?.unit} × ${s.reps}`,
                            )
                            .join(" / ")}
                        </span>
                      </div>
                    ))}
                    {(e as Workout).status === "Planned" && (
                      <button
                        className="text-button"
                        onClick={() =>
                          put("workouts", {
                            ...e,
                            status: "Completed",
                          } as Workout)
                        }
                      >
                        Mark completed →
                      </button>
                    )}
                  </>
                )}
                {kind === "meals" && (
                  <>
                    {(e as Meal).foods.map((f) => (
                      <div className="exercise-summary" key={f.id}>
                        <strong>{f.name}</strong>
                        <span>
                          {f.quantity} {f.unit} · {f.calories} kcal
                        </span>
                      </div>
                    ))}
                    <div className="macro-line">
                      {totals([e as Meal]).calories} kcal{" "}
                      <span>
                        · {totals([e as Meal]).protein} g protein ·{" "}
                        {totals([e as Meal]).carbs} g carbs ·{" "}
                        {totals([e as Meal]).fat} g fat
                      </span>
                    </div>
                  </>
                )}
                {kind === "trades" &&
                  (() => {
                    const t = e as Trade,
                      p = pnl(t);
                    return (
                      <>
                        <div className="row">
                          <span
                            className={`badge ${t.direction === "Long" ? "green" : "purple"}`}
                          >
                            {t.direction} · {t.market}
                          </span>
                          <strong
                            className={
                              p === null
                                ? "muted"
                                : p >= 0
                                  ? "positive"
                                  : "negative"
                            }
                          >
                            {p === null ? "Open" : money(p, t.currency)}
                          </strong>
                        </div>
                        <div className="exercise-summary">
                          <span>
                            Entry {t.entry} → {t.exit ?? "Open"}
                          </span>
                          <span>
                            Quantity {t.quantity} · Fees {t.fees}
                          </span>
                        </div>
                        {t.reason && (
                          <p className="entry-note">
                            <b>Reason:</b> {t.reason}
                          </p>
                        )}
                        {t.mistakes && (
                          <p className="entry-note">
                            <b>Mistakes:</b> {t.mistakes}
                          </p>
                        )}
                        {t.lessons && (
                          <p className="entry-note">
                            <b>Lesson:</b> {t.lessons}
                          </p>
                        )}
                      </>
                    );
                  })()}
                {kind === "tasks" &&
                  (() => {
                    const t = e as Task;
                    return (
                      <>
                        <div className="tag-row">
                          <span className="badge purple">
                            {
                              db.subjects.find((s) => s.id === t.subjectId)
                                ?.name
                            }
                          </span>
                          <span className="badge">{t.type}</span>
                          <span
                            className={`badge ${t.priority === "High" ? "orange" : ""}`}
                          >
                            {t.priority} priority
                          </span>
                        </div>
                        <label className="status-field">
                          <span>Status</span>
                          <select
                            aria-label={`Status for ${t.title}`}
                            value={t.status}
                            onChange={(ev) =>
                              put("tasks", {
                                ...t,
                                status: ev.target.value,
                              } as Task)
                            }
                          >
                            {["Not started", "In progress", "Completed"].map(
                              (s) => (
                                <option key={s}>{s}</option>
                              ),
                            )}
                          </select>
                        </label>
                      </>
                    );
                  })()}
                {kind === "speech" && (
                  <>
                    <div className="tag-row">
                      <span className="badge green">
                        {(e as Speech).duration} minutes
                      </span>
                      <span className="badge">
                        Difficulty {(e as Speech).difficulty}/5
                      </span>
                    </div>
                    <p className="entry-note">{(e as Speech).exercises}</p>
                    {(e as Speech).observations && (
                      <p className="entry-note">
                        <b>Observation:</b> {(e as Speech).observations}
                      </p>
                    )}
                  </>
                )}
                {"notes" in e && e.notes && (
                  <p className="entry-note">{e.notes}</p>
                )}
                {kind === "events" && "end" in e && (
                  <p className="muted tiny">
                    Ends {dateLabel(e.end)} ·{" "}
                    {localDateTime(e.end).split("T")[1]}
                  </p>
                )}
              </article>
            ))}
        </div>
      ) : (
        <Empty>
          No entries yet. Add your first one to start building your history.
        </Empty>
      )}
      {deleting && (
        <Modal title="Delete this entry?" onClose={() => setDeleting(null)}>
          <p>
            “{deleting.title}” will be removed from your history, dashboard, and
            calendar.
          </p>
          <div className="form-footer">
            <button
              className="button secondary"
              onClick={() => setDeleting(null)}
            >
              Cancel
            </button>
            <button
              className="button danger"
              onClick={() => {
                if (remove(kind, deleting.id)) setDeleting(null);
              }}
            >
              Delete entry
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
