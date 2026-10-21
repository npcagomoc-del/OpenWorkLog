# OpenWorkLog user guide

Developed by NPC.

OpenWorkLog keeps your task tracker, project list, calendar plans, daily report and study notes in one local workspace. The calendar and planner are built into the app. They do not connect to Outlook.

For installation, hosting and offline setup, read the [setup guide](SETUP.md).

## Start your workspace

On the welcome screen, choose **Start with blank workspace** for real work or **Explore demo workspace** to try example records. Open **Settings** to set your name, schedule, time zone, work labels and categories.

The default working day is 08:00–17:00, with lunch at 12:00–13:00. Daily log still supports the entire 24-hour day.

On a desktop or tablet, use the navigation sidebar. **Collapse navigation** reduces it, and **Focus view** in My tasks gives the task list more space. Use **Exit focus** or press `Esc` to leave focus mode. The top toolbar also has search and theme controls. `Ctrl+K` on Windows or `Cmd+K` on macOS opens search for tasks and notes.

On a narrow phone screen, the bottom bar opens Today, Tasks, Daily Log and Notes. Use **More** or the menu button for Executive, Projects, Calendar, Reports and Settings. Wide tables scroll horizontally inside their own area; swipe across the table to see the remaining columns.

## Keep your task tracker up to date

1. Open **My tasks → New task**.
2. Enter a title and choose its work type, category, status and priority.
3. Add an owner, due date, ticket, project, description, latest update or subtasks as needed.
4. Save the task.

Use these five statuses throughout the app. The colors shown here are defaults; your workspace can use custom status colors:

| Status | Color | Use |
| --- | --- | --- |
| Open | Blue | Work has not started or still needs action. |
| In Progress | Yellow | Work is underway. |
| On Hold | Purple | Work is paused and may resume. |
| Closed | Green | Work is finished. |
| Cancelled | Muted rose | Work was cancelled; it is not counted as completed. |

Choose **List** for compact task rows, **Table** for the tracker columns, or **Kanban** for grouped cards. Each task has one status control showing its current value. Open its title for full details and use its action menu for secondary actions.

In Kanban, use **Group by** to organize cards by Status, Category, Project or Business Unit. **Card details** controls the **Visible groups** and **Visible fields**. Hiding a group changes the view and does not delete its records. Filters still apply when you change the grouping.

In Kanban, drag a task by its grip into another column. A drop changes only the field selected in **Group by**: for example, a Category drop changes the category while keeping the status. Use the unassigned column to clear an optional group value. The **Move to** menu offers the same destinations. With a mouse, move the handle a little to begin dragging. On a touch screen, hold the handle briefly (about 200 milliseconds), then move it. For a keyboard, focus the handle, press `Space` or `Enter` to pick up the task, use Right/Down for the next group or Left/Up for the previous group, then press `Space` or `Enter` to drop. `Esc` cancels. The status selector remains available as an alternative to dragging.

Search by task, ticket or update. Filter by status, category, work type, project or Business Unit. Click the task title to edit its full details. **Export CSV** exports the tasks currently matching the My tasks filters.

Deleting a task requires confirmation. Saved daily entries, plans and notes retain their content, but their link to the deleted task is removed. Download a backup before removing information you may need later.

### How the tracker, calendar and daily log connect

When saving non-break work in Daily log or Calendar, select an existing task if the work belongs to it. Otherwise the app creates a linked task, so the activity also appears in My tasks. It does not merge activities just because their titles match. Repeatedly entering the same title without selecting its existing task can create separate tracker items.

A task created from a daily entry starts with that entry's status. A task created from a calendar plan starts Open. New tasks use your local profile name as the owner when set and leave the due date blank: a scheduled work date is not automatically a deadline. Set **By when** explicitly in My tasks when there is a deadline. You can also change the work type, title, owner and status there.

When a daily entry has planned start/end times, it also creates or updates its linked calendar plan. Lunch/break entries do not create tracker tasks. Existing task titles and statuses are not overwritten by later daily entries or timer reviews; recorded activity titles and statuses remain separate work history. Finishing one session does not automatically close the overall task.

On the first upgrade of an older workspace, the app links existing non-break activities that lack task links. This runs once. Later launches and backups from the upgraded workspace preserve intentionally removed task links rather than treating them as new standalone work to backfill again.

## Organize projects and operational work

Use **Projects** to create and edit projects with a name, owner, due date, category, status and optional link. Link related tasks to the project in the task editor. Open the project's task list to see that project's work together.

