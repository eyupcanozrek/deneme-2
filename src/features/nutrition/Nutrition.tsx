import { useState } from "react";
import { Droplets, Plus, Trash2 } from "lucide-react";
import { useStore } from "../../app/Store";
import { useEditor } from "../../app/Editor";
import {
  AddButton,
  Card,
  Field,
  Modal,
  PageHeader,
  Progress,
} from "../../components/UI";
import { EntryList } from "../../components/EntryList";
import { day } from "../../lib/dates";
import { targetFor, totals } from "../nutrition/calculations";
import { metadata, Targets } from "../../data/models";
export default function Nutrition() {
  const { db, put, remove } = useStore(),
    open = useEditor(),
    [date, setDate] = useState(day()),
    [editing, setEditing] = useState<Targets | null>(null),
    [water, setWater] = useState(250);
  const meals = db.meals.filter((m) => m.date === date),
    total = totals(meals),
    target = targetFor(db, date),
    amount = db.water
      .filter((w) => w.date === date)
      .reduce((a, w) => a + w.amount, 0);
  return (
    <>
      <PageHeader
        eyebrow="LIFE / NUTRITION"
        title="Fuel your everyday."
        description="Keep your meals, macros, and hydration in balance."
        action={
          <AddButton onClick={() => open("meals", undefined, date)}>
            Add meal
          </AddButton>
        }
      />
      <div className="section-heading">
        <label className="inline">
          <span className="muted">Your day</span>
          <input
            aria-label="Nutrition date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <button
          className="button secondary"
          onClick={() =>
            setEditing({
              ...target,
              ...(target?.date === date ? target : metadata()),
              date,
              calories: target?.calories ?? 2500,
              protein: target?.protein ?? 140,
              carbs: target?.carbs ?? 300,
              fat: target?.fat ?? 75,
              water: target?.water ?? 2500,
            })
          }
        >
          Edit targets
        </button>
      </div>
      <div className="stat-grid four">
        {(["calories", "protein", "carbs", "fat"] as const).map((key, i) => (
          <Card key={key}>
            <span className="stat-label">
              {key === "calories"
                ? "Calories"
                : key === "carbs"
                  ? "Carbohydrates"
                  : key[0].toUpperCase() + key.slice(1)}
            </span>
            <strong className="stat-value">
              {Math.round(total[key])}
              <small>
                {" "}
                / {target?.[key] ?? "—"} {key === "calories" ? "kcal" : "g"}
              </small>
            </strong>
            <Progress
              value={total[key]}
              max={target?.[key] ?? 0}
              color={["#699e75", "#8b77d6", "#d8a05a", "#679bb6"][i]}
            />
          </Card>
        ))}
      </div>
      <Card title="A little hydration goes a long way" className="water-card">
        <div className="water-summary">
          <Droplets size={34} />
          <div>
            <strong>
              {(amount / 1000).toFixed(2)} L{" "}
              <span className="muted">
                / {((target?.water ?? 2500) / 1000).toFixed(1)} L
              </span>
            </strong>
            <p className="muted tiny">Keep a glass nearby. Every sip counts.</p>
          </div>
          <div className="inline">
            <input
              aria-label="Water amount in milliliters"
              type="number"
              min="1"
              value={water}
              onChange={(e) => setWater(Number(e.target.value))}
            />
            <button
              className="button secondary"
              disabled={water <= 0}
              onClick={() =>
                put("water", { ...metadata(), date, amount: water })
              }
            >
              <Plus size={16} /> {water} ml
            </button>
          </div>
        </div>
        <Progress value={amount} max={target?.water ?? 2500} color="#6d9db4" />
        <div className="water-logs">
          {db.water
            .filter((w) => w.date === date)
            .map((w) => (
              <span key={w.id}>
                {w.amount} ml{" "}
                <button
                  aria-label={`Delete water ${w.amount} ml`}
                  onClick={() => remove("water", w.id)}
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
        </div>
      </Card>
      <div className="section-heading">
        <h2>Meals for the day</h2>
        <span className="muted tiny">{meals.length} meals logged</span>
      </div>
      <EntryList kind="meals" entries={meals} />
      {editing && (
        <Modal title="Daily nutrition targets" onClose={() => setEditing(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (put("targets", editing)) setEditing(null);
            }}
          >
            <p className="muted">
              Effective from {date}. Earlier days keep their previous targets.
            </p>
            <div className="form-grid">
              {(["calories", "protein", "carbs", "fat", "water"] as const).map(
                (key) => (
                  <Field
                    key={key}
                    label={`${key} (${key === "calories" ? "kcal" : key === "water" ? "ml" : "g"})`}
                  >
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={editing[key]}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          [key]: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                ),
              )}
            </div>
            <div className="form-footer">
              <button className="button primary">Save targets</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
