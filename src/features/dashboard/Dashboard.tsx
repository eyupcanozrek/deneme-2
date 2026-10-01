import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Dumbbell,
  Flame,
  GraduationCap,
  Mic,
  TrendingUp,
  Utensils,
  Plus,
  Check,
  Droplets,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { useStore } from "../../app/Store";
import { useEditor } from "../../app/Editor";
import { Card, Empty, Progress } from "../../components/UI";
import { day, dateLabel, entryDay } from "../../lib/dates";
import { targetFor, totals } from "../nutrition/calculations";
import { calendarItems } from "../calendar/events";
import { EntryKind, Task } from "../../data/models";
export default function Dashboard() {
  const { db, put } = useStore(),
    open = useEditor(),
    today = day(),
    nutrition = totals(db.meals.filter((m) => m.date === today)),
    target = targetFor(db, today),
    workout = db.workouts.find((w) => w.date === today),
    tasks = db.tasks
      .filter((t) => t.status !== "Completed")
      .sort((a, b) => a.date.localeCompare(b.date)),
    practice = db.speech.filter((s) => s.date === today),
    trades = db.trades.filter((t) => entryDay(t.date) === today),
    water = db.water
      .filter((w) => w.date === today)
      .reduce((a, w) => a + w.amount, 0),
    events = calendarItems(db)
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4),
    exam = tasks.find((t) => t.type === "Exam" && t.date >= today),
    hour = new Date().getHours();
  const quick: [EntryKind, typeof Dumbbell, string, string][] = [
    ["workouts", Dumbbell, "Workout", "green"],
    ["meals", Utensils, "Meal", "orange"],
    ["trades", TrendingUp, "Trade", "blue"],
    ["tasks", GraduationCap, "School task", "purple"],
    ["speech", Mic, "Practice", "pink"],
  ];
  return (
    <>
      <header className="page-header dashboard-heading">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> YOUR EVERYDAY, A LITTLE MORE
            INTENTIONAL
          </div>
          <h1>
            Good {hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"},{" "}
            {db.settings.name}
            <span className="greeting-dot">.</span>
          </h1>
          <p>Here’s your day at a glance. Let’s make it a good one.</p>
        </div>
        <div className="date-pill">
          <CalendarDays size={16} />
          {new Date().toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </header>
      <section className="welcome-banner">
        <div className="banner-copy">
          <span className="eyebrow">SMALL STEPS. REAL PROGRESS.</span>
          <h2>
            A little better,
            <br />
            every day.
          </h2>
          <p>
            Your goals don’t need a perfect day.
            <br />
            Just a little intention.
          </p>
          <Link className="banner-link" to="/calendar">
            Make a plan for today <ArrowRight size={16} />
          </Link>
        </div>
        <div className="banner-art" aria-hidden="true">
          <div className="art-grid" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="art-circle" />
          <div className="art-leaf leaf-one" />
          <div className="art-leaf leaf-two" />
          <div className="art-leaf leaf-three" />
          <span className="floating-label label-one">
            <Check size={14} /> A little progress
          </span>
          <span className="floating-label label-two">
            <Sparkles size={14} /> A little balance
          </span>
          <div className="art-star">✳</div>
        </div>
      </section>
      <div className="section-heading">
        <h2>
          Today’s overview <span className="count-pill">6 areas</span>
        </h2>
        <span className="muted tiny">A snapshot of what matters</span>
      </div>
      <div className="overview-grid">
        <Link className="overview-card" to="/fitness">
          <div className="overview-top">
            <span className="module-icon green">
              <Dumbbell size={20} />
            </span>
            <ArrowUpRight size={16} />
          </div>
          <span className="overview-label">Workout</span>
          <h3>{workout?.title ?? "Rest & recharge"}</h3>
          <div className="overview-bottom">
            <span
              className={`status-dot ${workout?.status === "Completed" ? "done" : ""}`}
            />
            {workout?.status ?? "No workout planned"}
            {workout && (
              <span className="right-label">
                {workout.exercises.length} exercises
              </span>
            )}
          </div>
        </Link>
        <Link className="overview-card" to="/nutrition">
          <div className="overview-top">
            <span className="module-icon orange">
              <Flame size={20} />
            </span>
            <ArrowUpRight size={16} />
          </div>
          <span className="overview-label">Calories</span>
          <h3>
            {nutrition.calories.toLocaleString()}{" "}
            <small>
              / {target?.calories.toLocaleString() ?? "—"} <span>kcal</span>
            </small>
          </h3>
          <Progress
            value={nutrition.calories}
            max={target?.calories ?? 0}
            color="#d7a15f"
          />
          <div className="overview-bottom">
            {Math.max(
              0,
              (target?.calories ?? 0) - nutrition.calories,
            ).toLocaleString()}{" "}
            kcal remaining
          </div>
        </Link>
        <Link className="overview-card" to="/nutrition">
          <div className="overview-top">
            <span className="module-icon blue">
              <Utensils size={20} />
            </span>
            <ArrowUpRight size={16} />
          </div>
          <span className="overview-label">Protein</span>
          <h3>
            {nutrition.protein}{" "}
            <small>
              / {target?.protein ?? "—"} <span>g</span>
            </small>
          </h3>
          <Progress
            value={nutrition.protein}
            max={target?.protein ?? 0}
            color="#7ba5c0"
          />
          <div className="overview-bottom">Building a stronger you</div>
        </Link>
        <Link className="overview-card" to="/school">
          <div className="overview-top">
            <span className="module-icon purple">
              <GraduationCap size={20} />
            </span>
            <ArrowUpRight size={16} />
          </div>
          <span className="overview-label">School</span>
          <h3>
            {tasks.length} <small>tasks remaining</small>
          </h3>
          <div className="overview-bottom">
            {exam
              ? `Next exam · ${dateLabel(exam.date)}`
              : "You’re all caught up"}
          </div>
        </Link>
        <Link className="overview-card" to="/speech">
          <div className="overview-top">
            <span className="module-icon pink">
              <Mic size={20} />
            </span>
            <ArrowUpRight size={16} />
          </div>
          <span className="overview-label">Speech practice</span>
          <h3>{practice.length ? "Practice completed" : "A moment for you"}</h3>
          <div className="overview-bottom">
            <span className={`status-dot ${practice.length ? "done" : ""}`} />
            {practice.length
              ? `${practice.reduce((a, s) => a + s.duration, 0)} minutes practiced`
              : "Not completed yet"}
          </div>
        </Link>
        <Link className="overview-card" to="/trading">
          <div className="overview-top">
            <span className="module-icon mint">
              <TrendingUp size={20} />
            </span>
            <ArrowUpRight size={16} />
          </div>
          <span className="overview-label">Trading journal</span>
          <h3>
            {trades.length}{" "}
            <small>{trades.length === 1 ? "trade" : "trades"} today</small>
          </h3>
          <div className="overview-bottom">Reflect on your decisions</div>
        </Link>
      </div>
      <div className="quick-add-bar">
        <div>
          <Plus size={18} />
          <strong>Quick add</strong>
          <span>Capture it. Keep going.</span>
        </div>
        <div className="quick-actions">
          {quick.map(([kind, Icon, label, color]) => (
            <button key={kind} onClick={() => open(kind)}>
              <Icon size={16} className={`${color}-text`} />
              {label}
              <Plus size={13} />
            </button>
          ))}
        </div>
      </div>
      <div className="dashboard-bottom">
        <Card title="Your next steps" link="/school">
          <p className="card-subtitle">A little focus goes a long way.</p>
          <div className="task-list">
            {tasks.length ? (
              tasks.slice(0, 3).map((t) => (
                <div key={t.id} className="task-row">
                  <button
                    className="task-check"
                    aria-label={`Complete ${t.title}`}
                    onClick={() =>
                      put("tasks", { ...t, status: "Completed" } as Task)
                    }
                  >
                    <Check size={12} />
                  </button>
                  <button
                    className="task-name"
                    onClick={() => open("tasks", t)}
                  >
                    <strong>{t.title}</strong>
                    <span>
                      {db.subjects.find((s) => s.id === t.subjectId)?.name}{" "}
                      <i>·</i> {t.type}
                    </span>
                  </button>
                  <span
                    className={`badge ${t.priority === "High" ? "orange" : ""}`}
                  >
                    {t.date === today ? "Today" : dateLabel(t.date)}
                  </span>
                </div>
              ))
            ) : (
              <Empty>All caught up. Enjoy some breathing room.</Empty>
            )}
          </div>
          <Link className="subtle-link" to="/school">
            View all tasks <ArrowRight size={14} />
          </Link>
        </Card>
        <Card title="Coming up" link="/calendar">
          <p className="card-subtitle">A little planning for what’s ahead.</p>
          <div className="upcoming-list">
            {events.map((e) => (
              <button
                className="upcoming-row"
                key={e.id}
                onClick={() => open(e.kind, e.entry)}
              >
                <div className="mini-date">
                  <span>
                    {new Date(e.date + "T12:00:00").toLocaleDateString(
                      undefined,
                      { month: "short" },
                    )}
                  </span>
                  <strong>{Number(e.date.slice(8))}</strong>
                </div>
                <div>
                  <strong>{e.title}</strong>
                  <span>
                    {e.kind === "tasks"
                      ? "School"
                      : e.kind === "workouts"
                        ? "Fitness"
                        : e.kind === "speech"
                          ? "Speech practice"
                          : "Personal"}
                  </span>
                </div>
                <span className={`event-dot ${e.kind}`} />
              </button>
            ))}
            {!events.length && <Empty>Your calendar is open.</Empty>}
          </div>
        </Card>
        <Card className="daily-note">
          <div className="card-heading">
            <span className="module-icon green">
              <Droplets size={19} />
            </span>
            <span className="eyebrow">DAILY CHECK-IN</span>
          </div>
          <h2>
            Don’t forget
            <br />
            the little things.
          </h2>
          <p>
            Take a breath. Stretch a little.
            <br />
            Have a glass of water.
          </p>
          <div className="hydration-count">
            <strong>
              {(water / 1000).toFixed(1)} <small>L</small>
            </strong>
            <span>/ {((target?.water ?? 2500) / 1000).toFixed(1)} L today</span>
          </div>
          <Progress value={water} max={target?.water ?? 2500} />
          <Link className="subtle-link" to="/nutrition">
            Track your hydration <ArrowRight size={14} />
          </Link>
        </Card>
      </div>
      <footer className="page-footer">
        <span className="live-dot" /> Your space. Your pace.
        <span>Little by little, a life well lived.</span>
      </footer>
    </>
  );
}
