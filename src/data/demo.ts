import { Database, metadata as m } from "./models";
import { relativeDay as d, timestamp } from "../lib/dates";
export function demo(): Database {
  const leg = m(),
    bench = m(),
    math = m(),
    design = m(),
    physics = m();
  return {
    schemaVersion: 1,
    settings: {
      name: "Alex",
      theme: "light",
      currency: "USD",
      weightUnit: "kg",
    },
    exercises: [
      { ...leg, name: "Leg Press", category: "Legs", unit: "kg" },
      { ...bench, name: "Bench Press", category: "Push", unit: "kg" },
    ],
    workouts: [
      {
        ...m(),
        date: d(0),
        title: "Push Day",
        status: "Planned",
        notes: "Keep it controlled. Focus on form.",
        exercises: [
          {
            ...m(),
            exerciseId: bench.id,
            sets: [
              { ...m(), weight: 40, reps: 12 },
              { ...m(), weight: 50, reps: 10 },
            ],
          },
        ],
      },
      {
        ...m(),
        date: d(-2),
        title: "Leg Day",
        status: "Completed",
        notes: "Feeling stronger this week.",
        exercises: [
          {
            ...m(),
            exerciseId: leg.id,
            sets: [
              { ...m(), weight: 30, reps: 12 },
              { ...m(), weight: 50, reps: 9 },
              { ...m(), weight: 60, reps: 8 },
              { ...m(), weight: 60, reps: 8 },
            ],
          },
        ],
      },
    ],
    meals: [
      {
        ...m(),
        date: d(0),
        title: "Breakfast",
        foods: [
          {
            ...m(),
            name: "Oats, yogurt & berries",
            quantity: 1,
            unit: "bowl",
            calories: 450,
            protein: 30,
            carbs: 60,
            fat: 10,
          },
        ],
      },
      {
        ...m(),
        date: d(0),
        title: "Lunch",
        foods: [
          {
            ...m(),
            name: "Chicken & rice bowl",
            quantity: 1,
            unit: "serving",
            calories: 620,
            protein: 48,
            carbs: 70,
            fat: 16,
          },
        ],
      },
    ],
    water: [{ ...m(), date: d(0), amount: 1000 }],
    targets: [
      {
        ...m(),
        date: d(-30),
        calories: 2500,
        protein: 140,
        carbs: 300,
        fat: 75,
        water: 2500,
      },
    ],
    subjects: [
      { ...math, name: "Mathematics", color: "#8b77d6" },
      { ...design, name: "Design", color: "#dc9c56" },
      { ...physics, name: "Physics", color: "#5e9fc3" },
    ],
    tasks: [
      {
        ...m(),
        date: d(1),
        title: "Finish calculus problem set",
        subjectId: math.id,
        type: "Homework",
        priority: "High",
        status: "In progress",
        notes: "Chapter 4, exercises 1–12.",
      },
      {
        ...m(),
        date: d(3),
        title: "Submit portfolio concept",
        subjectId: design.id,
        type: "Project",
        priority: "Medium",
        status: "Not started",
        notes: "",
      },
      {
        ...m(),
        date: d(6),
        title: "Mathematics midterm",
        subjectId: math.id,
        type: "Exam",
        priority: "High",
        status: "Not started",
        notes: "Review derivatives and integration.",
      },
    ],
    trades: [
      {
        ...m(),
        date: timestamp(d(0) + "T09:30"),
        title: "BTC/USD",
        market: "Crypto",
        direction: "Long",
        entry: 62000,
        exit: 62750,
        quantity: 0.1,
        fees: 5,
        currency: "USD",
        reason: "Support retest",
        notes: "Waited for confirmation.",
        mistakes: "",
        lessons: "Patience improves entries.",
      },
      {
        ...m(),
        date: timestamp(d(-1) + "T14:00"),
        title: "AAPL",
        market: "Stocks",
        direction: "Short",
        entry: 225,
        exit: 223,
        quantity: 10,
        fees: 1,
        currency: "USD",
        reason: "Resistance rejection",
        notes: "",
        mistakes: "",
        lessons: "",
      },
    ],
    speech: [
      {
        ...m(),
        date: d(-1),
        title: "Slow & steady",
        exercises: "Breathing, reading aloud",
        duration: 15,
        difficulty: 3,
        notes: "Practiced with a short article.",
        observations: "More comfortable slowing down.",
      },
    ],
    notes: [
      {
        ...m(),
        date: d(0),
        title: "A little more intentional",
        notes: "Small steps, taken consistently. Make room for what matters.",
      },
    ],
    events: [
      {
        ...m(),
        date: timestamp(d(2) + "T16:00"),
        end: timestamp(d(2) + "T17:00"),
        title: "Weekly reset",
        notes: "Review the week and plan ahead.",
      },
    ],
  };
}