Operational work is a work type on the task tracker. You can rename the display labels for Task, Operational and Project in **Settings → Labels & profile**. This changes the workspace terminology while keeping record links intact.

Business Unit is an optional label on tasks, projects and daily entries. In Daily log, select a unit or **Unassigned**. Maintain suggestions in **Settings → Business Units**, then select one or enter a unit in the record editor. Renaming a unit there updates linked records. Removing a suggestion keeps historical values on existing records. Leave it unassigned when it does not apply. A unit is a grouping/filtering label; it does not create a shared team workspace.

Use **Settings → Categories** to add a category and color, rename it, or archive it. Save each edited category. Archiving keeps its name on existing records and hides it from new work selections. Restore it when it is needed again.

## Plan work on the calendar

Open **Calendar**, choose a day, week or month view, and add a plan. Set its date, start/end times, title, linked task, project, category, optional **Business Unit / Requested for**, and notes. Plans describe intended time; they do not count as actual productive time.

Open a plan to:

- **Edit plan** or delete it.
- **Log work from this plan** to open a linked daily entry with its planned times.
- **Open daily entry** when that plan already has an entry.
- **Start timer** to measure work from the current time, keeping planned time separate.

Finish or review the active timer before starting another. Deleting a calendar plan keeps the linked task and saved daily work history.

Moving a plan also moves the date/times of its linked planned-only daily entry. Once actual work exists, its recorded date and actual times remain history. Deleting a plan keeps its daily entry's planned times, and ordinary remarks edits or timer use do not recreate the deleted plan. Explicitly changing the daily planned times can create a new calendar plan.

In the Day and Week time grids, drag a plan by its grip to a new date/time slot. The move preserves its duration and snaps its start to a half-hour slot. On touch, hold the handle briefly before moving it. With a keyboard, focus the grip, press `Space` or `Enter`, use Up/Down for 30-minute steps and Left/Right for another visible day, then press `Space` or `Enter` to save. `Esc` cancels. A move that would end after midnight is rejected. Dragging is limited to the displayed time grid; use **Edit plan** for exact times, dates outside the current view, or the Month view.

To change a plan's duration in Day or Week view, use its top or bottom edge resize control. Hover over or focus the block to reveal the handles; on touch screens, tap the movement grip to select the plan and show the edge handles before dragging an edge. The top changes the start while keeping the end; the bottom changes the end while keeping the start. Drag an edge with a mouse or touch and release to save. The preview snaps to 30-minute intervals, keeps at least 30 minutes, and stays within 00:00–24:00. For a keyboard, focus an edge control, use Up/Down for 30-minute steps, then Enter or Space to save. Escape cancels the preview. **Edit plan** remains available for exact times.

Resizing changes planned time and its linked planned-only daily entry. It keeps the same links and does not stretch recorded actual work or add productive time. Use the separate movement grip to move the whole block while preserving its duration.

## Record the full day in Daily log

Use the date control or Previous/Next day buttons. **Work hours** shows the configured working period; **Full day · 24h** shows all **48 half-hour slots**, from 00:00 to 24:00. Empty slots are available time, so they have no task status.

Click an empty slot or **Add entry**. Choose a **Linked task / operational task** to carry its details into the entry. Expand **More details** to link a project or enter its name/link, ticket number, subtasks and remarks.

Each daily entry keeps these report fields:

| Field | What to enter |
| --- | --- |
| Planned from / to | The intended work period. |
| Category | The kind of work. |
| Ticket number | Incident or customer request reference, when applicable. |
| Linked project, project name / link | The project related to this work. |
| Task / activity and Subtasks | What you planned or handled. |
| Work done | The actual actions and results. |
| Actual from / to | When the work happened. |
| Entry status | Open, In Progress, On Hold, Closed or Cancelled for this daily entry. |
| Business Unit | Optional unit for this activity, or Unassigned. |
| Remarks | Follow-up information or context. |

Time entry fields use 24-hour `HH:mm`, even when you choose another display format in Settings. Enter both start and end for a time interval. For manual work spanning midnight, create one entry for each date; use `24:00` as the first date's end and `00:00` as the next date's start.

An activity can span several half-hour slots. Keep it as one entry with its real times; the timeline shows one block across those slots, with its title, status and actions once. Planned and actual intervals remain labeled separately; pauses and separate records remain distinct. Actual intervals can show seconds. Active saved time excludes gaps between intervals and pauses. Productive totals use actual work, rather than counting every covered grid cell. For example, 13:10–13:42 is one activity with 32 productive minutes, spanning the 13:00–13:30 and 13:30–14:00 grid rows.

