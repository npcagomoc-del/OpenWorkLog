# OpenWorkLog setup guide

Developed by NPC.

OpenWorkLog is a responsive web app that can be installed as a Progressive Web App (PWA). The same app serves desktop, tablet and phone layouts. It stores work records in IndexedDB in the current browser profile. No account, API key or server database is required.

The installable PWA is the mobile version supplied by this project. There is no separate Android APK, iOS binary or app-store release.

## 1. Install the tools

Install Node.js 22 with npm and Git if you will clone the repository. In Windows PowerShell or Terminal, check:

```powershell
node --version
npm --version
git --version
```

Use a normal writable project folder. Do not put private work reports or backup files in the source repository.

## 2. Get and run the source

Clone the repository using an account with access to it, or extract a source archive:

```powershell
git clone https://github.com/npcagomoc-del/OpenWorkLog.git
cd OpenWorkLog
npm ci
npm run dev
```

Open the URL printed in the terminal. Keep that terminal running while using the development server. Press `Ctrl+C` to stop it.

Choose **Start with blank workspace** for your own records. **Explore demo workspace** loads example records for trying the screens. Example data is not a live operational report.

## 3. Run the production build

Use the production build to test installation and offline use:

```powershell
npm run build
npm run preview -- --port 4186 --strictPort
```

Open `http://127.0.0.1:4186`. Keep the preview server running while initially loading the app. Vite preview is a local verification server; use a proper static HTTPS host for regular use on several devices.

Records are separated by browser profile and URL origin, including hostname and port. For example, `localhost`, `127.0.0.1`, development port 5173 and preview port 4186 do not share one database. Return to the same URL and profile to find the same records. Use a JSON backup to transfer a workspace to another origin or device.

## 4. Host it for a phone or tablet

1. Run `npm run build`.
2. Publish the contents of `dist/` to a static host with HTTPS.
3. Configure the host to return `index.html` for app routes such as `/tasks`, `/daily` and `/settings`.
4. Open the HTTPS address on each device and let the initial load finish.
5. Use the browser's installation command, then test offline use as described below.

This build expects to run at the root of a domain. Hosting below a path such as `/OpenWorkLog/` needs a matching Vite base, router configuration and PWA paths before deployment. GitHub stores the source; pushing the repository does not automatically deploy the app.

`http://192.168.x.x:port` on a local network may display the page but generally does not provide the secure context needed for service workers and PWA installation. The localhost exception applies to the device running the server, not a phone connecting to that computer's LAN address. Use HTTPS for phone/tablet installation. A preview server bound to `127.0.0.1` is also accessible only on that computer.

## 5. Install and verify offline use

On Chrome or Edge, open the production HTTPS app and choose **Install app** from the address bar or browser menu when offered. On Android, the command may be **Install app** or **Add to Home screen**. On Safari for iPhone/iPad, use **Share → Add to Home Screen**. Available commands vary by browser and operating system.

Before relying on offline access:

1. Load the production app online and visit the pages you need.
2. Create a test task and reopen the app to confirm it is saved.
3. Enable airplane mode or disconnect the network.
4. Reopen the same app, edit the task and visit Daily log and Notes.
5. Reconnect and download a backup.

Installation is optional; supported browsers can also keep the production app available offline in a tab. Development mode is not the offline acceptance target. Offline availability requires a successful first load and retained browser storage.

## 6. Configure the workspace

In **Settings**:

- Choose Light, Dark or System appearance and Comfortable or Large text.
- Set the working day and lunch times. Defaults are 08:00–17:00 and 12:00–13:00.
- Set an IANA time zone, such as `Asia/Manila`, and save the schedule.
- Set your local profile name and the labels for Task, Operational and Project work.
- Add categories before importing tasks that use those names.

See the [user guide](USER_GUIDE.md) for the normal workday, reports and backup procedure.

## 7. Protect and move records

Use **Settings → Data & backup → Download backup** regularly. Store the JSON file outside browser storage, in a location you control. It contains private workspace details. Source control and CSV reports are not complete workspace backups.

To move devices, download a backup on the old device, transfer the file securely, open the app on the new device, choose **Choose backup to restore**, inspect the preview, then confirm replacement. This replaces the destination workspace; it does not merge both devices.

There is no configured cloud synchronization, shared team workspace, login or automatic cross-device backup. Private browsing, clearing site data, deleting a browser profile and browser storage eviction can remove records. The app does not provide database encryption or access control against another person using the same unlocked browser profile.

## 8. Verify a code change

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite starts its own production preview at `127.0.0.1:4173`. That port must be free. It uses isolated browser contexts, not your normal workspace. Results go to `test-results/` and `playwright-report/`.

Read [ARCHITECTURE.md](../ARCHITECTURE.md), [DESIGN.md](../DESIGN.md), [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) and [the verification record](VERIFICATION.md) before maintaining the app.

## Troubleshooting

| Problem | Check |
| --- | --- |
| `npm` is not recognized | Install Node.js, reopen the terminal, then check `node --version` and `npm --version`. |
| PowerShell blocks `npm.ps1` | Use `npm.cmd ci` and `npm.cmd run dev`, or run the commands in Command Prompt. No execution-policy change is required. |
| Port is already in use | Stop the server you started on that port, or select another port. Changing the port opens a separate local workspace. |
| Records appear missing | Check the exact URL, browser profile and device. Check whether private browsing or site-data clearing was used. Restore a saved JSON backup if needed. |
| A direct app URL returns 404 | Configure the static host's SPA fallback to `index.html`. |
| Offline launch fails | Load the production HTTPS/localhost app online first. Check service-worker support and retained site data. Reload online after an update. |
| Restore is rejected | Use an unmodified OpenWorkLog JSON backup of a supported version. An Excel file, CSV or manually rearranged JSON is not a full backup. |
| Import is rejected | Read row errors, use the exact statuses and create referenced categories/projects first. See the CSV section in the user guide. |
