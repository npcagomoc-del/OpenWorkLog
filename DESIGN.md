# OpenWorkLog Design System

## Current mobile focus, appearance and handwriting contract (2026-10-21)

This bounded revision supersedes conflicting phone Calendar, focused-board and appearance instructions below. It is a design specification, not a claim of completed browser or physical-device verification. Preserve the existing data, linking, resize and keyboard contracts.

### Reference evidence and intent

Both supplied 922 x 2048 screenshots were viewed. Outlook reference `codex-clipboard-00312320-c982-498f-a150-7ac9c8d5f1a0.png` establishes a compact month/date band, seven-day strip, a wide single-day time canvas, restrained horizontal rules and category-colored event surfaces. Its approximately 152px time gutter and 766px event field establish a roughly 1:5 gutter/content relationship at image resolution; they are not CSS-pixel measurements. The OS status bar, Android gestures, avatar, Mail/Apps navigation, Copilot control and work-location row are not requested OpenWorkLog content. Do not copy them. Defect screenshot `codex-clipboard-31ab6187-a0c9-42fa-bf28-362225a4e985.png` shows introduction, counters and expanded controls consuming most phone height before the first task; these are the specific density defects to remove in focus mode.

Loaded frontend design router, image-to-code, interaction, perfection, Apple and Claude references and designpowers review guidance. The existing-project/reference branch applies; no new concept-generation campaign is required. Claude contributes warm parchment, warm charcoal, terracotta and quiet ring containment; Apple contributes neutral surface stepping, concise utility typography, blue actions and restrained rounded controls. Keep original OpenWorkLog branding and existing system fonts. This is inspiration for a working tool, not either brand's marketing layout.

### Focus frame and geometry

The reusable focus-frame contract applies to Calendar, Kanban and handwriting: `100dvh`, safe-area padding, `min-height: 0` shrink chains and one clearly owned content scroll region. Focus hides the app toolbar, sidebar, bottom navigation, marketing introduction, statistics and footer; a visible 44px Exit focus control stays in the feature toolbar. Entry/exit preserve date, filters, selection, scroll position where practical and unsaved content. Escape exits focus only when no dialog or active gesture owns Escape. Exit must never be hover-only. No browser-fullscreen API is required.

New geometry tokens: `--focus-toolbar-height: 56px`, `--focus-strip-height: 56px`, `--focus-inset: 8px`, `--phone-time-gutter: 52px`, `--calendar-slot-height: 56px`, `--board-phone-lane: 304px`, `--ink-toolbar-row: 56px`. These are normal-text baselines; large text may grow controls and must not clip them. Shared target floor remains 44 x 44 CSS px.

| Viewport | Calendar focus | Kanban focus | Handwriting focus |
| --- | --- | --- | --- |
| 375px phone | 56px command row + 56px week strip; one day; 52px time gutter; about 307px event field after 8px side insets; remaining height scrolls | At most two 56px control rows; 304px column with 12px gap and next-lane glimpse; remaining height is the board | At most two 56px toolbar rows, paper takes remaining height; settings may open a sheet |
| 430px phone | Same day-first composition, about 362px event field; seven equal day targets fit | 320px columns, 12px gap; clear next-column glimpse | Wider paper, same 44px controls and aspect-preserving stroke coordinates |
| 800 x 1280 portrait tablet | Focus can use full 800px; Day is available and spacious; explicit Week retains named horizontal viewport and minimum lane widths | 320px columns, two visible plus next glimpse | Paper centered up to 960px, no notes-list pane in writing focus |
| 1280 x 800 landscape tablet | Existing Week or Day preference; 64px standard gutter, 56px half-hour row, remaining-height scrolling | 304–320px columns; several visible; no squashed five-column layout | Single 56px toolbar when it fits; paper uses remaining height and scrolls deliberately |

