# Executive dashboard

Route: `/executive`. The page reads the same local workspace as My Tasks, Projects, Calendar and Daily log. It does not create business records or simulate activity.

## Metric definitions

- **Current portfolio:** unarchived task and project records, filtered by category and owner. Activity dates do not reconstruct historical task statuses.
- **Operational tasks:** task records whose type is operational. **Other tasks:** remaining task records, including project-type tasks. **Projects:** project entities, counted once; their linked tasks remain task records. No combined task/project total is presented.
- **Unfinished tasks / active projects:** current Open plus In Progress records. **Overdue:** unfinished tasks due before today in the configured workspace time zone. Due-today is separate.
- **Productive time:** selected-period Daily log actual segments or actual interval. Pauses are excluded by the stored segments; lunch/break entries contribute zero productive minutes. Historical time remains available after its linked task is archived.
- **Planned time:** selected-period Calendar plans, plus planned intervals on daily entries that have no surviving linked plan. A plan and its daily log are not counted twice. Planned time never contributes to productive time.
- **Owners:** the linked task's saved assignee, otherwise the linked project's owner; empty assignments are Unassigned. A project owner is not assumed to be the assignee of its linked task. Owner bars show current unfinished task counts, with selected-period logged time stated separately.
- **Categories:** an activity's category, then its task's category, then its linked project's category. Missing categories are Uncategorized. The same fallbacks apply to portfolio category filters where appropriate.
- **Activity chart:** at most fourteen contiguous date buckets spanning the selected inclusive date range. Longer periods use larger buckets. The expandable figure table provides the same values as the visual bars.

There are no invented capacity, health, forecast or utilization figures. Status colors use the shared Open/In Progress/Closed tokens; all themes use shared surfaces and text tokens.

## CSV

Export summary CSV contains thirteen quoted UTF-8/BOM columns. Current portfolio rows and selected-period time rows are explicitly labelled. Category/owner filters and date bounds are included. Quotes, commas and newlines are preserved, and formula-leading text is prefixed for spreadsheet safety.

## Verification

`npm test -- src/features/executive/executiveMetrics.test.ts` covers distinct task/project counts, date filtering, archives, owner/category attribution, pause segments, lunch exclusion, plan deduplication, bounded chart buckets and formula-safe CSV.

Manual browser verification on isolated origin 127.0.0.1:5197: adding one activity planned 08:00–09:00 and actual 08:10–08:40 updated My Tasks immediately, showed 30m productive time and 1h planned time in the executive figure table. The CSV downloaded through the actual button was parsed independently: 17 data rows, each with thirteen fields; productive Value 30 and planned Value 60. Integration browser QA owns the final viewport captures and production acceptance evidence.
