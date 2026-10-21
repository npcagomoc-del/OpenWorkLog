# OpenWorkLog user guide

Developed by NPC.

OpenWorkLog keeps your task tracker, project list, calendar plans, daily report and study notes in one local workspace. The calendar and planner are built into the app. They do not connect to Outlook.

For installation, hosting and offline setup, read the [setup guide](SETUP.md).

## Start your workspace

On the welcome screen, choose **Start with blank workspace** for real work or **Explore demo workspace** to try example records. Open **Settings** to set your name, schedule, time zone, work labels and categories.

The default working day is 08:00–17:00, with lunch at 12:00–13:00. Daily log still supports the entire 24-hour day.

On a desktop or tablet, use the navigation sidebar. **Collapse navigation** reduces it, and **Focus view** in My tasks gives the task list more space. Use **Exit focus** or press `Esc` to leave focus mode. The top toolbar also has search and theme controls. `Ctrl+K` on Windows or `Cmd+K` on macOS opens search for tasks and notes.

On a narrow phone screen, the bottom bar opens Today, Tasks, Daily Log and Notes. Use **More** or the menu button for Projects, Calendar, Reports and Settings. Wide tables scroll horizontally inside their own area; swipe across the table to see the remaining columns.

## Keep your task tracker up to date

1. Open **My tasks → New task**.
2. Enter a title and choose its work type, category, status and priority.
3. Add an owner, due date, ticket, project, description, latest update or subtasks as needed.
4. Save the task.

Use the same three statuses throughout the app:

| Status | Color | Use |
| --- | --- | --- |
| Open | Blue | Work has not started or still needs action. |
| In Progress | Yellow | Work is underway. |
| Closed | Green | Work is finished. |

Choose **List** for readable task summaries, **Table** for the tracker columns, or **Kanban** for the three status groups. Change a task's status with its status selector or **Move to** control. Kanban uses explicit status controls; dragging cards is not required.

Search by task, ticket or update. Filter by status, category or work type. Click the task title to edit its full details; use its pencil control for a quick rename. **Export CSV** exports the tasks currently matching the My tasks filters.

Deleting a task requires confirmation. Saved daily entries, plans and notes retain their content, but their link to the deleted task is removed. Download a backup before removing information you may need later.

## Organize projects and operational work

Use **Projects** to create and edit projects with a name, owner, due date, category, status and optional link. Link related tasks to the project in the task editor. Open the project's task list to see that project's work together.

Operational work is a work type on the task tracker. You can rename the display labels for Task, Operational and Project in **Settings → Labels & profile**. This changes the workspace terminology while keeping record links intact.

Use **Settings → Categories** to add a category and color, rename it, or archive it. Save each edited category. Archiving keeps its name on existing records and hides it from new work selections. Restore it when it is needed again.

## Plan work on the calendar

Open **Calendar**, choose a day, week or month view, and add a plan. Set its date, start/end times, title, linked task, project, category and notes. Plans describe intended time; they do not count as actual productive time.

Open a plan to:

- **Edit plan** or delete it.
- **Log work from this plan** to open a linked daily entry with its planned times.
- **Open daily entry** when that plan already has an entry.
- **Start timer now** to measure work from the current time, keeping planned time separate.

Finish or review the active timer before starting another. Deleting a calendar plan keeps the linked task and saved daily work history.

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
| Entry status | Open, In Progress or Closed for this daily entry. |
| Remarks | Follow-up information or context. |

Time entry fields use 24-hour `HH:mm`, even when you choose another display format in Settings. Enter both start and end for a time interval. For manual work spanning midnight, create one entry for each date; use `24:00` as the first date's end and `00:00` as the next date's start.

An activity can span several half-hour slots. Keep it as one entry with its real times; the timeline allocates the appropriate minutes to each slot. For example, 13:10–13:42 contributes 20 minutes to 13:00–13:30 and 12 minutes to 13:30–14:00.

Lunch is part of the record. Click a lunch slot and save an entry with **Lunch / break — exclude from productive time** selected. The lunch shading is a schedule guide; it does not create a saved lunch record by itself. Lunch/break entries are excluded from productive-time totals.

Click a saved activity to edit it. Use **Manage this day's entries** for the day's list and deletion controls. Entries without planned or actual times remain in **Without a time** until you assign an interval.

The daily entry status is separate from its linked task's status. Saving a report or a timer does not automatically close the task.

## Use the timer

1. In **Daily log**, select a linked task or choose a standalone activity.
2. Enter a session name and choose **Start timer**. You can also start from a calendar plan.
3. Use **Pause** for time that should not count, then **Resume** when working again.
4. Choose **Stop and review**.
5. Review the linked details, write **Work done**, choose the entry status and **Save work log**.

Only one unfinished timer is allowed. Its state and time segments are saved locally, so a reload does not reset it. A running timer continues to accrue elapsed time while the app is closed; pause or stop it before leaving if that time should not count. Paused time is excluded. A session spanning midnight is allocated to the relevant daily dates using the workspace time zone.

Closing the review leaves the session available through **Review session**. **Discard** removes that unfinished timer after confirmation; saved work logs and linked tasks remain.

Timer review shows measured actual times as read-only. After saving, open the daily entry to correct them if necessary. Changing actual times replaces that entry's saved timer segments with the manual interval. Work from a calendar plan stays linked to its daily entry rather than creating a new row each time you reopen it.

## Read the dashboard

The dashboard separates the selected day's activity from the whole workspace:

- **Daily tasks** shows daily entry counts, productive time and entry statuses for the selected date. Lunch and breaks are excluded.
- **Your day, in detail** opens the underlying daily entries.
- **Where time went** groups actual productive time by category. Planned time is excluded.
- **Portfolio overview** shows current unarchived task and project status counts, plus tasks due by the selected date.

Changing the dashboard date changes the daily figures. The portfolio remains the current saved tracker, not a historical snapshot of task statuses.

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

`Category, By Whom, By When, Latest Update, Type, Priority, Project, Description, Ticket`

Use exact status values `Open`, `In Progress` or `Closed`. Dates use `YYYY-MM-DD`; priorities are `Low`, `Normal` or `High` (blank defaults to Normal). Category and Project names must already exist; matching is case-insensitive. Type matches the current labels in Settings; blank or unrecognized Type becomes Task. An exported `ID` is not reused on import: every imported task receives a new ID. Subtask checklists are not imported by tracker CSV.

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

In **Settings → Appearance**, choose Light, Dark or System, text size, time display, week start and sidebar preference. The toolbar theme control cycles through appearance options. Animations respect the device's reduced-motion preference.

After the production app has loaded and cached successfully, use it offline from the same installed app or browser origin. Records save locally while offline. Reconnect to receive app updates. Download backups regularly, especially before clearing site data, switching profiles or changing devices. Offline operation does not provide cloud backup or multi-user synchronization.
