import { useStore } from "../../app/Store";
import { useEditor } from "../../app/Editor";
import { AddButton, Card, PageHeader } from "../../components/UI";
import { EntryList } from "../../components/EntryList";
export default function Speech() {
  const { db } = useStore(),
    open = useEditor();
  return (
    <>
      <PageHeader
        eyebrow="PERSONAL / SPEECH JOURNAL"
        title="Find your own rhythm."
        description="A private space for practice, reflection, and small steps forward."
        action={
          <AddButton onClick={() => open("speech")}>Log practice</AddButton>
        }
      />
      <div className="stat-grid three">
        <Card>
          <span className="stat-label">Practice entries</span>
          <strong className="stat-value">{db.speech.length}</strong>
        </Card>
        <Card>
          <span className="stat-label">Minutes practiced</span>
          <strong className="stat-value">
            {db.speech.reduce((a, s) => a + s.duration, 0)}
          </strong>
        </Card>
        <Card>
          <span className="stat-label">Your space</span>
          <p className="muted">Personal observations, at your pace.</p>
        </Card>
      </div>
      <div className="section-heading">
        <h2>Practice history</h2>
      </div>
      <EntryList kind="speech" entries={db.speech} />
    </>
  );
}
