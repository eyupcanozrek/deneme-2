# LifeOS

A local-first personal life-management application. Phase 1 brings Fitness, Nutrition, School, Trading, Speech Journal, Notes, and Calendar into one responsive dashboard.

## Run

Use Node.js 22.12 or newer (Node 24 is also supported).

```bash
npm ci
npm run dev
```

Open http://localhost:5173. In Codespaces, use the forwarded port 5173 URL. Keep using the same browser and origin to access your saved records.

```bash
npm run build       # TypeScript checks and production bundle
npm run preview     # Serve the production bundle locally
npm test            # Data validation and calculation tests
npm run test:e2e    # Browser workflows; starts Vite if needed
npm run format:check
```

For browser tests, install Chromium once:

```bash
npx playwright install --with-deps chromium
```

On this workspace, Chromium is installed in `/tmp/lifeos-browsers`; run tests with `PLAYWRIGHT_BROWSERS_PATH=/tmp/lifeos-browsers npm run test:e2e`.

## Phase 1

- Dashboard with live summaries, pending tasks, upcoming activities, hydration, and quick-add forms.
- Workouts with dated planned/completed sessions, linked exercise definitions, editable sets/reps/weights, previous performance, and exercise/status history filters.
- Nutrition with dated meals, foods and quantities, calories/macros, effective-date targets, and hydration logs.
- School with subjects, homework/exams/projects, priorities, deadlines, status updates, and subject/status filters.
- Trading with timestamps, asset/market, direction, entry/exit, quantity, fees/currency, realized P&L per closed trade, notes, reasons, mistakes, and lessons.
- Speech journal with dated practice, completed exercises, duration, difficulty, notes, and progress observations.
- Notes with full create/edit/delete flows.
- Month calendar derived from workouts, school deadlines, speech practice, and editable personal events.
- Light/dark appearance, mobile navigation, keyboard-accessible dialogs, sample records, backup import/export, and storage recovery.

Demo data is generated relative to the current date and saved only on first use. Clearing all records does not reseed them on refresh. You can edit or delete demo entries as you begin using the app.

## Architecture

```text
src/
  app/                 Routing, application shell, state and editor providers
  components/          Shared cards, forms, dialogs, and CRUD list UI
  data/                Domain models, version migrations, demo, storage adapter
  features/
    dashboard/         Aggregated overview and quick-add
    calendar/          Month view and source-to-calendar adapters
    fitness/           Workout page and exercise/set form
    nutrition/         Meals, targets, hydration, and nutrition calculations
    school/            Tasks, subjects, status, and filtering
    trading/           Trade fields, reflections, and P&L calculation
    speech/            Practice history and practice fields
    notes/             Personal notes
    settings/          Preferences and backup management
  lib/                 Shared date/time helpers
  styles/              Design tokens and responsive styles
 tests/
  unit/                Validation and calculation tests
  e2e/                 CRUD, persistence, backup, theme, and mobile workflows
```

Each feature owns its page and specialized fields/calculations. Common dialog and list behavior is reused. Components access state through `useStore`; localStorage calls are isolated in `data/storage.ts` and the backup tools. A future asynchronous database adapter will require adapting the store boundary rather than rewriting feature pages.

## Data conventions

- Schema version: `1`. Future sequential migrations belong in `data/migrations.ts`. Unsupported versions are rejected, never silently discarded.
- Entities use UUIDs and UTC `createdAt` / `updatedAt` timestamps. Exercise and subject relations use IDs.
- Workouts own ordered exercise instances and sets; meals own foods. Nested records also have IDs and timestamps. Array order represents set/exercise order. These aggregates can be flattened into database tables later with parent IDs.
- Daily entries use local calendar dates (`YYYY-MM-DD`). Trades and personal events persist UTC ISO timestamps, converted to local time for forms, summaries, and calendars.
- Targets have an effective date; editing an existing date updates its record, while changing a later date preserves earlier targets.
- Meal nutrition values describe the full recorded quantity and remain snapshots. Changing a quantity does not automatically rescale manually supplied nutrition values.
- P&L is `(exit - entry) × quantity × direction - fees`. Open trades have no realized P&L. Each trade retains its own currency; currencies are never summed together.
- Calendar items and dashboard summaries are derived from module records. Editing or deleting the source updates both views.
- Saves validate the complete data structure and write to storage before updating the visible state. Storage failure leaves forms open. Malformed saved data is preserved and normal writes are blocked until a valid backup is explicitly imported.
- Another tab's valid writes refresh the store; same-record simultaneous edits use the last saved version. Multi-device synchronization is deferred.

## Personal data and backups

The application has no backend, account authentication, or cloud synchronization. Records remain in localStorage on this browser and origin. Storage is not encrypted, and clearing browser data removes records. Export JSON backups from Settings regularly; backups contain your personal data.

Import validates the schema, record fields, dates, numeric ranges, and references, then asks before replacing existing records. “Download original stored data” is available for recovering a damaged saved payload without replacing it. Fonts are bundled locally; the application does not require a font CDN.

For production hosting, serve `dist/` and configure all application routes to fall back to `index.html`. Vite's development and preview servers already support this.

## Deferred work

Phase 2: strength/volume charts, trading statistics, richer trend views and filters, and repeat-entry workflows.

Phase 3: authentication, a database, user-scoped records, managed backups, and cross-device synchronization.

No Phase 2 or Phase 3 features are implemented in this version.
