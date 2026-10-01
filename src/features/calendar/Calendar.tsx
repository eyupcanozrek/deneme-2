import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "../../app/Store";
import { useEditor } from "../../app/Editor";
import { AddButton, Card, Empty, PageHeader } from "../../components/UI";
import { day, dateLabel } from "../../lib/dates";
import { calendarItems } from "./events";
import { EntryList } from "../../components/EntryList";
export default function Calendar() {
  const { db } = useStore(),
    open = useEditor(),
    [month, setMonth] = useState(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    ),
    [selected, setSelected] = useState(day());
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const dates = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  const items = calendarItems(db),
    selectedItems = items.filter((i) => i.date === selected);
  return (
    <>
      <PageHeader
        eyebrow="YOUR TIME, IN ONE PLACE"
        title="See the bigger picture."
        description="Make space for what matters. A shared calendar for your everyday."
        action={
          <AddButton onClick={() => open("events", undefined, selected)}>
            Add event
          </AddButton>
        }
      />
      <div className="calendar-layout">
        <Card>
          <div className="calendar-toolbar">
            <h2>
              {month.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div className="inline">
              <button
                className="icon-button"
                aria-label="Previous month"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() - 1, 1),
                  )
                }
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="button secondary"
                onClick={() => {
                  setMonth(
                    new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      1,
                    ),
                  );
                  setSelected(day());
                }}
              >
                Today
              </button>
              <button
                className="icon-button"
                aria-label="Next month"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() + 1, 1),
                  )
                }
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="calendar-grid">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="calendar-weekday">
                {d}
              </div>
            ))}
            {dates.map((d) => {
              const key = day(d),
                events = items.filter((i) => i.date === key);
              return (
                <button
                  aria-label={`Select ${key}`}
                  key={key}
                  className={`calendar-day ${d.getMonth() !== month.getMonth() ? "outside" : ""} ${key === selected ? "selected" : ""} ${key === day() ? "today" : ""}`}
                  onClick={() => setSelected(key)}
                >
                  <span>{d.getDate()}</span>
                  <div className="calendar-events">
                    {events.slice(0, 2).map((i) => (
                      <span className={`calendar-event ${i.kind}`} key={i.id}>
                        {i.title}
                      </span>
                    ))}
                    {events.length > 2 && (
                      <small>+{events.length - 2} more</small>
                    )}
                  </div>
                  <div className="calendar-dots">
                    {events.slice(0, 4).map((i) => (
                      <i key={i.id} className={i.kind} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="calendar-legend">
            <span>
              <i className="workouts" />
              Workout
            </span>
            <span>
              <i className="tasks" />
              School
            </span>
            <span>
              <i className="speech" />
              Practice
            </span>
            <span>
              <i className="events" />
              Personal
            </span>
          </div>
        </Card>
        <Card title={dateLabel(selected)}>
          <div className="day-agenda">
            {selectedItems.length ? (
              selectedItems.map((i) => (
                <button
                  key={i.id}
                  className="agenda-item"
                  onClick={() => open(i.kind, i.entry)}
                >
                  <i className={i.kind} />
                  <div>
                    <strong>{i.title}</strong>
                    <span>
                      {i.kind === "tasks"
                        ? "School deadline"
                        : i.kind === "speech"
                          ? "Speech practice"
                          : i.kind === "workouts"
                            ? "Workout"
                            : "Personal event"}
                    </span>
                  </div>
                  <ChevronRight size={16} />
                </button>
              ))
            ) : (
              <Empty>A little breathing room. Nothing scheduled.</Empty>
            )}
          </div>
          <button
            className="button secondary full"
            onClick={() => open("events", undefined, selected)}
          >
            + Add personal event
          </button>
        </Card>
      </div>
      <div className="section-heading">
        <h2>Personal events</h2>
      </div>
      <EntryList kind="events" entries={db.events} />
    </>
  );
}
