# Cloudflare HTTPS deployment

OpenWorkLog is a static, local-first PWA. Publish the production app files; workspace records remain in each visitor's browser profile. Hosting the app does not upload or synchronize IndexedDB, and HTTPS does not add user login or access control.

## Release package

Run the normal verification checks first (see `SETUP.md`), then `npm run build`. Use the contents of the freshly built `dist/`, with `index.html` at the upload root. Include assets, icons, `manifest.webmanifest`, `sw.js`, `registerSW.js`, the generated Workbox file and `_headers`. Do not upload the repository folder, `node_modules`, `.qa-state`, browser profiles, test artifacts, `.env` files, private JSON backups or CSV reports.

The source `public/_headers` is copied by Vite into `dist/`. It requests browser revalidation for the HTML entry, manifest and service-worker entry points; hashed `/assets/` files can be cached for a year. Other generated files use host defaults. Security headers disable framing and unnecessary device permissions. These headers protect the app shell; they do not encrypt local records or restrict who can open the public URL.

After the final build, a Windows release operator can create an upload ZIP outside the source repository:

```powershell
Compress-Archive -Path .\dist\* -DestinationPath ..\OpenWorkLog-cloudflare.zip -Force
```

Inspect its file list before uploading. `index.html` must be at the archive root, with no enclosing `dist/` folder. Recreate this ZIP after every rebuilt release; an earlier ZIP will contain earlier code.

## Choose the deployment route

Cloudflare recommends Workers Static Assets for new static applications. Use the current dashboard static-assets flow if available, or the `cf` CLI after the account is authenticated. This repository currently has no Cloudflare CLI configuration. Do not install Wrangler or invent a Wrangler configuration to follow an old tutorial. For CLI setup retrieve the current `cf` documentation, verify the selected account, and inspect the discovered command/configuration schema before creating account resources.

For Workers Static Assets, configure single-page-application routing (`not_found_handling: single-page-application` in the supported assets configuration). This repository uses BrowserRouter, so opening `/tasks`, `/daily`, `/calendar` or `/settings` directly must return the app entry instead of a 404. Set that option through the actual dashboard or the current supported configuration; the spelling above describes the asset setting rather than a repository config file.

If the chosen dashboard offers **Pages → Direct Upload**, its drag-and-drop flow accepts a built folder or ZIP. Select the release package, review the project name and deploy it. A Pages Direct Upload project cannot later be switched to Git integration; that requires a separate project. Keep the same production hostname for later releases to retain that origin's local workspace.

Pages supplies SPA fallback when there is no top-level `404.html`. Do not add a `404.html` to this build. No Functions, server database, API token in app code, or private data upload is required. A source push and a dashboard Direct Upload are separate release actions.

## Move an existing local workspace

Before switching URLs, open the existing local app in its original browser profile and download a private JSON backup from **Settings → Data & backup**. Open the HTTPS production URL, choose the backup to restore, inspect its preview and confirm replacement. Download a backup of any destination records first.

A local address, production hostname, preview hostname and custom domain are separate storage origins. Neither the browser nor Cloudflare automatically transfers records between them. Keep the same HTTPS production URL for normal use. Treat the backup as private and transfer it directly between your own devices; never include it in a hosting upload or source repository. Restore replaces the destination workspace and does not merge concurrent edits.

## Verify the published URL

Record the actual production URL, release date and results in `VERIFICATION.md` only after deployment. Check the root and direct routes `/tasks`, `/daily`, `/calendar` and `/settings`; reload each. Confirm assets and the manifest load over HTTPS, response headers are present, and the service worker registers. Test blank/demo onboarding in an isolated browser profile. On that profile, save a test task, reopen, then disconnect and reopen the same origin to exercise offline access. Never clear the user's browser storage as an update workaround.

For later releases, publish the new build to the existing project. Open online, let the PWA update, and reopen to check the new screens while saved records remain available. A successful upload alone is not evidence of offline installation, restored records, or operation on a physical phone/tablet.

## Official references

Verified against Cloudflare documentation on 21 October 2026:

- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [SPA routing](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- [Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Pages route defaults](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- [Pages headers](https://developers.cloudflare.com/pages/configuration/headers/)
- [Cloudflare CLI](https://developers.cloudflare.com/cf/)
