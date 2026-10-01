import { useState } from "react";
import { Dumbbell, CheckCheck, Layers } from "lucide-react";
import { useStore } from "../../app/Store";
import { useEditor } from "../../app/Editor";
import { AddButton, Card, PageHeader } from "../../components/UI";
import { EntryList } from "../../components/EntryList";
export default function Fitness() {
  const { db } = useStore(),
    open = useEditor(),
    [filter, setFilter] = useState("All"),
    [exercise, setExercise] = useState("");
  return (
    <>
      <PageHeader
        eyebrow="LIFE / FITNESS"
        title="Build your stronger self."
        description="One rep, one session, one small win at a time."
        action={
          <AddButton onClick={() => open("workouts")}>Add workout</AddButton>
        }
      />
      <div className="stat-grid three">
        <Card>
          <Dumbbell className="stat-icon" />
          <span className="stat-label">Total sessions</span>
          <strong className="stat-value">{db.workouts.length}</strong>
        </Card>
        <Card>
          <CheckCheck className="stat-icon purple-text" />
          <span className="stat-label">Completed</span>
          <strong className="stat-value">
            {db.workouts.filter((w) => w.status === "Completed").length}
          </strong>
        </Card>
        <Card>
          <Layers className="stat-icon orange-text" />
          <span className="stat-label">Sets recorded</span>
          <strong className="stat-value">
            {db.workouts.reduce(
              (a, w) => a + w.exercises.reduce((b, e) => b + e.sets.length, 0),
              0,
            )}
          </strong>
        </Card>
      </div>
      <div className="section-heading">
        <h2>Workout history</h2>
        <div className="inline filters">
          <select
            aria-label="Filter by exercise"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
          >
            <option value="">All exercises</option>
            {db.exercises.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <div className="segmented">
            {["All", "Planned", "Completed"].map((s) => (
              <button
                key={s}
                className={filter === s ? "active" : ""}
                onClick={() => setFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <EntryList
        kind="workouts"
        entries={db.workouts.filter(
          (w) =>
            (filter === "All" || w.status === filter) &&
            (!exercise || w.exercises.some((e) => e.exerciseId === exercise)),
        )}
      />
    </>
  );
}