At 375/430 normal text, first timeline row or column heading should begin within 112px of the usable focus viewport top, excluding safe area. This is the key usable-space acceptance target. Expanded menus/sheets and large text may exceed it. Avoid double-scroll page wrappers and an artificial 46rem height cap in focus mode. Keep deliberate board/week overflow inside its labeled keyboard-focusable viewport, never on the whole page.

### Calendar and board behavior

Phone Calendar defaults to a single selected day without discarding an explicit user view choice. Seven equal day buttons include weekday and date; selected date has an unmistakable filled/outlined treatment and accessible full date. The top command row provides month/date context, Today or date navigation, Add and Exit; overflow holds secondary view controls. Do not duplicate the month strip with a large Calendar heading and description. Date controls must not compete with the timeline for several toolbar rows. Show current-time rule only for today and never alter scroll while the user edits or drags.

Calendar event surface/edge inherits its linked task category color. Category identity, task status and action accent are separate systems: category controls event identification; StatusBadge/StatusControl keeps the five status colors; action accent controls buttons/focus/selection. Include category text in details/accessibility and a compact visible category cue when space permits; color alone is insufficient. Unknown/unassigned categories use a neutral surface, not a fabricated category. Category changes must be reflected consistently without rewriting historical actual-time records. Resolve custom category colors to readable foreground/tinted surface pairs; keep 4.5:1 text and 3:1 meaningful edge/focus contrast. Existing overlap lanes and exclusive body/resize/move hit zones remain valid, even when a dense day needs local horizontal scrolling.

Kanban focus exposes only a compact board title/context, Exit, Add, and essential view/group/filter access. Hide the eyebrow, descriptive sentence, status-summary tiles, management links and persistent search field from the initial focused surface; search/filter/details remain available through a labeled control or sheet. Active filters retain a count and Clear affordance. A compact second toolbar row is allowed; never recreate the defect screenshot as stacked full-width cards. Column headers remain readable while scrolling; titles open details; explicit move/edit alternatives remain available. Grouping behavior still changes only the grouped property.

### Selectable surface presets and action accent

Keep Light, Dark, Super dark and System brightness choices. Add independently selectable surface styles: Default, Apple-inspired and Claude-inspired. Prefer plain labels such as Apple and Warm in compact controls, with descriptive help clarifying inspiration. A surface preset must not overwrite status/category seeds. Add a separate editable Button color/action accent and restore default action. Preserve saved preferences across reload and handle older preferences with defaults.

Apple light seed roles: canvas `#f5f5f7`, surface `#ffffff`, text `#1d1d1f`, muted `#6e6e73`, border `#d2d2d7`, action `#0071e3`, hover `#0066cc`. Apple dark seed roles: canvas `#000000`, surface `#272729`, raised `#2a2a2c`, text `#f5f5f7`, muted `#b0b0b5`, border `#505055`, action `#2997ff`. Claude light: canvas `#f5f4ed`, surface `#faf9f5`, raised `#e8e6dc`, text `#141413`, muted `#5e5d59`, border `#c2c0b6`, action seed `#c96442`, hover seed `#b85133`. Claude dark: canvas `#141413`, surface `#30302e`, raised `#3d3d3a`, text `#faf9f5`, muted `#b0aea5`, border `#5e5d59`, action seed `#d97757`. Super dark retains its pure black canvas across presets. These are seeds: action/on-action and muted pairs are contrast-checked and adjusted, not blindly painted white-on-terracotta. Status colors remain independently editable. Warm style uses existing 8/12px controls, subtle warm ring borders and no decorative gradients; utility text stays sans-serif for fast scanning.

### Persistent handwriting in Study Notes

Notes retain editable typed content alongside an optional ink area; adding handwriting never replaces or clears existing notes. Writing focus promotes the paper and hides the notes list/introduction. Paper is stable white `#ffffff` with dark ink default `#202733`, subtle optional ruled guide `#e5e7eb`, and an explicit boundary against dark chrome. This intentional document surface does not invert stored ink when app theme changes. Default swatches may reuse existing blue, red and green seeds; custom ink remains literal user content, with a readable preview. New pen widths: 2px, 4px, 8px in logical paper coordinates. Canvas/paper has a persistent logical coordinate system; resize, rotation and device-pixel-ratio changes redraw existing strokes without shifting/cropping them.

