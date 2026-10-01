import { describe, expect, it } from "vitest";
import { demo } from "../../src/data/demo";
import { validateDatabase } from "../../src/data/storage";
import { pnl } from "../../src/features/trading/calculations";
import { targetFor, totals } from "../../src/features/nutrition/calculations";
import { calendarItems } from "../../src/features/calendar/events";
import { relativeDay } from "../../src/lib/dates";
describe("data integrity and calculations", () => {
  it("accepts the demo and rejects invalid versions, relations, dates and numbers", () => {
    expect(validateDatabase(demo()).schemaVersion).toBe(1);
    for (const mutate of [
      (d: any) => (d.schemaVersion = 2),
      (d: any) => (d.tasks[0].subjectId = "missing"),
      (d: any) => (d.meals[0].foods[0].calories = -10),
      (d: any) => (d.workouts[0].exercises[0].sets[0].reps = 1.2),
      (d: any) => (d.speech[0].date = "2026-02-31"),
      (d: any) => (d.trades[0].quantity = NaN),
      (d: any) => (d.speech[0].difficulty = 6),
    ]) {
      const d = demo();
      mutate(d);
      expect(() => validateDatabase(d)).toThrow();
    }
  });
  it("calculates realized long/short P&L including fees and leaves open trades unrealized", () => {
    const t = demo().trades[0];
    expect(
      pnl({
        ...t,
        entry: 100,
        exit: 110,
        quantity: 2,
        fees: 1,
        direction: "Long",
      }),
    ).toBe(19);
    expect(
      pnl({
        ...t,
        entry: 100,
        exit: 90,
        quantity: 2,
        fees: 1,
        direction: "Short",
      }),
    ).toBe(19);
    expect(pnl({ ...t, exit: null })).toBeNull();
  });
  it("adds nutrition for recorded quantities and selects effective targets", () => {
    const d = demo();
    expect(totals(d.meals)).toEqual({
      calories: 1070,
      protein: 78,
      carbs: 130,
      fat: 26,
    });
    d.targets.push({
      ...d.targets[0],
      id: "future",
      date: relativeDay(2),
      calories: 3000,
    });
    expect(targetFor(d, relativeDay(0))?.calories).toBe(2500);
    expect(targetFor(d, relativeDay(3))?.calories).toBe(3000);
  });
  it("derives calendar entries from source data without copying records", () => {
    const d = demo();
    expect(calendarItems(d).length).toBe(
      d.workouts.length + d.tasks.length + d.speech.length + d.events.length,
    );
    d.workouts = [];
    expect(calendarItems(d).filter((i) => i.kind === "workouts")).toHaveLength(
      0,
    );
  });
});

it("rejects incomplete nested records and naive timestamps", () => {
  const d = demo();
  d.workouts[0].exercises[0].sets = [];
  expect(() => validateDatabase(d)).toThrow();
  const t = demo();
  t.trades[0].date = "2026-10-01T09:30";
  expect(() => validateDatabase(t)).toThrow();
});
