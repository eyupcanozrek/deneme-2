import { Database, Meal } from "../../data/models";
export const totals = (meals: Meal[]) =>
  meals
    .flatMap((m) => m.foods)
    .reduce(
      (a, f) => ({
        calories: a.calories + f.calories,
        protein: a.protein + f.protein,
        carbs: a.carbs + f.carbs,
        fat: a.fat + f.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
export const targetFor = (db: Database, date: string) =>
  [...db.targets]
    .filter((t) => t.date <= date)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