InkToolbar: Pen, whole-stroke Eraser, labeled color and width controls, Undo, Redo, optional Clear with confirmation, and Exit focus. Every target is 44px. Selected tool uses text/icon plus pressed state; undo/redo disabled states are honest. Use a concise saved/saving/error status; failure keeps recoverable local draft strokes and does not claim Saved. Save completed stroke edits, erasures and undo/redo to the existing note persistence; reload and note switching must restore them. Ink belongs in normal backup/export/import preservation wherever note data is preserved; legacy notes without ink still load. Do not claim handwriting recognition or OCR.

The initial document is 1200 x 900 logical units, displayed proportionally; preserve this coordinate extent in persisted ink data. On short landscape displays the paper scrolls within its named region rather than squeezing toolbar targets. An existing native Modal may host writing focus if it provides the same remaining-height paper, visible Exit and keyboard-focus behavior.

Pointer Events distinguish pen, mouse and touch. Pen mode accepts pen and deliberate mouse drawing; touch scrolls by default, with a clearly labeled Draw with finger option. Ignore additional touch contacts while a pen stroke is active, capture one drawing pointer, and resolve pointer cancellation/lost capture without a stuck stroke. Pressure is normalized 0–1; use a stable fallback width for hardware with no useful pressure instead of dropping the stroke. Sample coalesced events when supported; the basic pointer path must still work. Apply touch-action policies only to the drawing region and relevant drawing mode; keep the rest of the page navigable. This is browser-level contact filtering, not a guarantee of hardware palm rejection.

Canvas has a descriptive accessible label and adjacent typed notes provide the accessible content alternative. Toolbar is keyboard operable; Undo/Redo shortcuts are scoped so text editing retains its normal shortcuts. Explain the whole-stroke eraser behavior. Drawing updates immediately; no entrance animation or spring follows the ink. No new motion library is needed. Reduced motion retains direct stroke rendering and instant tool selection.

### Sources, acceptance and limitations

The [beui tabs source](https://beui.dev/r/tabs/raw) informed persistent selected state, keyboard navigation and reduced-motion selection; adapt these to the existing 120/200ms tokens without importing the component or its motion stack. Ink is a recorded novel interaction governed by direct pointer feedback, not a decorative catalog animation. [MDN pressure](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure) specifies normalized pressure and a 0.5 active fallback on nonpressure hardware; [MDN Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) supports pointer type/capture and touch-action handling. Apple/Claude local reference tokens are inspiration, not a claim to have measured their current apps. Apple HIG web page initially returned a JavaScript shell; no additional live HIG claim is based on that response.

Root owns fresh evidence at 375/430px, 800 x 1280 and 1280 x 800: focused timeline/board usable area, clear Exit, no page overflow, large-text fallback, category contrast in every brightness/style, independent status/action colors, reload persistence, pressure-varying pointer input, whole-stroke erase/undo/redo, cancelled pointer, note switch/reload and backup round-trip. Screenshots establish geometry only. Browser-simulated pen events do not establish physical Samsung S Pen behavior, latency, palm rejection or pressure fidelity. Physical S Pen testing is explicitly unverified until performed on the device. No accessibility debt is accepted by this contract.

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

### Calendar overlapping-plan target geometry (2026-10-21)
Each visible date column reserves at least 9.25rem (148px at the default root size) per overlap lane, using the same visible plan-lane allocation as its blocks. Only dates with overlapping plans grow wider; the named calendar horizontal viewport owns overflow. The 4rem time gutter and header/date/slot alignment remain shared in one CSS grid. A half-hour block retains a clear left-side 44x44px body target, centered 44px start/end resize targets (straddling their edge by 22px), and a separate right-side 44px move grip. Resize controls never cover the exclusive body target or grip. The body center remains a details action even with two simultaneous plans. Larger text scales lane width with rem units.