Lunch is part of the record. Click a lunch slot and save an entry with **Lunch / break — exclude from productive time** selected. The lunch shading is a schedule guide; it does not create a saved lunch record by itself. Lunch/break entries are excluded from productive-time totals.

Click a saved activity to edit it. Use **Manage this day's entries** for the day's list and deletion controls. Entries without planned or actual times remain in **Without a time** until you assign an interval.

The daily entry status is separate from its linked task's status. Saving a report or a timer does not automatically close the task.

## Use the timer

1. In **Daily log**, use **Planned work** to choose a calendar plan or daily activity for the selected log date. Change the daily log date to see another day's work. You can also use a daily activity's **Start timer** button or a calendar plan's **Start timer**.
2. For new work, leave **Planned work** at **New session or existing task**, select an existing linked task or **New task from this session**, enter a session name and choose **Start timer**.
3. Use **Pause** for time that should not count, then **Resume** when working again.
4. Choose **Stop and review**.
5. Review the linked details, write **Work done**, choose the entry status and **Save work log**.

Only one unfinished timer is allowed. Its state and time segments are saved locally, so a reload does not reset it. Elapsed time is shown as hours:minutes:seconds for the current session. **Previously saved for this activity** is a separate historical total. A new session starts at zero; choosing a task does not add that task's earlier recorded time to the new timer. Pause/Resume continues the same session and Stop and review freezes its elapsed time. The timer shows its planned date/time, linked task and actual start when available. Choosing past or future planned work does not backdate the measurement: the timer always records actual time from now. A running timer continues to accrue elapsed time while the app is closed; pause or stop it before leaving if that time should not count. Paused time is excluded. A session spanning midnight is allocated to the relevant daily dates using the workspace time zone.

Closing the review leaves the session available through **Review session**. **Discard** removes that unfinished timer after confirmation; saved work logs and linked tasks remain.

Timer review shows measured actual times as read-only. After saving, open the daily entry to correct them if necessary. Changing actual times replaces that entry's saved timer segments with the manual interval. Work from a calendar plan stays linked to its daily entry rather than creating a new row each time you reopen it.

## Read the dashboard

The dashboard separates the selected day's activity from the whole workspace:

- **Daily tasks** shows daily entry counts, productive time and entry statuses for the selected date. Lunch and breaks are excluded.
- **Your day, in detail** opens the underlying daily entries.
- **Where time went** groups actual productive time by category. Planned time is excluded.
- **Portfolio overview** shows current unarchived task and project status counts, plus tasks due by the selected date.

Changing the dashboard date changes the daily figures. The portfolio remains the current saved tracker, not a historical snapshot of task statuses.

## Prepare an executive overview

Open **Executive** for a higher-level view of operational tasks, other tasks, projects and work time. Choose **Last 7 days**, **Last 30 days** or an Activity from/to range. Optionally filter by category and owner.

The activity dates filter planned time, logged productive time, time by category and the time figures in owner workload. Portfolio totals and statuses remain the current unarchived records. Overdue tasks are unfinished tasks due before today in the workspace time zone; tasks due today are counted separately. Category and owner filters apply to both portfolio and activity.

The overview includes unfinished tasks, active projects, overdue work, productive time, a status summary, planned-versus-logged time, owner workload and upcoming project dates. Expand **View time figures** for exact chart values. Longer date ranges group days into buckets so the chart stays readable. A linked calendar plan and its daily entry contribute planned time once, rather than twice.

Use **Export summary CSV** to download the displayed scope and summary figures. This is an executive summary, not a replacement for the full tracker/daily exports or a JSON backup. Figures come from records saved in this local workspace; the dashboard does not fetch another employee's device or infer missing work. If demo records are present, the page and export scope include them and show a notice. Check the scope before sharing.

## Keep study notes

Open **Notes** and create a study note. Choose a notebook, enter comma-separated tags, and write your notes. Use **Write / Preview** to check the result. Supported formatting includes `#` headings, `-` bullets, `- [ ]` checklists and `>` quotes. Raw HTML is treated as text.

Expand **Summary, review questions & references** to add a summary, review questions and references. The saved summary appears as **Key takeaway** in the reading view. Add an optional related task for context. Choose **Save note**; unsaved edits require a discard decision when closing the editor. Checklist items can be checked from the reading view. Study notes do not add work accomplishments or productive time.

