# Acceptance scenarios

Run against the production build. Each automated scenario gets a new isolated browser context. Use ordinary UI controls and downloaded files; do not inject application records into IndexedDB to make a scenario pass.

| Scenario | Observable acceptance result |
| --- | --- |
| Blank/demo start | Blank begins without demo work; demo selection is explicit and labelled. |
| Task editing | Create a task, rename it, change status/category, and reopen it after page reload. Changes survive. |
| Category editing | Add and rename a category in Settings. Existing linked records display the renamed category. |
| Planner | Create a planned block with task/project links; reopen it from the calendar and retain those links. |
| Plan-to-timer continuity | Log a plan, then time that plan. Saving the timer updates the same daily entry ID, retains planned times, adds actual times, and leaves one daily entry. A subsequent session preserves manual time corrections and prior work descriptions. |
| Timer persistence | Start/pause/resume, reload, stop for review, save once. Time survives reload and the parent task stays open. |
| Half-hour day | Full day renders 48 half-hour slots including explicit lunch; lunch does not inflate productive duration. |
| Study notes | Create, edit, search, pin/review/archive, and delete a note; data survives reload. |
| CSV output | Download through the UI, parse records, retain commas/quotes/newlines, and neutralize spreadsheet formulas. |
| CSV input | Preview valid data before importing; reject unsupported statuses instead of silently changing them. |
| Backup/restore | Download backup, change data, choose backup, verify preview alone does not replace data, confirm restore, and observe original data. |
| Invalid backup | Select malformed or schema-invalid JSON. Display an error and preserve current records. |
| Database reopen | Reload and reopen the same origin in the same browser context; saved records remain visible. |
| Offline production | Register service worker, disconnect network, reopen app, read and edit existing data, reconnect without loss. |
| Theme/focus | Light/dark switch remains readable; sidebar collapse/focus works and settings persist. |
| Responsive | Inspect all routes at 375×812, 430×932, 800×1280, 1280×800, and desktop. No document-level horizontal overflow or inaccessible primary action. |
| Keyboard/motion | Reach primary actions with keyboard; dialogs have labels and dismiss correctly; reduced motion remains usable. |

Automated functional checks are complemented by visual inspection. A passing geometry check alone does not prove readable spacing, visual quality, or physical-device compatibility. Record exact executed scenarios and evidence in `VERIFICATION.md`.


