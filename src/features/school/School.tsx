import { useState } from "react";
import { useStore } from "../../app/Store";
import { useEditor } from "../../app/Editor";
import { AddButton, Card, PageHeader } from "../../components/UI";
import { EntryList } from "../../components/EntryList";
import { day } from "../../lib/dates";
export default function School() {
  const { db } = useStore(),
    open = useEditor(),
    [subject, setSubject] = useState(""),
    [status, setStatus] = useState("All");
  return (
    <>
      <PageHeader
        eyebrow="PERFORMANCE / SCHOOL"
        title="Make room for focus."
        description="Your subjects, deadlines, and next steps. All in one place."
        action={
          <AddButton onClick={() => open("tasks")}>Add school task</AddButton>
        }
      />
      <div className="stat-grid three">
        <Card>
          <span className="stat-label">Tasks remaining</span>
          <strong className="stat-value">
            {db.tasks.filter((t) => t.status !== "Completed").length}
          </strong>
        </Card>
        <Card>
          <span className="stat-label">Upcoming exams</span>
          <strong className="stat-value">
            {
              db.tasks.filter(
                (t) =>
                  t.type === "Exam" &&
                  t.date >= day() &&
                  t.status !== "Completed",
              ).length
            }
          </strong>
        </Card>
        <Card>
          <span className="stat-label">Subjects</span>
          <strong className="stat-value">{db.subjects.length}</strong>
        </Card>
      </div>
      <div className="section-heading">
        <h2>Assignments & deadlines</h2>
        <div className="inline filters">
          <select
            aria-label="Filter by subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">All subjects</option>
            {db.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {["All", "Not started", "In progress", "Completed"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <EntryList
        kind="tasks"
        entries={db.tasks.filter(
          (t) =>
            (!subject || t.subjectId === subject) &&
            (status === "All" || t.status === status),
        )}
      />
    </>
  );
}
