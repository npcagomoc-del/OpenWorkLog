# OpenWorkLog maintenance handoff

OpenWorkLog is a local-first React/TypeScript/Vite PWA. Developed by NPC. Core data is persisted through Dexie/IndexedDB, with strict Zod validation for imported backups. The source repository is private: `https://github.com/npcagomoc-del/OpenWorkLog`.

Read `ARCHITECTURE.md` before changing shared data contracts, and `DESIGN.md` before adding or changing UI. Read `docs/VERIFICATION.md` for actual tested results and remaining limits.

## Edit map

| Change | Location |
| --- | --- |
| Record types and validation | `src/domain/` |
| Database, actions, timers, backup, CSV | `src/data/` |
| Shared utilities | `src/lib/` |
| Navigation, shell, reusable controls, tokens | `src/App.tsx`, `src/app/`, `src/components/`, shared styles |
| Task and project workflows | `src/features/tasks/` |
| Planner | `src/features/calendar/` |
| Daily entries, timers, dashboard, reports | `src/features/daily/`, `src/features/dashboard/`, `src/features/reports/` |
| Executive dashboard, metric scope and summary CSV | `src/features/executive/` |
| Notes and preferences | `src/features/notes/`, `src/features/settings/` |
| Browser acceptance | `tests/e2e/`, `playwright.config.ts` |
| CI | `.github/workflows/verify.yml` |

## Preserve these contracts

- Status values are Open, In Progress, On Hold, Closed and Cancelled. Closed means completed; Cancelled is terminal without counting as completion. Empty time slots have no status. Resolve status visuals through the saved palette, preserving readable text. Business Unit is optional; old records and unknown/retired values must remain valid.
- Stable IDs connect tasks, projects, categories, planner blocks, notes, and daily entries. Rename the record, not its ID.
- My Tasks is the canonical tracker. `src/data/connectedWork.ts` atomically creates a Task-type record for new non-break daily work or Calendar plans when no task is selected; an existing explicit task link is reused. Do not merge unrelated work by title. New daily tasks inherit their initial entry status; new Calendar tasks start Open. Existing tracker titles and statuses remain independent of recorded daily activity titles and statuses.
- Auto-created tasks have `dueDate: null`. A scheduled work date is not a deadline; users explicitly set By when in My Tasks. Rescheduling must not create false overdue work.
- Daily reports contain 48 half-hour slots. Actual work and planned work remain distinct. Lunch is explicit and excluded from productive time.
- A non-break daily entry with planned bounds creates or updates its linked Calendar plan. Lunch/break entries do not create tracker tasks or work plans. Rescheduling moves linked planned-only entries; recorded actual dates and times remain history.
- Preserve intentional deletion markers. `taskDetached` prevents task recreation through ordinary history edits, plan rescheduling, source timer use, reload and backup restore; explicit task selection reattaches. `calendarDetached` preserves planned times after a plan is deleted without recreating it during remarks edits or timer saving; an explicit planned-interval edit can create a new plan. One-time legacy linking uses `Settings.connectedWorkVersion`, retained in backups. Do not run recurring title-based backfills or discard these optional fields.
- Timer segments persist. Stopping enters review and must not close the task. Saving the same reviewed timer cannot create duplicate entries. `Timer.sourceEntryId` identifies chosen daily work and is distinct from reciprocal saved `entryId` ownership. Planned work selection captures its date/window and task/project context, while actual measurement starts now. Saving upserts the existing source/plan daily entry for the actual date, preserves manual corrections and appends new work text. Overnight entries share one canonical task; manually supplied planned times at review apply only to the selected date, not every overnight date.
- Backup validation happens before a single atomic replacement transaction. File selection is not consent to replace the workspace.
- CSV must preserve quoted fields and protect against spreadsheet formula execution. Unsupported imported statuses are errors.
- Study notes do not automatically become work accomplishments.
- Saved on this device is the storage claim. Do not add a cloud-sync indicator without a real configured and verified service.

## Interaction and reporting boundaries

Kanban status changes and Calendar Day/Week rescheduling use `@dnd-kit/core` grips. Mouse activation is 6px; touch requires a deliberate 200ms hold with 8px tolerance. Keyboard users pick up with Space/Enter, move with arrows, drop with Space/Enter and cancel with Escape. Kanban movement changes only the active grouping field (status, category, project or Business Unit), preserving the other fields; Calendar Up/Down moves 30 minutes and Left/Right moves between visible days. Calendar moves preserve duration and reject an end after 24:00. Keep target feedback, announcements, focus restoration, reduced-motion support and the explicit status-selector/Edit plan alternatives. Month view remains an edit-based scheduling surface.

Duration resizing uses separate start/end edges in Calendar Day/Week. Pointer/touch drag previews and release commits; keyboard Up/Down changes 30 minutes, Enter/Space commits, Escape cancels. Keep 30-minute minimum and 00:00–24:00 limits, stable links and the atomic linked planned-only update path. Recorded actual work must remain unchanged. The daily timeline renders one spanning activity block per record; do not duplicate saved activity when its duration covers several slots. Timer elapsed display uses HH:mm:ss and a new session includes only its own segments, with no historical task carryover.

Super dark is the explicit `black` appearance alongside Light, Dark and System. Its canvas and raised surfaces are neutral black/gray; blue is an interaction or Open-status accent, not a tint across the neutral surfaces. The default status colors distinguish all five values; user color overrides must use readable derived foreground/background pairs. Theme tokens live in `src/styles/tokens.css`; Settings validation lives in `src/domain/settings.ts` and is re-exported by models.

Executive metrics come from the local saved workspace. Activity date filters apply to planned/logged time; category and owner filters apply to activity and the current portfolio. Current unarchived task/project counts are not historical snapshots. Productive time excludes lunch/breaks and timer pauses. Plan IDs prevent counting both a calendar block and its linked daily planned interval twice. Overdue means unfinished work with an explicit deadline before today in the workspace time zone; due today is separate. Activity charts group longer periods into no more than 14 buckets and retain exact-figure tables. The summary CSV is not a full tracker export or backup. Do not invent utilization, forecasts, cross-device/team data or an executive email-delivery state.

## Change verification

Use `npm ci` with the committed lockfile, then run typecheck, lint, unit/integration tests, production build, and relevant browser acceptance. Keep new TypeScript modules below 250 non-blank, non-comment lines; use strict types without `any`, unsafe casts, or suppression directives. Update the architecture contract when a shared API changes and the verification record when checks run.

Human instructions are in `docs/SETUP.md` and `docs/USER_GUIDE.md`. Keep them aligned with connected-work behavior and data-transfer limits. Browser acceptance defaults to bundled Chromium; `PLAYWRIGHT_CHANNEL=chrome` selects installed Chrome for hosts where the bundled browser cannot launch. Tests retain isolated contexts and do not use the personal workspace database.

No credentials, environment secrets, personal database exports, dependency directories, build output, or browser QA profiles belong in source control. The static HTTPS release procedure is in `docs/CLOUDFLARE_DEPLOYMENT.md`; `public/_headers` is the only hosting asset added for it. A final production build must include that file. Hosted deployment and physical-device acceptance remain unverified until the release record says otherwise. Hosting does not add cloud synchronization or transfer local records: the new HTTPS origin needs an explicit private JSON restore. Root owns actual deployment and the final verification record.
