# OpenWorkLog integration contract

Foundation owns package/config, `src/domain`, `src/data`, `src/lib`. Shell owns `src/main.tsx`, `src/App.tsx`, CSS, components and routes. Feature agents own `src/features/<feature>`. All paths below are stable public contracts.

## Reading and writing

`import { useWorkspace } from '../data/useWorkspace'` (adjust relative path). Returns `{ ready, error, tasks, projects, categories, notes, plans, dailyEntries, timers, settings }`. Arrays always exist; `settings` always exists. Gate onboarding on `ready`. No Provider needed. `initializeWorkspace()` from `data/workspace` is awaited by shell before rendering or called on mount. It creates default settings/categories only; `loadDemoData()` explicitly adds labelled demo records; `clearDemoData()` removes only demo records. `settings.onboardingComplete` controls first-run welcome.

`import { actions } from '../data/actions'`: `createTask(input)`, `updateTask(id, patch)`, `deleteTask(id)`; equivalent create/update/delete for Project, Category, Note, Plan, DailyEntry. All async; create returns full saved record. Create input omits `id`, `createdAt`, `updatedAt`, `demo` (demo defaults false). Update accepts Partial of create input. `updateSettings(patch)` returns settings. Category archive uses updateCategory(id,{archived:true}); referenced categories are preserved on deletion. Destructive task/project removal unlinks surviving references atomically. Always catch promise errors at UI boundary and display them.

## Models (`src/domain/models.ts`)

All records: `id:string`, `createdAt:string` ISO timestamp, `updatedAt:string`, `demo:boolean`.
`Status = 'Open' | 'In Progress' | 'Closed'`; `Priority = 'Low' | 'Normal' | 'High'`; `WorkType = 'task' | 'operational' | 'project'`.

- Task: `title,description:string; status:Status; priority:Priority; type:WorkType; categoryId,projectId:string|null; dueDate:string|null` (YYYY-MM-DD); `assignee,ticket,latestUpdate:string; subtasks:{id:string,title:string,done:boolean}[]; archived:boolean`.
- Project: `name,description:string; status:Status; categoryId:string|null; dueDate:string|null; owner,link:string; archived:boolean`.
- Category: `name,color:string; archived:boolean` (color is hex).
- Note: `title,notebook,content,summary,questions,references:string; taskId:string|null; pinned,archived:boolean; reviewedAt:string|null`. Content is plain text/Markdown (never raw HTML injection).
- Plan: `title:string; date:string` YYYY-MM-DD; `startMinute,endMinute:number` 0..1440; `taskId,projectId,categoryId:string|null; notes:string`.
- DailyEntry: `date:string; plannedStart,plannedEnd,actualStart,actualEnd:number|null` minutes of day; `taskId,projectId,categoryId:string|null; title,ticket,projectName,projectLink,subtasks,workDone,remarks:string; status:Status; isLunch:boolean; timerId:string|null`.
- Timer: `taskId,projectId,categoryId:string|null; title:string; state:'running'|'paused'|'review'; segments:{start:string,end:string|null}[]; entryId:string|null`. ISO segments preserve exact time, including across reload.
- Settings (singleton id `'workspace'`, no record metadata): `theme:'light'|'dark'|'system'; sidebarCollapsed:boolean; textSize:'normal'|'large'; workStart,workEnd,lunchStart,lunchEnd:number; timezone:string; timeFormat:'12h'|'24h'; typeLabels:{task:string,operational:string,project:string}; onboardingComplete:boolean; weekStartsOn:0|1`.

## Timer and daily allocation

`data/timers`: `startTimer({title,taskId?,projectId?,categoryId?})`, `pauseTimer(id)`, `resumeTimer(id)`, `stopTimer(id)` (state becomes review, does NOT save entry/close task), `saveTimerEntry(id, dailyEntryCreateInput)` (one entry for this timer, idempotent), `discardTimer(id)`. Only one running/paused/review timer at a time. `domain/time`: `timerElapsedSeconds(timer,now?:Date)`, `allocateMinutes(startMinute,endMinute)` returns `{slot:number,minutes:number}[]` with slot=0..47; `entryMinutes(entry)` returns actual duration excluding lunch; `formatDuration(minutes)`, `todayKey()`, `minuteLabel(minute)`.

## Files and transfer

`data/backup`: `createBackup():Promise<string>` JSON; `parseBackup(text)` validates without mutation and returns typed envelope; `restoreBackup(text):Promise<void>` validates whole input before one atomic replacement transaction. UI MUST require explicit replacement confirmation after file preview. `data/csv`: `exportTasksCsv(workspace)`, `exportDailyCsv(workspace,date?)` return CSV string; `previewTasksCsv(text,workspace)` returns `{rows:TaskCreateInput[],errors:{row:number,message:string}[]}`; `importTasksCsv(rows)` atomic. Preview rejects unsupported statuses. Export guards spreadsheet formula injection. `lib/download`: `downloadText(filename,text,mime?)`.

## Defaults and dependencies

