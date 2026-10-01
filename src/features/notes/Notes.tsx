import { useStore } from "../../app/Store";
import { useEditor } from "../../app/Editor";
import { AddButton, PageHeader } from "../../components/UI";
import { EntryList } from "../../components/EntryList";
export default function Notes() {
  const { db } = useStore(),
    open = useEditor();
  return (
    <>
      <PageHeader
        eyebrow="PERSONAL / NOTES"
        title="A place for your thoughts."
        description="Ideas, reminders, and everything you want to come back to."
        action={<AddButton onClick={() => open("notes")}>Add note</AddButton>}
      />
      <EntryList kind="notes" entries={db.notes} />
    </>
  );
}
