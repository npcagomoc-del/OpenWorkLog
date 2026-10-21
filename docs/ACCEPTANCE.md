# Acceptance scenarios

Run against the production build. Each automated scenario gets a new isolated browser context. Use ordinary UI controls and downloaded files; do not inject application records into IndexedDB to make a scenario pass.

| Scenario | Observable acceptance result |
| --- | --- |
| Blank/demo start | Blank begins without demo work; demo selection is explicit and labelled. |
| Task editing | Create a task, rename it, change status/category, and reopen it after page reload. Changes survive. |
| Category editing | Add and rename a category in Settings. Existing linked records display the renamed category. |
| Calendar mobile focus and category color | At a phone viewport, enter Focus calendar and use the date strip, navigation, view menu, Add plan and Exit. A linked plan follows its task's current category and color; clearing that category removes the cue. An unlinked plan uses its saved category, and a missing category is neutral. |
| Focused mobile Kanban | Choose Kanban → Focus board. Open Filters and search/clear, change Group by, browse lanes with Previous/Next lane and horizontal swipe, then move a card using Actions → Move to. The focused view remains usable without document-level horizontal overflow. |
| Explicit Daily-to-task updates | Link multiple Daily entries to one task. Edit one entry's shared fields and confirm only fields explicitly changed update the task, with Work done becoming Latest update; sibling entries remain unchanged. Relinking alone and saving a timer do not copy fields, and leaving a task field untouched preserves its newer value. |
| Appearance presets | Change brightness, Surface style (Default/Apple/Warm) and Button color independently; reload and confirm saved choices persist while status and category colors remain separate. Restore the default button color. |
| Planner | Create a planned block with task/project links; reopen it from the calendar and retain those links. |
| Plan-to-timer continuity | Log a plan, then time that plan. Saving the timer updates the same daily entry ID, retains planned times, adds actual times, and leaves one daily entry. A subsequent session preserves manual time corrections and prior work descriptions. |
| Timer persistence | Start/pause/resume, reload, stop for review, save once. Time survives reload and the parent task stays open. |
| Half-hour day | Full day renders 48 half-hour slots including explicit lunch; lunch does not inflate productive duration. |
| Study notes | Create, edit, search, pin/review/archive, and delete a note; data survives reload. |
| Study note handwriting | Add handwriting to a saved note. Draw with pen/mouse, erase a touched whole stroke, undo and redo, change Ink color and Pen width, and enable Draw with finger. Confirm writing saves after pen lift and survives reload, note switching and backup/restore; typed content stays separate. If cached production app is offline, verify local ink still saves. |
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


