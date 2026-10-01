import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Database, Collection } from "../data/models";
import { demo } from "../data/demo";
import { browserStorage, STORAGE_KEY } from "../data/storage";
interface Store {
  db: Database;
  error: string;
  update: (fn: (db: Database) => Database) => boolean;
  put: <K extends Collection>(key: K, record: Database[K][number]) => boolean;
  remove: (key: Collection, id: string) => boolean;
  replace: (db: Database) => boolean;
}
const Context = createContext<Store>(null!);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => {
    try {
      const stored = browserStorage.load();
      return { db: stored ?? demo(), fresh: !stored, error: "" };
    } catch {
      return {
        db: demo(),
        fresh: false,
        error:
          "Saved data could not be loaded. Your original data is preserved. Download the original from Settings, then import a valid backup to resume saving.",
      };
    }
  });
  const [db, setDb] = useState(initial.db),
    [error, setError] = useState(initial.error),
    [recovery, setRecovery] = useState(!!initial.error);
  useEffect(() => {
    if (initial.fresh)
      try {
        browserStorage.save(initial.db);
      } catch {
        setError(
          "Browser storage is unavailable. Changes cannot be saved until storage is available.",
        );
      }
  }, [initial]);
  useEffect(() => {
    const handle = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue)
        try {
          const next = browserStorage.load();
          if (next) {
            setDb(next);
            setError("");
            setRecovery(false);
          }
        } catch {
          setError(
            "Another tab wrote invalid data. Please export your data before importing a backup.",
          );
          setRecovery(true);
        }
    };
    window.addEventListener("storage", handle);
    return () => window.removeEventListener("storage", handle);
  }, []);
  const commit = (next: Database) => {
    try {
      browserStorage.save(next);
      setDb(next);
      setError("");
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? `Could not save: ${err.message}`
          : "Could not save your changes. Export a backup and check browser storage.",
      );
      return false;
    }
  };
  const update = (fn: (db: Database) => Database) => {
    if (recovery) {
      setError(
        initial.error || "Import a valid backup in Settings to restore saving.",
      );
      return false;
    }
    return commit(fn(db));
  };
  const put = <K extends Collection>(key: K, record: Database[K][number]) =>
    update((d) => ({
      ...d,
      [key]: [
        ...d[key].filter((x) => x.id !== record.id),
        { ...record, updatedAt: new Date().toISOString() },
      ],
    }));
  const remove = (key: Collection, id: string) =>
    update((d) => ({ ...d, [key]: d[key].filter((x) => x.id !== id) }));
  const replace = (next: Database) => {
    if (commit(next)) {
      setRecovery(false);
      return true;
    }
    return false;
  };
  return (
    <Context.Provider value={{ db, error, update, put, remove, replace }}>
      {children}
    </Context.Provider>
  );
}
export const useStore = () => useContext(Context);
