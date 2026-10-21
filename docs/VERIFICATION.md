# Verification record

Verified locally on 2026-10-21 (Asia/Manila), using the production build and Chromium. This record separates executable checks from hardware and hosting limits.

## Final checks

| Check | Result |
| --- | --- |
| Strict TypeScript (`npm run typecheck`) | Passed |
| Unit/integration (`npm test`) | 53 passed across 12 files; final rerun 1.37 seconds |
| Lint (`npm run lint`) | Exit 0; 6 CSS warnings and 6 informational style suggestions remain |
| Production build (`npm run build`) | Passed; 41 PWA precache assets, about 687 KiB total |
| Dependency audit (`npm audit`) | 0 vulnerabilities |
| Browser acceptance (`npm run test:e2e`) | 19 passed, zero failed/skipped/flaky results, 1.3 minutes |
| Responsive and state captures | 132 valid PNGs, covering five viewport sizes and the states below |
| Accessibility | 18 axe checks, zero violations; Lighthouse Accessibility 100 on six page/device audits |
| Independent visual review | Final fresh capture set delivered for final release review; approval recorded separately |
| GitHub source upload | Private repository created; upload status recorded at release handoff |

The final production HTML fingerprint is `7dc953c4e0c6585360c508e894a9e3c69312c3d0a8be3ba96425d50b2e080cfe` (SHA-256). Its main bundle is `index-B4yz85nS.js` and shared stylesheet is `index-DxhdqkLE.css`.

## Behaviors exercised through the app

- Task creation, rename, status change, database reopen, List/Table/Kanban views, and category rename propagation.
- Project, task, planner and daily-entry links, preserved planned times, and reopening the same daily record.
- Timer start, pause, reload, resume, review and save, leaving the task's status unchanged.
- A planned activity timed twice updates one stable daily entry. The test corrects the first session to 10 minutes, adds a new 10-minute session, and verifies 20 minutes, both work descriptions, and preserved planned times.
- All 48 half-hour slots; a 13:10–13:42 activity allocates 20 and 12 minutes across adjacent slots; lunch is excluded from productive time.
- Study note creation, editing, search, pin, review, archive and deletion; HTML is treated as text.
- Tracker and daily CSV downloads parsed independently with csv-parse; commas, quotes and newlines preserved, and formula-leading tracker text escaped.
- CSV preview, unsupported-status rejection and confirmed import.
- JSON backup download, preview without replacement, explicit replacement confirmation, successful restore and invalid-file protection.
- Production service-worker offline reload, offline edit, another offline reload, and persistence after reconnecting.
- Light/dark persistence, sidebar collapse and task focus view.
- Native editor focus and Escape dismissal; mobile navigation drawer opening and Escape dismissal.

The plan-timer browser fixture initially allowed its simulated wall clock to advance during UI actions, rounding an expected 13:42 endpoint to 13:43. Pausing every browser timer then prevented React's lazy route from settling. The final fixture fixes Date at explicit timestamps while leaving the browser scheduler running. Exact time and data assertions were retained; production timer calculations were not changed to fit the test.

## Responsive and visual evidence

Viewport sizes: 375×812, 430×932, 800×1280, 1280×800 and 1440×1000. Every product route and the component showcase were captured, plus Table/Kanban bodies, late-day Day/Week calendar grids, the final daily half-hour, dashboard portfolio, study-note reader, report preview, backup settings, dark mode, large text and task-editor dialogs. The two phone sizes include the mobile drawer. Desktop captures include normal-motion rest/entry/mid/settled frames and a reduced-motion frame.

Each state asserts no document-width overflow. Computed checks confirm that the keyboard hint is hidden at widths up to 1050 pixels, note-search padding reserves at least 40 pixels for its icon, and reduced motion removes the dialog animation. The screenshot manifest validates PNG signatures and dimensions and records each image's SHA-256. A reviewer may inspect horizontal table contents through their intended scroll viewport.

First-round visual review found three real issues: a mobile keyboard hint over the search icon, the notes magnifier overlapping its placeholder, and task-table short fields wrapping awkwardly. These were repaired and the complete fresh 132-image set was captured for independent round 2 review. Round 2 found that the task-table status selector clipped In Progress. A scoped table-only minimum width repaired it. A failing-first browser check measured 98.61 pixels available against 116.71 pixels required for the actual label, padding and native arrow. The same label-fit check now passes at all five viewport sizes; it does not pin a CSS width constant. The final release reviewers received a newly captured complete 132-image set after that repair. Previous review reports are preserved as history rather than treated as approval.

Stable evidence is in the sibling `OpenWorkLog-QA` deliverable: `acceptance-results-final.json`, `capture-manifest-final.json`, `responsive-final/`, `data-integrity-final.md`, `performance-final.md`, and visual review reports. Playwright's working `test-results/` directory is replaced on each run. Test records and downloaded backups are excluded from Git.

## Performance and limits

Final Lighthouse single-run scores:

| Page | Desktop performance | Mobile performance | Accessibility / Best Practices / SEO |
| --- | --- | --- | --- |
| Dashboard | 100 | 99 | 100 / 100 / 100 |
| My Tasks | 100 | 99 | 100 / 100 / 100 |
| Daily Log | 100 | 100 | 100 / 100 / 100 |

These are measured single runs, not three-run medians. The final audit also found no document overflow, visible controls smaller than its 44-pixel heuristic, or JavaScript page errors across its tested routes and sizes. CSS 200% zoom and reduced-motion checks passed. React Doctor completed on 79 files with zero errors and 22 warnings; static warnings are recorded in the audit. Production React Scan did not expose full component timing summaries, so no claim of zero unnecessary renders is made.

All device checks used Chromium with emulated dimensions. Physical Tab S10 FE, phone hardware, other browser engines, installation prompts on every platform and external hosting were not verified. Local data is stored in IndexedDB. There is no configured cloud database or multi-device synchronization. A GitHub source upload is not a deployed website. Keep JSON backups outside the browser before clearing site data or moving to another origin/device.
