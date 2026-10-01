import { Dispatch, SetStateAction } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Exercise,
  Workout,
  WorkoutExercise,
  metadata,
} from "../../data/models";
import { useStore } from "../../app/Store";
export function WorkoutFields({
  workout: w,
  catalog,
  setCatalog,
  onChange,
}: {
  workout: Workout;
  catalog: Exercise[];
  setCatalog: Dispatch<SetStateAction<Exercise[]>>;
  onChange: (exercises: WorkoutExercise[]) => void;
}) {
  const { db } = useStore();
  const updateExercise = (
    id: string,
    fn: (e: WorkoutExercise) => WorkoutExercise,
  ) =>
    onChange(
      w.exercises.map((e) => {
        if (e.id !== id) return e;
        const next = fn(e),
          now = new Date().toISOString();
        return {
          ...next,
          updatedAt: now,
          sets: next.sets.map((s) =>
            s === e.sets.find((previous) => previous.id === s.id)
              ? s
              : { ...s, updatedAt: now },
          ),
        };
      }),
    );
  return (
    <div className="editor-section">
      <h3>Exercises & sets</h3>
      {w.exercises.map((ex) => {
        const exercise = catalog.find((c) => c.id === ex.exerciseId);
        const previous = [...db.workouts]
          .filter(
            (x) =>
              x.id !== w.id &&
              (x.date < w.date ||
                (x.date === w.date && x.createdAt < w.createdAt)) &&
              x.status === "Completed",
          )
          .sort((a, b) => b.date.localeCompare(a.date))
          .flatMap((x) =>
            x.exercises
              .filter((y) => y.exerciseId === ex.exerciseId)
              .map((y) => ({ date: x.date, sets: y.sets })),
          )[0];
        return (
          <div className="subrecord" key={ex.id}>
            <div className="row">
              <strong>
                {exercise?.name} <small>({exercise?.unit})</small>
              </strong>
              <button
                type="button"
                className="icon-button"
                aria-label="Remove exercise"
                onClick={() =>
                  onChange(w.exercises.filter((x) => x.id !== ex.id))
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
            <p className="muted tiny">
              {previous
                ? `Previous (${previous.date}): ${previous.sets.map((s) => `${s.weight} × ${s.reps}`).join(" · ")}`
                : "First session. Your history starts here."}
            </p>
            <div className="set-head">
              <span>SET</span>
              <span>WEIGHT ({exercise?.unit})</span>
              <span>REPS</span>
              <span />
            </div>
            {ex.sets.map((s, i) => (
              <div className="set-row" key={s.id}>
                <span>{i + 1}</span>
                <input
                  aria-label={`Set ${i + 1} weight`}
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={s.weight}
                  onChange={(e) =>
                    updateExercise(ex.id, (x) => ({
                      ...x,
                      sets: x.sets.map((v) =>
                        v.id === s.id
                          ? { ...v, weight: Number(e.target.value) }
                          : v,
                      ),
                    }))
                  }
                />
                <input
                  aria-label={`Set ${i + 1} reps`}
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={s.reps}
                  onChange={(e) =>
                    updateExercise(ex.id, (x) => ({
                      ...x,
                      sets: x.sets.map((v) =>
                        v.id === s.id
                          ? { ...v, reps: Number(e.target.value) }
                          : v,
                      ),
                    }))
                  }
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Remove set"
                  disabled={ex.sets.length === 1}
                  onClick={() =>
                    updateExercise(ex.id, (x) => ({
                      ...x,
                      sets: x.sets.filter((v) => v.id !== s.id),
                    }))
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-button"
              onClick={() =>
                updateExercise(ex.id, (x) => ({
                  ...x,
                  sets: [
                    ...x.sets,
                    {
                      ...metadata(),
                      weight: x.sets.at(-1)?.weight ?? 0,
                      reps: 10,
                    },
                  ],
                }))
              }
            >
              <Plus size={14} /> Add set
            </button>
          </div>
        );
      })}
      <div className="inline">
        <select aria-label="Select exercise" id="exercise-choice">
          <option value="">Choose an exercise</option>
          {catalog.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name} ({x.unit})
            </option>
          ))}
        </select>
        <button
          type="button"
          className="button secondary"
          onClick={() => {
            const id = (
              document.getElementById("exercise-choice") as HTMLSelectElement
            ).value;
            if (id)
              onChange([
                ...w.exercises,
                {
                  ...metadata(),
                  exerciseId: id,
                  sets: [{ ...metadata(), weight: 0, reps: 10 }],
                },
              ]);
          }}
        >
          Add exercise
        </button>
      </div>
      <div className="inline top-gap">
        <input
          id="new-exercise"
          placeholder="Or create an exercise"
          aria-label="New exercise name"
        />
        <button
          type="button"
          className="button secondary"
          onClick={() => {
            const input = document.getElementById(
              "new-exercise",
            ) as HTMLInputElement;
            const name = input.value.trim();
            if (name) {
              const x = catalog.find(
                (x) => x.name.toLowerCase() === name.toLowerCase(),
              ) ?? {
                ...metadata(),
                name,
                category: "General",
                unit: db.settings.weightUnit,
              };
              if (!catalog.some((y) => y.id === x.id))
                setCatalog([...catalog, x]);
              onChange([
                ...w.exercises,
                {
                  ...metadata(),
                  exerciseId: x.id,
                  sets: [{ ...metadata(), weight: 0, reps: 10 }],
                },
              ]);
              input.value = "";
            }
          }}
        >
          Create & add
        </button>
      </div>
    </div>
  );
}
