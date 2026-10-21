# Verification record

## Current v3 published release — 21 October 2026

The [production app](https://openworklog.npcagomoc-56b.workers.dev/) is deployed on Cloudflare Workers Static Assets, version `e83475a3`, with Ready status at 100%. Independent public verification passed 29 of 29 checks at `2026-10-21T08:15:41.355Z` using Chrome 155.0.8059.85. This section supersedes the historical candidate and v2 records below.

Accepted application Git commit: `2da0060cff2928c64c10bb8173768ad7a3915e22`. This Git SHA is distinct from file/source SHA-256 hashes. Production HTML SHA-256: `e37181ecad5820a034f1f0ca83c445044a1111e56cae95d1d44b254943839f1a`; main bundle: `index-CvRVxLBX.js`. Public verification confirmed the accepted HTML/bundle and unchanged local source/dist. Publication documentation is separate from this rendered application fingerprint. A GitHub source push requires its own proof and is not implied by deployment.

| Final local release check | Result and scope |
| --- | --- |
| Unit/data tests | 112 passed across 25 files |
| Production browser acceptance | 46 passed |
| Fresh validated screenshots | 321 PNGs: 294 matrix and 27 detail frames |
| Accessibility and geometry | 174 clean axe/geometry states |
| Independent runtime scenarios | 20 passed |
| Independent review | All five review lanes PASS for the accepted application commit |
| Visual approval | Pass A and final Pass B retry both PASS across all 321 frames |

The final Calendar performance recheck used six Lighthouse runs: mobile and desktop median performance were both 100. Earlier other-route benchmarks remain historical candidate measurements, not fresh final-build all-route results. Device checks use browser emulation; physical phone/tablet operation and other browser engines remain unverified. Automated checks are not full WCAG certification.

### Published HTTPS and offline proof

All ten public routes returned HTTP 200 with the accepted HTML. Cache/security headers, manifest/icons, release JavaScript, service-worker registration/control and precached assets passed. In an isolated synthetic workspace, a task saved through the UI survived an offline reload; an offline edit survived a second offline reload and reconnect. Phone layout fit, zero browser errors, no failed online application assets and unchanged local source/dist passed. Root personally opened the public demo dashboard; evidence is `public-dashboard-root.png`. These checks did not migrate or upload the user's private workspace.

The sibling `../OpenWorkLog-QA-v3/` output contains `public-deployment-verification.json` and `.md`, `visual-b-approved-retry.md`, final capture/acceptance manifests, runtime/review evidence and the dashboard proof. The final publication index is `finalrelease-summary.md` there; use it to locate accepted inventories, publication proof and any separately verified source-push result. Check artifact hashes, times and scope when reproducing results.

Records remain in IndexedDB for each browser profile/device/origin. HTTPS publishes the app shell; it does not add login, synchronization or automatic backup. Move records with a private JSON backup at the old URL and explicit restore at the production URL after reviewing replacement. Keep backups out of source and public assets.
## Historical v3 candidate — superseded by the published release above

This historical section records the earlier compact tracker/Planner candidate measured on 21 October 2026. Its pending statements describe that earlier point in time. It describes the audited candidate, not a claim that the final rebuilt release has been published or approved. Final publication status, URL and final evidence counts belong in the sibling `OpenWorkLog-QA-v3/finalrelease-summary.md` release summary when produced. The v2 record below is historical and must not be used as current v3 evidence.

Git candidate commit: `46e97a689d98049d04f50ea25d66d1495777031e`. This is a Git SHA, distinct from the per-file/source SHA-256 hashes recorded in the v3 manifests. The measured production HTML SHA-256 is `3d78ab3aeb6a10b824db890b9f2d7a1254481e39c6d6981af0c1d5618e0b8d45`; main bundle is `index-C7cFBgr2.js`. Source and production HTML remained stable through these audits. The upcoming release also includes a two-line CSV help-copy correction and a timer snapshot regression repair: a selected plan's named or blank Business Unit must remain captured when its linked task later changes. Final rebuild, timer snapshot regression checks, fresh full browser recapture and final visual review remain release checks; the candidate measurements below retain their original provenance.

| Measured candidate check | Result and scope |
| --- | --- |
| Strict TypeScript and production build | Passed |
| Unit/data tests | 110 passed across 24 files |
| Lint | Exit 0; 6 warnings and 8 informational suggestions |
| Full production browser acceptance | 44 passed after six stale assertion repairs; fresh full 44-scenario recapture after the CSV help-copy change is pending |
| Accessibility and geometry | 126 axe states: zero reported violations, small targets, document overflow or page errors; five zoom checks |
| Resolved palette contrast | Minimum measured text ratio 4.5014:1 and ring ratio 3.00798:1 |
| React Doctor | Score 67; zero errors, 31 warnings across 128 TypeScript/TSX files |
| Final capture inventory and visual approval | Pending; use the final v3 manifests and independent review rather than inferring a count here |

Lighthouse used 30 local lab runs. Desktop performance was 100 on all five routes. Mobile route results were Dashboard 92, My Tasks 100, Calendar 99, Daily Log 99 and Executive 100. Accessibility, Best Practices and SEO were 100 on all 30 runs. These measurements describe the audited local production candidate and emulated device conditions; they are not physical-device guarantees or final hosting measurements.

### v3 evidence and release boundaries

Locate the sibling output folder `../OpenWorkLog-QA-v3/` from the repository root. It contains `capture-manifest-final.json` and `capture-manifest-preliminary.json`, `acceptance-results-final.json` and `acceptance-results-preliminary.json`, the `captures/` and `performance/` directories, independent data results/review, performance review, code/context/goal/security reviews and the review ledger. Check each artifact's recorded hash, time and candidate scope. A filename containing “final” identifies that audit pass; it alone does not prove the subsequently rebuilt or published release matches it. The release summary will link the final accepted inventory and publication evidence. Private browser workspace records and JSON backups are not deployment or QA deliverables.

Cloudflare's authenticated in-app browser static-assets upload was prepared with 47 app files, the name `openworklog`, account hostname suffix `npcagomoc-56b.workers.dev`, and SPA fallback selected. Deployment had not been executed when this candidate record was written; this is preparation evidence, not a live HTTPS availability claim. Root owns the authorized deployment after the final gate. The private GitHub source push is also pending. Consult the v3 release summary for later completion rather than treating these preparation details as publication proof.

The app remains browser-local IndexedDB storage. HTTPS hosting publishes the app shell and does not transfer the old origin's records, add login, or provide cloud synchronization. Moving an existing workspace requires a private JSON backup from the old origin and explicit restore at the chosen production origin. Physical phone/tablet acceptance and other browser engines remain unverified unless the release summary records direct tests.

## Historical v2 connected-work release — retained evidence, superseded for current v3

Everything below this heading describes the earlier v2 build and its own fingerprints, counts and approvals. It is retained unchanged in substance as release history; none of its measurements or approval statements establishes v3 release readiness.
Verified locally on 2026-10-21 using the production build and installed Google Chrome. Checks used isolated test workspaces. Private browser records and backups are excluded from source and QA deliverables.

### Connected-work update

| Check | Result |
| --- | --- |
| Strict TypeScript | Passed |
| Unit/data tests | 76 passed across 16 files |
| Lint | Exit 0; 6 warnings and 6 informational suggestions remain |
| Production build | Passed; 46 PWA precache assets, 783.19 KiB |
| Dependency audit | 0 vulnerabilities |
| Production browser acceptance | 32 passed; zero failed, skipped or flaky results; 184.658 seconds |
| Responsive evidence | 280 validated PNGs: 269 matrix frames and 11 connected/drag states |
| Accessibility | 72 axe states with zero reported violations; incomplete automated checks are documented separately |
| Independent data review | PASS; all 13 reviewed data/domain file hashes still match |

Production HTML SHA-256: `0061a5c712614fd5378a77a82c9a1ad66ca49627a63553d484c4e40de215820a`. Main bundle: `index-DO0qN-Ao.js`. The capture manifest records all 118 source file hashes, production asset hashes, image signatures, dimensions, capture times and hashes. Its source aggregate is `3938deca8f7846a02ef1727774eab7f73314525a2672f53340977b6f61c31468`; manifest SHA-256 is `836895feb07715e2e9a7e5d6ecec94b35d48d67da5126fbc0f3b4412fbbd0513`.

### Workflows exercised

- A new non-break Daily activity or Calendar plan creates one canonical My Tasks record. Explicitly linked work reuses its task. Planned Daily work appears in Calendar. Lunch creates no tracker task.
- Older workspaces and version-1 backups receive one atomic link upgrade. Intentional task/plan deletions remain detached during edits, rescheduling, timer use, reload and current-backup restore. Schedule dates do not become task deadlines.
- Timer planned-work selection includes Daily and Calendar sources, with planned date/window while running, after reload and during review. Saving updates the existing daily entry, preserves manual corrections and appends new work descriptions. The parent task is not automatically closed. Overnight manually supplied planned times apply to the review date only.
- Mouse, touch and keyboard Task status movement and Calendar rescheduling persist after reload. Cancellation and keyboard focus restoration pass. Calendar moves preserve duration, allow an end at 24:00 and reject an end after midnight. Occupied background creation slots and active destination labels pass accessibility assertions.
- Super dark uses neutral black surfaces, persists and preserves the other appearance modes. Open remains blue, In Progress yellow and Closed green.
- Executive uses saved current portfolio records and separately date-filtered planned/logged activity. Linked plans are counted once. UI fixture shows 2h planned and 32m logged. Independent CSV parsing verifies actual export contents; changing activity dates does not rewrite current status totals.
- Existing task/category/note persistence, all 48 half-hour slots, quoted/formula-safe CSV, import validation, JSON backup preview/confirmed restore and invalid-file protection pass.
- Production service-worker offline reload, offline edit, another offline reload and persistence after reconnect pass.

Root also manually used the actual in-app browser on a separate production origin: saved one activity, confirmed My Tasks and Calendar, physically dragged it to In Progress, reloaded, selected its planned timer source and checked Executive exact figures of 1h planned/30m logged. Screenshots contain only deliberate sample records.

### Responsive coverage and repaired findings

Viewport sizes: 375×812, 430×932, 800×1280, 1280×800 and 1440×1000. Every route and the component showcase were captured in Light and Super dark, plus the task Table/Kanban, late Calendar slots, full-day log, planned/running timer, Executive sections/exact figures, mobile drawers, note reader, report preview, backup settings, Dark/Large text, dialogs and motion states. Tables/charts use their intended internal horizontal viewport. Each matrix state asserts no document-width overflow.

A pre-update real-browser regression reproduced the reported missing Daily-to-Task link. Independent data review then found task recreation after intentional deletion and duplicated overnight planned bounds; both were repaired and covered by regressions. Accessibility checks found dimmed drag text, decorative portal semantics, obscured Calendar create targets, a visible/accessibility label mismatch and small tap targets. These were repaired before the final build and fresh captures.

One intermediate browser candidate passed 31/32. Its sole failure was a synthetic zero-duration Space press followed immediately by an arrow before the drag library attached its keyboard listener. The final fixture uses a human keypress and checks drag readiness; all exact midnight, cancellation, focus and persistence assertions remain. Intermediate reports are retained as history and are not final approvals.

### Performance and limits

Lighthouse performance scores are three-run medians per page/device, 30 runs total. The isolated populated workspace contained two hours of planned work and 32 minutes logged through the real UI.

| Page | Desktop | Mobile |
| --- | --- | --- |
| Dashboard | 100 | 98 |
| My Tasks | 100 | 98 |
| Calendar | 100 | 98 |
| Daily Log | 100 | 100 |
| Executive | 100 | 100 |

Accessibility, Best Practices and SEO scored 100 on all 30 runs. Scores are local lab measurements and vary with host load; they are not physical-device performance guarantees. The 72-state axe matrix covers five routes, Light/Super dark, three viewport sizes and active drag, planned/running timer and expanded Executive states. Its separate effective-target geometry checks account for associated checkbox labels. Five 200% CSS zoom checks and reduced-motion checks pass. React Doctor reports zero errors and 28 warnings across 104 source files; warnings are recorded rather than silently suppressed. Production profiling did not expose complete component timings, so no claim of zero unnecessary renders is made.

Automated contrast checks have incomplete results for some gradient, SVG and clipped/scrollable regions. The audit retains these limitations alongside manual/rendered contrast checks. These results are not full WCAG certification.

All device checks use Chrome with emulated viewport/touch settings. Physical Tab S10 FE and phone hardware, other browser engines and installation prompts on every OS are unverified. Bundled Chromium fails to launch on this host; the documented optional installed-Chrome channel was used without weakening the default/CI configuration.

The database is local IndexedDB through Dexie. There is no configured cloud database, account service or automatic multi-device synchronization. Offline operation requires a successful initial production load and retained browser storage. Keep JSON backups outside the browser before clearing site data, moving origins or transferring devices. GitHub source upload does not deploy a public website; hosted CI and external hosting are not claimed as verified.

### Evidence locations

The sibling `OpenWorkLog-QA-v2` output contains the acceptance JSON, capture manifest and `responsive-final/`, independent data review, root manual proof, build checks, final performance audit and independent visual reports. Supplementary evidence is indexed separately so the original 280-image manifest remains reproducible. Temporary Playwright `test-results/` is not the durable release record.

The initial release history remains in sibling `OpenWorkLog-QA`; its earlier 53-test/19-browser/132-capture results describe the original build, not this update.

### Final visual approval

Independent Pass A and Pass B both PASS with no blockers on the HTML fingerprint above. Each covered all 314 final frames: original 280, corrected 32-frame detail supplement and two settled Escape-cancel captures. Pass B opened every frame individually; Pass A covered the complete numbered contact-sheet inventory with additional full-resolution checks. Both independently verified source and image hashes.

The supplement closes offscreen due-row, running-timer context and phone right-scroll evidence gaps. An initial supplemental capture raced theme persistence; the entire supplement was regenerated with saved-theme and computed-black assertions. Corrected supplement manifest SHA-256: `ce21524988b183abfb166fa97f4564ef7eb0d60977ed080c24d72ad8b09517fe`. No product source changed for these framing repairs.

After screenshot-only test additions, all five responsive cases passed again in 46.7 seconds; each separate Task/Calendar keyboard-cancel case passed. Strict TypeScript compilation also passed. The original full 32-scenario result remains unchanged and reproducible.