React 19, TypeScript strict, Vite 6 (compatible Node 22.11), Dexie + dexie-react-hooks, Zod, react-router-dom, motion, lucide-react, date-fns, vite-plugin-pwa; Vitest with fake-indexeddb. No localStorage business datasets. Core app is fully local; storage wording is 'Saved on this device'. Foundation is the sole package installer. Theme applies via `data-theme` on document root; shell owns styling. Default work/lunch 08:00–17:00 / 12:00–13:00, timezone Asia/Manila, 24h.

## Contract additions implemented during integration

- Note has optional `tags:string[]`. Settings has optional `ownerName:string`, `notebooks:string[]`; fallback notebook is General. `actions.renameNotebook(previous,next)` and `deleteNotebook(name)` update notes/settings atomically. Deleting General is rejected.
- DailyEntry has optional `planId:string|null`; creating twice with the same plan returns the first entry. `actualSegments?:{startMinute:number,endMinute:number}[]` preserves pauses and precise fractional minutes. Manual time edits must set actualSegments to undefined to replace timer allocation; descriptive-only edits preserve it.
- `timerEntryDraft(timer,settings?)` in data/timers derives review defaults using the configured timezone. `saveTimerEntry` saves one entry for each active local date, atomically and idempotently. `entryAllocations(entry)` in domain/time returns pause-aware slot totals. `entryMinutes` excludes lunch.
- Backup envelope is `{format:'OpenWorkLog',version:1,exportedAt:string,data:Workspace}`. Parser rejects missing references, duplicate IDs, unsupported statuses/versions, invalid calendar dates/timezones and invalid intervals. Restore transaction rolls back even if an insertion fails after tables are cleared.
- CSV daily export appends Productive Minutes and Active Segments to the retained source columns. Categories/projects must already exist for tracker import; preview explains unknown names. Status values are exact and never coerced.
- `useWorkspace.error` is string|null. Storage failure is surfaced to the shell. Business records remain in Dexie only.


## Integrity and plan timer integration update

Timer UTC segments must be chronological and non-overlapping; only a running timer may have one open segment, and it must be last. A timer with a saved entry must be in review state. Backup validation requires reciprocal entry/timer ownership; an overnight timer may own multiple daily entries, with entryId pointing to one of them.

startTimer also accepts optional planId. It captures plan date/times in optional timer plannedDate/plannedStart/plannedEnd fields. timerEntryDraft carries planId, and only copies planned times when actual date matches planned date. Saving upserts the daily entry for planId plus date, preserving its ID. Repeated plan sessions consolidate UTC segments into one saved timer owner and keep overnight entries linked. Calendar plan deletion clears timer and daily planId links while preserving the recorded times.

Daily CSV Productive Minutes is rounded to two decimal places for reporting; Active Segments uses HH:mm:ss bounds. JSON backup retains exact numeric precision.

## Connected work update

My Tasks is the canonical work list. `actions.createPlan` and non-lunch `actions.createDailyEntry` atomically create a task when no task is selected. A daily entry with a planned interval creates or reuses its explicit linked calendar plan; existing `planId`/`taskId` links are reused rather than matching unrelated titles. Lunch/break entries do not generate tasks or work plans. Plan rescheduling updates linked planned-only daily entries; saved actual history retains its date and times. Auto-created tasks have no deadline until the user sets one in My Tasks; scheduled calendar dates remain separate from task deadlines.

Legacy work links are repaired once, in an atomic transaction, when `Settings.connectedWorkVersion` is absent. The version marker is retained in JSON backups. Newly created workspaces and newly restored backups with the marker do not recreate intentionally deleted tasks. Restoring a valid older backup upgrades its links once. Work metadata and demo flags are retained; no historical records are deleted.

Timers accept optional `sourceEntryId`; it is distinct from saved reciprocal `entryId` ownership. Starting from a daily entry captures its task, plan, planned date/times and safe descriptive fields. `sourceDetails` holds ticket/project/subtask context. Review work text is new session text and is appended to retained history. Saving upserts the source entry for its actual date; overnight sessions create date-specific daily entries that share one canonical task. Timer save never closes the parent task.

Deleting a calendar plan sets optional `calendarDetached` on its remaining daily/timer records. This preserves retained planned times without recreating the deleted plan during a later description edit or timer save. An explicit change to the daily planned interval can attach a new plan. Deleting a source daily entry clears `Timer.sourceEntryId` atomically. Backup validation checks the optional source reference and continues accepting older version-1 backups without these optional fields.

Settings validation and defaults now live in `src/domain/settings.ts`, re-exported through `models.ts`. Theme supports `black` for Super dark, alongside light, dark and system.

Optional taskDetached markers on Plan, DailyEntry and Timer preserve explicit Task deletion through ordinary history edits, plan rescheduling, timer starts/saves, reload and backup restore. Selecting an existing task explicitly reattaches the work. Manual planned bounds added at timer review apply only to the selected review date; other overnight dates retain only their own existing or captured planned context.
