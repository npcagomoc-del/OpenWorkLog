# OpenWorkLog Design System

## 1. Atmosphere & Identity
A compact personal operations workspace: task-first navigation, Fluent legibility and restrained Apple surface depth. The supplied v3 mockups are workflow references; the user explicitly approved Apple refinement. Preserve blue navigation, readable tables and a persistent workspace. Five task, project and daily-work statuses are Open, In Progress, Closed, On Hold and Cancelled. Use system typography, no stock imagery. Signature: an original blue open-ring / folded-worklog mark, quiet blue selection wells, white raised controls against a warm-cool neutral canvas. Developed by NPC appears in navigation/footer. Primary persona is an operations professional scanning many tasks on desktop and tablet; secondary persona captures work from a tall phone. Both need understandable persistent state, large targets and honest offline storage wording. Current-app screenshots identify defects to repair; they are not a pixel-clone target.

References consulted: supplied v3 dashboard, frontend image-to-code, Apple, layout, interaction and perfection guidance. beui.dev tabs source informed keyboard selection and immediate reduced-motion behavior. This is an approved-reference implementation, not a new concept campaign.

Primary design references checked for the release:
- [Microsoft Fluent design tokens](https://fluent2.microsoft.design/design-tokens/): reusable values for color, typography, spacing and elevation.
- [Microsoft Fluent color](https://fluent2.microsoft.design/color) and [typography](https://fluent2.microsoft.design/typography): consistent readable surfaces and type hierarchy.
- [Apple color guidance](https://developer.apple.com/design/human-interface-guidelines/color): sufficient contrast across appearances.
- [Todoist boards](https://www.todoist.com/inspiration/kanban-board): alternative task-list and board views. OpenWorkLog uses its own five requested statuses and original interface.
- [Microsoft Planner task management](https://support.microsoft.com/en-us/planner/training/manage-your-tasks-in-microsoft-planner): independent filtering and grouping controls, with a move between groups changing the grouped property.
- [Fluent layout](https://fluent2.microsoft.design/layout): proximity communicates related information; four-pixel spacing ramp and responsive target sizing.

## 2. Color
Tokens below are implemented in src/styles/tokens.css. Light / dark:
- --bg: #f5f6f8 / #111317
- --surface: #ffffff / #1b1e24
- --surface-soft: #f0f2f5 / #242830
- --surface-hover: #e9edf3 / #2d333d
- --sidebar: #f8f9fb / #171a20
- --text: #202733 / #f1f3f7
- --muted: #5f6b7c / #a8b2c1
- --border: #dce1e8 / #363e49
- --accent: #0969c7 / #77b5ff; --accent-hover: #0555a7 / #a0ccff
- --accent-soft: #e6f0fc / #223953
- --on-accent: #ffffff / #11243b
- --open: #0969c7 / #8bc0ff; --open-bg: #e6f0fc / #223953
- --progress: #604700 / #493c12; --progress-bg: #fff0b3 / #f6d66b
- --closed: #207145 / #8bdeb0; --closed-bg: #e2f3e9 / #203f30
- --danger: #b52e3c / #ff9ba6; --danger-bg: #fff0f1 / #492a30
- --scrim: rgba(14,22,35,.36) / rgba(0,0,0,.58)
Status uses text plus color. All five statuses must remain identifiable without color. Neutral badges are allowed for metadata such as Demo or Archived. The revision palette below supersedes the older Progress values above and in the historical verification notes.

Revision palette: use a darker ochre/yellow In Progress seed #b58a16, blue Open #0969c7, green Closed #207145, muted purple On Hold #79628e and neutral rose-gray Cancelled #7c696d. These are editable status color seeds, not unconditional text colors. Derive contrast-safe foreground/background pairs per theme; preserve hue in marker/chart swatch and use readable neutral foreground when needed. No bright yellow slab in dark mode. Store the five seeds in appearance preferences with individual previews and Restore defaults. Shared controls, badges, board headers and dashboard/report charts must consume the same resolved palette. Text contrast is at least 4.5:1; meaningful graphic boundaries at least 3:1. Arbitrary user colors cannot override readability.

## 3. Typography
System font: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif. Mono only for timer: ui-monospace, SFMono-Regular, Consolas, monospace. --text-xs 12px metadata; --text-sm 14px; --text-base 16px; --text-lg 18px; --text-xl 22px; --text-2xl 28px; --text-3xl 36px stats. Body line-height 1.5. H1 28px/1.2 650 weight, letter-spacing -.025em. No oversized hero. Settings large text uses root 18px instead of 16px with rem scale.

## 4. Spacing & Layout
Four-pixel rhythm: --space-1 4px, 2 8px, 3 12px, 4 16px, 5 20px, 6 24px, 8 32px, 10 40px, 12 48px. --radius-sm 8px controls; --radius 12px panels; --radius-lg 18px dialogs; --radius-pill 999px badges. Minimum control target 44px. Sidebar 248px, collapsed 76px. Toolbar 72px. Main padding clamp(16px,2.5vw,40px). Wide content max 1440px; focus mode full width. App is a 100dvh fixed-sidenav/scroll-body shell. Header/sidebar/bottom nav stay fixed in grid; main owns vertical scrolling. Every grid/flex shrink child has min-width/min-height zero. Tables may have a named horizontal viewport. At <=700px sidebar becomes modal drawer plus five-item bottom navigation, main single column. 701-1050px sidebar rail by default; manually expand via menu. Intrinsic card grids use minmax(min(16rem,100%),1fr).

## 5. Shared Components API
Import named exports from src/components/ui (or relative equivalent). Every component accepts className where relevant. All CSS is token-based. Feature pages own their feature CSS under src/features; global generic classes below are available.

- Button: native button props + variant?: 'primary'|'secondary'|'ghost'|'danger', size?: 'sm'|'md', busy?: boolean. Default secondary, type button. Busy disables and displays progress text.
- IconButton: native button props + label:string, children; label supplies aria-label/title. 44px target.
- Card: div props, children; subtle border and shadow; use className='card-pad' for standard padded panel.
- PageHeader: title:string, description?:string, eyebrow?:string, actions?:ReactNode. One h1, wrapping actions.
- StatusBadge: status:'Open'|'In Progress'|'Closed'|'On Hold'|'Cancelled'. Text and colored dot for read-only contexts. Do not duplicate it beside a visible StatusControl for the same record.
- StatusControl: one labeled native select styled with the resolved status palette; current value is both the status indicator and editor. All five options; default/hover/focus/disabled/saving/error states. Never pair with a redundant status badge in the same task row. Restore the previous saved value after a failed change and expose the error.
- Badge: children, tone?:'neutral'|'blue'|'green'|'yellow'|'red'. Metadata only.
- EmptyState: title:string, description:string, icon?:ReactNode, action?:ReactNode.
- Field: label:string, htmlFor?:string, hint?:string, error?:string, children. Pass native labeled input/select/textarea as children. All native controls styled globally; use .input/.select/.textarea if needed.
- Modal: open:boolean, onClose:()=>void, title:string, children, footer?:ReactNode, size?:'sm'|'md'|'lg'. Native dialog showModal; trap, Escape, backdrop and return-focus handled. Body owns scroll.
- SegmentedControl<T extends string>: value:T, onChange:(value:T)=>void, options:readonly {value:T,label:string,icon?:ReactNode}[], label:string. Semantic button group with aria-pressed; arrow/Home/End navigation. Never fake tabpanel roles.
- Notice: children, tone?:'info'|'success'|'warning'|'error'. role status or alert.
- Spinner: label?:string.
- ToastProvider + useToast(): {toast:(message:string,tone?:'success'|'error'|'info')=>void}. Provider owned by shell; transient nonblocking status with dismiss button.
- ConfirmDialog: open,title,description,onConfirm,onClose,confirmLabel?,busy?,destructive?; built over Modal.
- Brand: compact?:boolean. Original inline SVG and OpenWorkLog wordmark.

Layout helpers: .stack (gap 16), .cluster (wrap row gap 12), .split (justify-between wrapping row), .muted, .small, .card-pad, .form-grid (responsive 2 columns), .field-full, .table-scroll, .data-table, .stat-grid, .stat-card, .page-stack, .visually-hidden, .text-link. Do not add a header bar inside a feature: page header belongs inside main.

Required states: controls default/hover/press/focus/disabled/busy; fields error/hint/read-only; lists empty; modal open/Escape/return-focus; segmented selected/unselected/keyboard. Showcase at /design exercises these before composition.

## 6. Motion & Interaction
--motion-fast 120ms and --motion-normal 200ms, --motion-slow 320ms, --ease-out cubic-bezier(.2,.8,.2,1). Button press scale .98 signals actuation. Route content opacity/translateY(6px) 200ms communicates navigation. Dialog opacity/scale(.98) 200ms and backdrop opacity signal layering. Toast opacity/translateY(8px) 200ms signals saved feedback. Selected segment surface lifts with shadow; selection instant and keyboard predictable. Sidebar width changes without layout animation. No ambient floating, pulsing cards or count-up fake data. No new motion library: CSS suffices for non-gesture feedback. prefers-reduced-motion removes transforms/animations and smooth scrolling.

## 7. Depth & Surface
Mixed restrained borders plus soft Apple-style surface stepping. --shadow-sm: 0 1px 2px rgba(20,35,55,.04), 0 3px 10px rgba(20,35,55,.025); --shadow-md: 0 8px 30px rgba(20,35,55,.09); --shadow-lg: 0 24px 80px rgba(0,0,0,.22). Resting panels subtle; selected controls and overlays lift. No heavy glass or backdrop blur dependencies. Primary button subtle inset white highlight; logo uses its own blue ramp #0a70cb,#3aa3f5,#0753a5.

## 8. Accessibility Constraints & Accepted Debt
WCAG 2.2 AA intent: body contrast 4.5:1, controls 3:1, visible 3px focus, labels for all icon controls, touch targets >=44px, dialog focus trap/return, live feedback, text status, reduced motion. Skip link enters main. Offline says Saved on this device; no false cloud-connected badge. No accepted accessibility debt. Root owns final browser evidence and release approval; physical-device testing is unverified until explicitly performed. Dev tools are development-only, never loaded by production.


## Implementation verification (2026-10-21)
Shared primitives and app shell are implemented in src/components and src/app. Feature routes lazy-load inside the persistent shell. IAB desktop manual checks: showcase controls rendered, native dialog opened, Escape closed and restored focus; demo onboarding opened dashboard; theme switched system-dark to light; sidebar collapsed; focus hid sidebar; global search found task/note data and task result applied its query. TypeScript passes. Owned primitive lint has no errors (only TS index-signature syntax advisory). Production build passes, PWA assets generated, no dev diagnostic chunks in output. Root/release owns remaining mobile/tablet and production acceptance evidence.

Development diagnostics: react-grab and react-scan are installed and opt-in using VITE_ENABLE_REACT_DEVTOOLS=1, gated again by import.meta.env.DEV. React Doctor's current dependency requires newer Node than the host22.11; the bundled runtime may be used for static diagnostic audit. This does not affect production application behavior.

Calendar feature geometry: half-hour row 3.5rem (56px), time gutter 4rem (64px), week min-width 56rem with a named horizontal viewport; time canvas max-height 46rem. These preserve readable 44px-or-larger time targets. Body font is available as --font-body for timer captions and feature controls. Native [hidden] always wins over control display styles; visually-hidden helpers are anchored at inset0 to avoid offscreen overflow.

## Connected work and interaction update

My Tasks is the canonical work list. Creating a non-break daily activity or Calendar plan creates or links a task atomically; lunch/break records stay in the daily log. Explicit source IDs connect timers, plans and daily records, preserving manual corrections and history. Scheduled work is available directly in the timer chooser, with its planned date/window visible.

Super dark uses the explicit `black` theme: canvas #000000, surfaces #101010/#181818, hover #242424, sidebar #080808, text #f5f5f5, muted #b0b0b0 and border #363636. Blue stays an interactive or status accent rather than tinting neutral surfaces. Existing Light, Dark and System remain. Toolbar cycle: System, Light, Dark, Super dark.

Task-board and Calendar drag handles support pointer, deliberate touch activation and keyboard movement. Drag state, valid targets, cancellation and saved changes must be visible and announced. Explicit status selectors and plan editing remain available. Reduced motion removes drag/drop transitions without disabling movement.

The Executive dashboard uses actual local workspace records. Current task/project portfolio counts remain distinct from date-filtered work logs. Planned and logged time are labeled separately, breaks excluded from productive hours, and no utilization, staffing or forecast figures are invented. Charts include readable values and text/table equivalents.

Super dark semantic tokens: accent/Open #8bc1ff, accent-hover #b8d9ff, accent-soft/Open-bg #142235, on-accent #061c30, Progress text/background #3b2d00/#f6d66b, Closed #9de3b6/#12301d, Danger #ffacb4/#3a151b, and a black 72% overlay scrim. Neutral black shadows preserve layering. Native form controls and browser theme-color follow the active appearance.

Calendar drag interaction uses a 44px handle, 6px mouse activation, 200ms deliberate touch hold with 8px tolerance, and Space/arrows/Enter/Escape keyboard controls. Half-hour targets retain plan duration and reject a destination beyond midnight rather than truncating time. Drag overlays and target highlights use existing semantic/motion tokens.

Executive visualization primitives are a status ring and grouped actual/planned activity bars, with visible legends, decorative SVG and expandable exact-figure tables. Activity uses no more than 14 date buckets, with a keyboard-accessible horizontal viewport when needed. Current unarchived portfolio counts are separate from dated activity; project entities count once, project-type child tasks stay task records, and planned blocks are deduplicated by plan ID. Recorded history can retain archived-task owners without adding archived work to the current portfolio.

Calendar auto-scroll activates only in the outer 8% edge zone, avoiding unintended slot changes during ordinary drops. Keyboard scheduling commits the explicitly selected semantic date/time even when a visual drag rectangle reaches the final-row boundary; exact end at 24:00 is valid, later end times are rejected with feedback. Timer context links reuse the 44px text-link primitive.

Active drag sources remain fully readable, with a dashed semantic outline instead of opacity dimming. Decorative drag previews are hidden from assistive technology and do not accept pointer input; the focused source and live announcements remain accessible. Calendar slots covered by an existing plan cannot open a second create action, while their drop targets stay available. Visible drop labels and accessible names describe the same destination.

## Compact tracker and Planner revision (2026-10-21)

This section is the current interaction contract and supersedes earlier three-status assumptions. It specifies design intent; implementation and browser verification are recorded separately.

### Task rows and board

- Desktop list row baseline is 56px, using 4px vertical and 12px horizontal padding and 8–12px gaps. Content may grow for large text or narrow screens. Keep 44px interactive hit targets; reduce decoration and redundant rows rather than shrinking targets. Title is the dominant text and opens the editor; status is one StatusControl; secondary actions live in a labeled overflow menu. Remove permanent Rename/Delete buttons and duplicate status badge/select pairs.
- Secondary metadata sits on one restrained line when present; missing optional metadata creates no blank line. Avoid expanded labels for every field. Table cells use compact padding, tabular dates and one status column. Full title remains available in the editor; do not require hover to access it.
- Board toolbar: view selector, Group by, Filters with active count/Clear, and Card details. Group by supports Status, Category, Project and Business Unit. Filters narrow the data independently of grouping. Keep current selections when changing views; persist display preferences without persisting business data outside its normal database.
- Board columns are 280–320px wide, with 12px column gaps; columns use a named horizontal viewport, never squeeze five columns into unreadable slivers. Column heading includes name and visible count. Cards have 12px padding, 8px internal gap and 8px separation. Title may occupy two lines. Avoid empty minimum-height cards and giant Move to selectors.
- Card details toggles control due date, priority, project, category and Business Unit metadata. Default is due date and priority, with other fields available. Status remains visible when grouping by another property. Opening a title exposes complete content, while an overflow provides edit/delete and an explicit movement alternative. Do not repeat the column name on every card when grouping already communicates that field.
- Status grouping has five drop destinations. Category/project/unit grouping changes only that grouped field on drop, including an explicit Unassigned group for missing values. Unsupported grouping movement must be visibly disabled with an edit alternative; never silently change status in a category column. Announce destination and saved result; retain keyboard and touch movement behavior.
- Phone list becomes a compact two-line arrangement with title, status and overflow; no horizontal page overflow. Board remains a deliberate horizontal column viewport with keyboard access. Menus must stay within the viewport and return focus to their trigger. Empty filter results explain that filters are active and offer Clear filters.

### Calendar duration resizing

The supplied 7.57-second Outlook video was extracted at 2fps. Frames 001–007 show a three-hour block moving; frame 009 shows a selected 15:00–18:00 block with centered top/bottom edge handles; frames 011–015 show the bottom contracting to 16:30 while the top remains at 15:00. The requested expansion is duration resizing, not expansion of task details. Start-edge resizing is the symmetric product design, not separately proven by the clip.

- Keep movement and duration controls distinct. Moving preserves duration; top edge changes start while preserving end; bottom edge changes end while preserving start. Render a small centered edge marker with a 44px target; use a vertical-resize cursor. Show handles on selected/focus state and provide a discoverable touch/editor alternative. Hit areas must not overlap each other or swallow the title/move action in a half-hour block.
- During drag, preview the interval and block bounds against the half-hour grid. Use 30-minute snap and minimum duration. Restrict bounds to 00:00–24:00; allow exact midnight end, reject reversal/out-of-day changes with feedback. No layout transition while following a pointer; geometry tracks the gesture immediately.
- Commit once on pointer release or keyboard confirmation. Escape/pointer cancellation restores original geometry without saving. Keyboard focus on an edge supports arrows in 30-minute steps and Enter to commit; announce new bounds and duration. Lost pointer capture must not accidentally commit stale state. Editor time fields remain an equivalent alternative.
- Resize preserves plan/task/project/unit IDs and updates linked planned-only daily bounds through existing atomic actions. Recorded actual work is historical and never stretches to match a plan. A small timer action uses a play icon with accessible Start timer label and 44px hit target; it does not occupy a second oversized block row.

### Daily activity, timer and Business Unit

- Business Unit is optional on task, project and daily entry forms; present an explicit Unassigned choice. Preserve a stored unknown/retired value in historical records. Group/filter by unit without treating unassigned as an error or inferring a unit from title.
- Daily half-hour rows have a 72px (4.5rem at normal text size) minimum, with intrinsic content growth when short entries, larger text or wrapped labels need more space. Preserve 44px controls and avoid nested card scrollbars. A daily activity spanning several half-hour slots reads as one activity across those slots. Recorded activity is placed on its actual interval; planned-only activity uses its planned interval. Never span the union of widely separated planned and actual intervals. Retain the other interval as explicit text for comparison. Show title/status/actions once, retain slot grid lines/time labels, and expose its actual interval and duration. Multiple records or pauses must stay distinguishable; grouping is presentation only and must not duplicate work or merge unrelated IDs.
- Timer shows HH:mm:ss using tabular/mono digits, including seconds in review where meaningful. Starting another task begins a new session at zero unless the user explicitly resumes an existing timer. Historical minutes and prior segments never appear as elapsed time of a new session.
- Closed and Cancelled are terminal but distinct; Cancelled must not count as completed. On Hold stays visible as paused work. All five statuses appear in filters, summaries and legends. Any overdue policy involving On Hold is explicit; exclude Cancelled from actionable overdue counts. Empty calendar/daily slots have no status.

### Revision acceptance evidence

Root owns production browser acceptance at 375/768/1280px, light/dark/black and large text. Required evidence: compact rows with long/missing metadata, five-status control keyboard and error states, board group/filter/card-detail changes, status and nonstatus drops, live resize/cancel/save/reload with linked records, a half-hour block with nonoverlapping controls, a multi-slot activity shown once, timer stop/save/new-session zero and seconds, and contrast-safe custom colors reflected in charts. Screenshots alone cannot prove keyboard, pointer, storage or screen-reader behavior. No new accessibility debt is accepted by this design contract.
