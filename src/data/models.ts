export interface Entity {
  id: string;
  createdAt: string;
  updatedAt: string;
}
export interface Exercise extends Entity {
  name: string;
  category: string;
  unit: "kg" | "lb";
}
export interface WorkoutSet extends Entity {
  reps: number;
  weight: number;
}
export interface WorkoutExercise extends Entity {
  exerciseId: string;
  sets: WorkoutSet[];
}
export interface Workout extends Entity {
  date: string;
  title: string;
  status: "Planned" | "Completed";
  notes: string;
  exercises: WorkoutExercise[];
}
export interface Food extends Entity {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
export interface Meal extends Entity {
  date: string;
  title: string;
  foods: Food[];
}
export interface Water extends Entity {
  date: string;
  amount: number;
}
export interface Targets extends Entity {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}
export interface Trade extends Entity {
  date: string;
  title: string;
  market: string;
  direction: "Long" | "Short";
  entry: number;
  exit: number | null;
  quantity: number;
  fees: number;
  currency: string;
  reason: string;
  notes: string;
  mistakes: string;
  lessons: string;
}
export interface Subject extends Entity {
  name: string;
  color: string;
}
export interface Task extends Entity {
  date: string;
  title: string;
  subjectId: string;
  type: "Homework" | "Exam" | "Project";
  priority: "Low" | "Medium" | "High";
  status: "Not started" | "In progress" | "Completed";
  notes: string;
}
export interface Speech extends Entity {
  date: string;
  title: string;
  exercises: string;
  duration: number;
  difficulty: number;
  notes: string;
  observations: string;
}
export interface Note extends Entity {
  date: string;
  title: string;
  notes: string;
}
export interface PersonalEvent extends Entity {
  date: string;
  end: string;
  title: string;
  notes: string;
}
export interface Settings {
  name: string;
  theme: "light" | "dark";
  currency: string;
  weightUnit: "kg" | "lb";
}
export interface Database {
  schemaVersion: 1;
  exercises: Exercise[];
  workouts: Workout[];
  meals: Meal[];
  water: Water[];
  targets: Targets[];
  trades: Trade[];
  subjects: Subject[];
  tasks: Task[];
  speech: Speech[];
  notes: Note[];
  events: PersonalEvent[];
  settings: Settings;
}
export type Collection = Exclude<keyof Database, "schemaVersion" | "settings">;
export type EntryKind =
  "workouts" | "meals" | "trades" | "tasks" | "speech" | "notes" | "events";
export type Entry =
  Workout | Meal | Trade | Task | Speech | Note | PersonalEvent;
export const metadata = (): Entity => {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), createdAt: now, updatedAt: now };
};