Pin notes you need often, mark them reviewed, and use notebook/tag/search filters to find them again. Manage notebook names with the notebook controls. Archive a note to put it aside, restore it from the archived view, or delete it after confirmation. Editing a note or its checklist clears its previous review mark so it can be reviewed again.

## Export a report

Open **Reports** and choose:

- **Daily report**: set From/To dates, or select All dates. Preview the entries and summary, then **Download CSV**. Daily log also has **Export CSV** for its selected date.
- **Task tracker**: preview the current tracker, optionally include archived tasks, then **Download CSV**.

CSV files open in Excel and other spreadsheet tools. The daily CSV includes planned/actual times, category, ticket, project fields, task, subtasks, Work done, status, remarks, lunch flag, productive minutes and active segments. Its preview shows a shorter set of columns for readability; the download contains the full fields. Formula-like text is protected for spreadsheet opening.

Review the date range and demo-data notice before sharing a report. Sending the file to an executive is a separate action; the app does not email it automatically. CSV is a report format and cannot restore the entire workspace.

## Import an existing tracker CSV

Use **Reports → Import tracker CSV**, choose the file and inspect the preview. Import is enabled only when all rows are valid. It adds new tasks and does not update, merge or deduplicate existing tasks. Importing the same file twice creates another set of tasks.

Required headings are **Task** and **Status**. Headings are case-insensitive. Supported optional headings are:

`Category, Business Unit, By Whom, By When, Latest Update, Type, Priority, Project, Description, Ticket`

Use exact status values `Open`, `In Progress`, `On Hold`, `Closed` or `Cancelled`. Dates use `YYYY-MM-DD`; priorities are `Low`, `Normal` or `High` (blank defaults to Normal). Category and Project names must already exist; matching is case-insensitive. Type matches the current labels in Settings; blank or unrecognized Type becomes Task. An exported `ID` is not reused on import: every imported task receives a new ID. Subtask checklists are not imported by tracker CSV.

Minimal example:

```csv
Task,Status,By Whom,By When,Priority
Review backup results,Open,NPC,2026-10-22,Normal
Update device inventory,In Progress,NPC,2026-10-23,High
```

Save a comma-separated UTF-8 CSV from your spreadsheet. Keep the same number of cells on each row and quote values containing commas or line breaks. The app lists row errors for correction before import. A daily-report CSV is not a tracker import file; use JSON backup to restore daily history.

## Back up and restore

In **Settings → Data & backup**, choose **Download backup**. The versioned JSON file includes tasks, projects, categories, plans, daily entries, timers, study notes and preferences. Keep dated copies outside this browser.

To restore:

1. Download a backup of the current destination workspace first.
2. Choose **Choose backup to restore** and select an OpenWorkLog JSON backup.
3. Check its version, creation date and record counts.
4. Choose **Replace workspace with this backup**.
5. Confirm **Yes, replace workspace** only when the preview is the workspace you want.

Restore replaces all current local records and preferences; it does not merge. An invalid backup is rejected before replacement. Cancellation leaves the workspace as it is.

Your records belong to this browser profile and URL on this device. They do not automatically synchronize between a laptop and phone. To transfer them, use backup and restore, choosing which device holds your latest copy. Avoid editing separate copies in parallel if you intend to replace one with the other later.

## Appearance and offline use

In **Settings → Appearance**, choose Light, Dark, Super dark or System, text size, time display, week start and sidebar preference. Super dark uses near-black surfaces; System follows the device's light/dark preference. In **Settings → Status colors**, choose each status color with its picker or **Hex color** field. Check the Light, Dark and Super dark previews, then choose **Save status colors**. **Reset to defaults** restores the default palette. The app derives readable text and tints, and applies the palette to status controls and charts; the status names keep the meaning clear.

The toolbar theme control cycles through the four appearance options. Animations respect the device's reduced-motion preference.

Hosting the app over HTTPS does not move the existing local workspace. Before changing URLs, download a private JSON backup from the old URL; restore it at the final HTTPS URL after reviewing the destination replacement preview. Keep backups out of the hosting upload. Each device/profile/origin still holds its own records.

After the production app has loaded and cached successfully, use it offline from the same installed app or browser origin. Records save locally while offline. Reconnect to receive app updates. Download backups regularly, especially before clearing site data, switching profiles or changing devices. Offline operation does not provide cloud backup or multi-user synchronization.
