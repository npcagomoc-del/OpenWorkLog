# OpenWorkLog Design System

## 1. Atmosphere & Identity
A spacious personal operations workspace: Todoist task-first navigation, Fluent legibility and restrained Apple surface depth. The supplied v3 mockups are workflow references; the user explicitly approved Apple refinement. Preserve blue navigation and Open / In Progress / Closed semantic colors, readable tables and a persistent workspace. Use system typography, no stock imagery. Signature: an original blue open-ring / folded-worklog mark, quiet blue selection wells, white raised controls against a warm-cool neutral canvas. Developed by NPC appears in navigation/footer. Primary persona is an operations professional moving between desktop and tablet; secondary persona captures work from a tall phone. Both need understandable persistent state, large targets and honest offline storage wording.

References consulted: supplied v3 dashboard, frontend image-to-code, Apple, layout, interaction and perfection guidance. beui.dev tabs source informed keyboard selection and immediate reduced-motion behavior. This is an approved-reference implementation, not a new concept campaign.

Primary design references checked for the release:
- [Microsoft Fluent design tokens](https://fluent2.microsoft.design/design-tokens/): reusable values for color, typography, spacing and elevation.
- [Microsoft Fluent color](https://fluent2.microsoft.design/color) and [typography](https://fluent2.microsoft.design/typography): consistent readable surfaces and type hierarchy.
- [Apple color guidance](https://developer.apple.com/design/human-interface-guidelines/color): sufficient contrast across appearances.
- [Todoist boards](https://www.todoist.com/inspiration/kanban-board): alternative task-list and board views. OpenWorkLog uses its own three requested statuses and original interface.

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
Status uses text plus color. Do not invent a fourth task status. Neutral badges are allowed for metadata such as Demo or Archived.

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
- StatusBadge: status:'Open'|'In Progress'|'Closed'. Text and colored dot.
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
