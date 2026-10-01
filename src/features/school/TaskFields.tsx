import { Dispatch, SetStateAction, useState } from "react";
import { FormControls } from "../../components/FormControls";
import { Field } from "../../components/UI";
import { Subject, Task, metadata } from "../../data/models";
export function TaskFields({
  fields: f,
  task,
  subjects,
  setSubjects,
}: {
  fields: FormControls;
  task: Task;
  subjects: Subject[];
  setSubjects: Dispatch<SetStateAction<Subject[]>>;
}) {
  const [newSubject, setNewSubject] = useState("");
  return (
    <>
      <Field label="Subject">
        <select
          required
          value={task.subjectId}
          onChange={(e) => f.patch("subjectId", e.target.value)}
        >
          <option value="">Choose a subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>
      {f.select("Type", "type", ["Homework", "Exam", "Project"])}
      {f.select("Priority", "priority", ["Low", "Medium", "High"])}
      {f.select("Status", "status", [
        "Not started",
        "In progress",
        "Completed",
      ])}
      <Field label="New subject">
        <div className="inline">
          <input
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="e.g. Biology"
          />
          <button
            type="button"
            className="button secondary"
            disabled={!newSubject.trim()}
            onClick={() => {
              const name = newSubject.trim();
              const existing = subjects.find(
                (s) => s.name.toLowerCase() === name.toLowerCase(),
              );
              const s = existing ?? { ...metadata(), name, color: "#8b77d6" };
              if (!existing) setSubjects([...subjects, s]);
              f.patch("subjectId", s.id);
              setNewSubject("");
            }}
          >
            Add
          </button>
        </div>
      </Field>
    </>
  );
}
