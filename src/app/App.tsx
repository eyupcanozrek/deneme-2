import { useMediaQuery } from "../lib/useMediaQuery";
import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  Link,
  useLocation,
} from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Dumbbell,
  Utensils,
  GraduationCap,
  TrendingUp,
  Mic,
  NotebookPen,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { StoreProvider, useStore } from "./Store";
import { EditorProvider } from "./Editor";
import Dashboard from "../features/dashboard/Dashboard";
import Fitness from "../features/fitness/Fitness";
import Nutrition from "../features/nutrition/Nutrition";
import School from "../features/school/School";
import Trading from "../features/trading/Trading";
import Speech from "../features/speech/Speech";
import Notes from "../features/notes/Notes";
import Calendar from "../features/calendar/Calendar";
import Settings from "../features/settings/Settings";
const groups: { name: string; items: [string, string, LucideIcon][] }[] = [
  {
    name: "",
    items: [
      ["/", "Dashboard", LayoutDashboard],
      ["/calendar", "Calendar", CalendarDays],
    ],
  },
  {
    name: "LIFE",
    items: [
      ["/fitness", "Fitness", Dumbbell],
      ["/nutrition", "Nutrition", Utensils],
    ],
  },
  {
    name: "PERFORMANCE",
    items: [
      ["/school", "School", GraduationCap],
      ["/trading", "Trading", TrendingUp],
    ],
  },
  {
    name: "PERSONAL",
    items: [
      ["/speech", "Speech Journal", Mic],
      ["/notes", "Notes", NotebookPen],
    ],
  },
];
function Shell() {
  const { db, error, update } = useStore(),
    [mobile, setMobile] = useState(false),
    location = useLocation();
  const isMobile = useMediaQuery("(max-width:700px)");
  useEffect(() => {
    if (!isMobile) setMobile(false);
  }, [isMobile]);
  const active =
    groups
      .flatMap((g) => g.items)
      .find((i) => i[0] === location.pathname)?.[1] ?? "Settings";
  return (
    <div className="application" data-theme={db.settings.theme}>
      <EditorProvider>
        {mobile && (
          <div className="sidebar-scrim" onClick={() => setMobile(false)} />
        )}
        <aside
          inert={isMobile && !mobile}
          aria-hidden={isMobile && !mobile}
          className={`sidebar ${mobile ? "open" : ""}`}
        >
          <Link to="/" className="brand" onClick={() => setMobile(false)}>
            <span className="brand-mark">
              <span />
              <span />
              <span />
              <span />
            </span>
            life<span className="brand-os">OS</span>
            <span className="brand-period">.</span>
          </Link>
          <span className="brand-tagline">A little more intentional.</span>
          <button
            className="mobile-close icon-button"
            onClick={() => setMobile(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
          <nav id="lifeos-navigation" aria-label="Main navigation">
            {groups.map((g) => (
              <div className="nav-group" key={g.name}>
                {g.name && <div className="nav-label">{g.name}</div>}
                {g.items.map(([path, label, Icon]) => (
                  <NavLink
                    end={path === "/"}
                    key={path}
                    to={path}
                    onClick={() => setMobile(false)}
                  >
                    <Icon size={19} />
                    {label}
                    {path === "/" && <span className="nav-active-dot" />}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="sidebar-note">
              <Sparkles size={19} />
              <strong>Your life. In balance.</strong>
              <p>
                Small steps add up to
                <br />
                something good.
              </p>
            </div>
            <NavLink
              className="settings-link"
              to="/settings"
              onClick={() => setMobile(false)}
            >
              <SettingsIcon size={18} />
              Settings
            </NavLink>
            <div className="profile">
              <span className="avatar">
                {db.settings.name.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <strong>{db.settings.name}</strong>
                <span>Personal workspace</span>
              </div>
              <Link aria-label="Profile settings" to="/settings">
                <ChevronDown size={16} />
              </Link>
            </div>
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <div className="breadcrumb">
              <button
                className="mobile-menu icon-button"
                aria-label="Open navigation"
                aria-expanded={mobile}
                aria-controls="lifeos-navigation"
                onClick={() => setMobile(true)}
              >
                <Menu size={21} />
              </button>
              <span>My workspace</span>
              <span className="breadcrumb-divider">/</span>
              <strong>{active}</strong>
            </div>
            <div className="topbar-actions">
              <span className="local-indicator">
                <span className="live-dot" /> Local workspace
              </span>
              <button
                className="icon-button theme-button"
                aria-label={
                  db.settings.theme === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"
                }
                onClick={() =>
                  update((d) => ({
                    ...d,
                    settings: {
                      ...d.settings,
                      theme: d.settings.theme === "light" ? "dark" : "light",
                    },
                  }))
                }
              >
                {db.settings.theme === "light" ? (
                  <Moon size={18} />
                ) : (
                  <Sun size={18} />
                )}
              </button>
              <Link
                className="avatar small"
                to="/settings"
                aria-label="Your settings"
              >
                {db.settings.name.slice(0, 1).toUpperCase()}
              </Link>
            </div>
          </header>
          <main>
            {error && (
              <div className="error storage-error" role="alert">
                {error}{" "}
                <Link to="/settings">
                  Open settings <ArrowUpRight size={14} />
                </Link>
              </div>
            )}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/fitness" element={<Fitness />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/school" element={<School />} />
              <Route path="/trading" element={<Trading />} />
              <Route path="/speech" element={<Speech />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/settings" element={<Settings />} />
              <Route
                path="*"
                element={
                  <div className="empty">
                    <h1>Page not found</h1>
                    <Link to="/">Return to dashboard</Link>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </EditorProvider>
    </div>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </BrowserRouter>
  );
}
