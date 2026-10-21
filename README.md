# OpenWorkLog

An offline-first workspace for tasks, projects, daily work reports, a built-in planner, executive summaries and study notes. Developed by NPC.

OpenWorkLog stores records in this browser on this device using IndexedDB. It does not require API keys or a cloud account. A GitHub copy of the source code does not back up your work records.

Read the [setup guide](docs/SETUP.md) for installation, hosting and offline setup, and the [user guide](docs/USER_GUIDE.md) for tasks, daily logs, timers, notes, CSV reports and backups.

Non-break work entered in Daily log or Calendar links to the task tracker. Choose an existing task to reuse it, or let the app create a task for new work. Planned daily work also appears on the calendar. Kanban status changes and calendar rescheduling support mouse, touch and keyboard grips, with status selectors and edit forms available too. Appearance includes Light, Dark, Super dark and System.

## Run locally

Use Node.js 22 and npm. From this folder:

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Choose a blank workspace or explicitly load the removable demo workspace. Demo figures are examples, not live operational results.

For the production build and local preview:

```sh
npm run build
npm run preview
```

The preview server prints its address. Use the same browser, profile, hostname, and port to reopen the same local database. Browser storage is scoped to the origin; a development URL and a production preview URL have separate records.

## Offline use and installation

The production build includes a service worker and web app manifest. Load the production URL online once and allow the app to finish loading before going offline. When supported, use the browser's Install app or Add to home screen command. Development mode is for building the app; verify offline behavior against the production build.

Serve the app over HTTPS for a hosted installation, or use localhost for local testing. A static host must route app URLs back to `index.html`. This repository does not publish a public site automatically. Installation availability varies by browser; responsive browser tests do not prove operation on a physical tablet or phone.

## Protect your records

In Settings, export a JSON backup and save it somewhere you control. Backups contain tasks, projects, categories, notes, planner entries, daily entries, timer records, and settings. They can contain private work details; treat them as private files.

To restore, choose the JSON file, review its preview, then explicitly confirm replacement. Restore replaces the current device workspace. An invalid file is rejected before replacement. Keep a recent backup before moving between devices or clearing browser data. CSV exports are useful reports, but are not a full workspace backup.

Core data stays on this device. There is no configured cloud synchronization, multi-user access, server database, or automatic cross-device backup. Browser storage can be removed by browser settings, profile deletion, or storage eviction.

## Verify a change

```sh
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite launches a separate production preview on `127.0.0.1:4173` and uses isolated test contexts. Stop any preview already using that port before running it. Failure evidence is written to `test-results/` and `playwright-report/`; those directories are excluded from source control.

See [acceptance scenarios](docs/ACCEPTANCE.md), [verification record](docs/VERIFICATION.md), [architecture](ARCHITECTURE.md), [design contract](DESIGN.md), and [project handoff](PROJECT_CONTEXT.md) for the maintenance details and exact verification scope.
