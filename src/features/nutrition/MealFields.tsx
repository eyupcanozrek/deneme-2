import { Plus, Trash2 } from "lucide-react";
import { Meal, Food, metadata } from "../../data/models";
import { Field } from "../../components/UI";
export function MealFields({
  meal: m,
  onChange,
}: {
  meal: Meal;
  onChange: (foods: Food[]) => void;
}) {
  const updateFood = (id: string, key: string, value: string | number) =>
    onChange(
      m.foods.map((f) =>
        f.id === id
          ? { ...f, [key]: value, updatedAt: new Date().toISOString() }
          : f,
      ),
    );
  return (
    <div className="editor-section">
      <h3>Foods</h3>
      <p className="muted tiny">
        Enter nutrition for the full quantity below, from a label or your own
        estimate.
      </p>
      {m.foods.map((f) => (
        <div className="subrecord" key={f.id}>
          <div className="row">
            <strong>Food {m.foods.indexOf(f) + 1}</strong>
            <button
              type="button"
              className="icon-button"
              aria-label="Remove food"
              onClick={() => onChange(m.foods.filter((x) => x.id !== f.id))}
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="form-grid">
            <Field label="Food name">
              <input
                required
                value={f.name}
                onChange={(e) => updateFood(f.id, "name", e.target.value)}
              />
            </Field>
            <Field label="Quantity">
              <input
                required
                type="number"
                min="0.01"
                step="any"
                value={f.quantity}
                onChange={(e) =>
                  updateFood(f.id, "quantity", Number(e.target.value))
                }
              />
            </Field>
            <Field label="Unit">
              <input
                required
                value={f.unit}
                onChange={(e) => updateFood(f.id, "unit", e.target.value)}
              />
            </Field>
            {(["calories", "protein", "carbs", "fat"] as (keyof Food)[]).map(
              (key) => (
                <Field
                  key={key}
                  label={key === "calories" ? "Calories (kcal)" : `${key} (g)`}
                >
                  <input
                    required
                    type="number"
                    min="0"
                    step="any"
                    value={Number(f[key])}
                    onChange={(e) =>
                      updateFood(f.id, key, Number(e.target.value))
                    }
                  />
                </Field>
              ),
            )}
          </div>
        </div>
      ))}
      <button
        type="button"
        className="button secondary"
        onClick={() =>
          onChange([
            ...m.foods,
            {
              ...metadata(),
              name: "",
              quantity: 1,
              unit: "serving",
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
            },
          ])
        }
      >
        <Plus size={16} /> Add food
      </button>
    </div>
  );
}
