import { useState } from "react";
import { Download, Upload, Check, ShieldCheck } from "lucide-react";
import { useStore } from "../../app/Store";
import { Card, Field, Modal, PageHeader } from "../../components/UI";
import { Database } from "../../data/models";
import { STORAGE_KEY, validateDatabase } from "../../data/storage";
export default function Settings() {
  const { db, update, replace } = useStore(),
    [settings, setSettings] = useState(db.settings),
    [message, setMessage] = useState(""),
    [pending, setPending] = useState<Database | null>(null);
  function download(raw: string, filename: string) {
    const url = URL.createObjectURL(
      new Blob([raw], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <PageHeader
        eyebrow="MAKE IT YOURS"
        title="Your space, your way."
        description="A few preferences, and a safe place to manage your data."
      />
      <div className="settings-grid">
        <Card title="Personal preferences">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              try {
                new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: settings.currency,
                });
                if (update((d) => ({ ...d, settings })))
                  setMessage("Preferences saved.");
              } catch {
                setMessage("Enter a valid three-letter currency code.");
              }
            }}
          >
            <Field label="Display name">
              <input
                required
                maxLength={40}
                value={settings.name}
                onChange={(e) =>
                  setSettings({ ...settings, name: e.target.value })
                }
              />
            </Field>
            <Field label="Appearance">
              <select
                value={settings.theme}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    theme: e.target.value as "light" | "dark",
                  })
                }
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </Field>
            <Field label="Default weight unit for new exercises">
              <select
                value={settings.weightUnit}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    weightUnit: e.target.value as "kg" | "lb",
                  })
                }
              >
                <option>kg</option>
                <option>lb</option>
              </select>
            </Field>
            <Field label="Default trade currency">
              <input
                pattern="[A-Z]{3}"
                required
                value={settings.currency}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    currency: e.target.value.toUpperCase(),
                  })
                }
              />
            </Field>
            <button className="button primary">
              <Check size={16} /> Save preferences
            </button>
          </form>
        </Card>
        <div>
          <Card title="Your data stays with you">
            <ShieldCheck size={28} className="green-text" />
            <p className="muted">
              Records are stored in this browser on this device. Clearing
              browser data removes them. Export a backup regularly to keep a
              copy.
            </p>
            <div className="backup-actions">
              <button
                className="button secondary"
                onClick={() =>
                  download(
                    JSON.stringify(db, null, 2),
                    `lifeos-backup-${new Date().toISOString().slice(0, 10)}.json`,
                  )
                }
              >
                <Download size={17} /> Export backup
              </button>
              <label className="button secondary upload-button">
                <Upload size={17} /> Import backup
                <input
                  aria-label="Import backup"
                  type="file"
                  accept="application/json,.json"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      setPending(validateDatabase(JSON.parse(await f.text())));
                      setMessage("");
                    } catch (err) {
                      setMessage(
                        err instanceof Error
                          ? err.message
                          : "Invalid backup file.",
                      );
                    }
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <button
              className="text-button"
              onClick={() => {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) download(raw, "lifeos-original-storage.json");
                else setMessage("No original storage has been saved yet.");
              }}
            >
              Download original stored data
            </button>
          </Card>
          <Card title="Built to grow">
            <p className="muted">
              LifeOS · Version 1.0
              <br />
              Data schema · Version {db.schemaVersion}
            </p>
            <p className="muted">
              Your personal dashboard for a little more intention, every day.
            </p>
          </Card>
        </div>
      </div>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {pending && (
        <Modal title="Replace your data?" onClose={() => setPending(null)}>
          <p>
            This backup will replace your current records and preferences.
            Export your current data first if you want to keep it.
          </p>
          <div className="form-footer">
            <button
              className="button secondary"
              onClick={() => setPending(null)}
            >
              Cancel
            </button>
            <button
              className="button primary"
              onClick={() => {
                if (replace(pending)) {
                  setSettings(pending.settings);
                  setPending(null);
                  setMessage("Backup imported.");
                }
              }}
            >
              Replace with backup
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
