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
| Notes and preferences | `src/features/notes/`, `src/features/settings/` |
| Browser acceptance | `tests/e2e/`, `playwright.config.ts` |
| CI | `.github/workflows/verify.yml` |

## Preserve these contracts

- Statuses are only Open, In Progress, and Closed. Empty time slots have no status.
- Stable IDs connect tasks, projects, categories, planner blocks, notes, and daily entries. Rename the record, not its ID.
- Daily reports contain 48 half-hour slots. Actual work and planned work remain distinct. Lunch is explicit and excluded from productive time.
- Timer segments persist. Stopping enters review and must not close the task. Saving the same reviewed timer cannot create duplicate entries. A timer linked to a plan updates that plan's existing daily entry while preserving its ID and planned times.
- Backup validation happens before a single atomic replacement transaction. File selection is not consent to replace the workspace.
- CSV must preserve quoted fields and protect against spreadsheet formula execution. Unsupported imported statuses are errors.
- Study notes do not automatically become work accomplishments.
- Saved on this device is the storage claim. Do not add a cloud-sync indicator without a real configured and verified service.

## Change verification

Use `npm ci` with the committed lockfile, then run typecheck, lint, unit/integration tests, production build, and relevant browser acceptance. Keep new TypeScript modules below 250 non-blank, non-comment lines; use strict types without `any`, unsafe casts, or suppression directives. Update the architecture contract when a shared API changes and the verification record when checks run.

No credentials, environment secrets, personal database exports, dependency directories, build output, or browser QA profiles belong in source control. Hosted deployment, cloud synchronization, and physical-device acceptance are separate follow-up work unless explicitly verified in the release record.

