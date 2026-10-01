import { createContext, ReactNode, useContext, useState } from "react";
import { Entry, EntryKind } from "../data/models";
import { EntryEditor } from "../components/EntryEditor";
const Context = createContext<
  (kind: EntryKind, entry?: Entry, date?: string) => void
>(() => {});
export function EditorProvider({ children }: { children: ReactNode }) {
  const [editor, setEditor] = useState<{
    kind: EntryKind;
    entry?: Entry;
    date?: string;
  } | null>(null);
  return (
    <Context.Provider
      value={(kind, entry, date) => setEditor({ kind, entry, date })}
    >
      {children}
      {editor && (
        <EntryEditor
          key={editor.entry?.id ?? editor.kind}
          {...editor}
          onClose={() => setEditor(null)}
        />
      )}
    </Context.Provider>
  );
}
export const useEditor = () => useContext(Context);
