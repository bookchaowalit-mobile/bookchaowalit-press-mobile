# Upgrade Plan

## Current state

- Before this pass: **1/10** — React Native CLI scaffold with placeholder
  screens and no entry point (`index.js`), `app.json`, Babel/Metro/Jest/ESLint
  config or lockfile; CI masked every failure with `|| true`.
- After this pass: **6/10** — press-release composer with a tested readiness
  checklist and formatted preview/share; honest CI (lint, typecheck, Jest,
  Metro Android bundle). No native `android/`/`ios/` projects yet.

## Backlog

### P0
- Generate native projects (`npx @react-native-community/cli init` with the
  RN 0.76 template, copy `android/` + `ios/`, set the app name `PressMobile`)
  so `npm run android|ios` works; add an Android debug build job to CI.

### P1
- Multiple saved releases (list, duplicate, delete) and an embargo date/time.
- Date picker instead of typing `YYYY-MM-DD`.
- Media contact list with per-outlet notes.

### P2
- Sync with press-frontend once it has an API.
- Upgrade RN 0.76 -> current and ESLint 9 flat config.

## Done in this pass

- `src/lib/pressRelease.ts`: word count/reading time, strict ISO date parsing,
  AP-style dateline, 7-point readiness checklist, conventional plain-text
  layout ending in `###` — unit-tested in `__tests__/pressRelease.test.ts`.
- Compose tab: form + live checklist and score; Preview tab: formatted
  release, native Share sheet, start over. Render test covers typing ->
  checklist/preview update.
- Added `index.js`, `app.json`, Babel/Metro/Jest/ESLint/Prettier config,
  RN 0.76 template dev dependencies and a committed `package-lock.json`.
- CI runs `npm ci`, lint (0 warnings), typecheck, Jest and a Metro Android
  bundle with no failure masking.

## Done in this pass (pass 2)

Score: 6/10 (was 5/10) — the draft survives restarts; native projects still not generated.

- Draft persistence: `ReleaseProvider` loads/saves the release with `@react-native-async-storage/async-storage` 2.2.0 (versioned `serializeDraft`/`parseDraft`, unknown fields dropped, corrupt data ignored). Writes start only after a successful read, so a storage error cannot wipe a saved draft. Jest uses the package's official mock (`jest.setup.js`).
- Tests: parseDraft cases, save-and-restore across two provider sessions, failed-read-never-overwrites (15 jest tests total).
- "Start over" now asks for confirmation (it clears the saved draft); Share errors are caught.
- Advisories: none fixable within the same major (image-size high via metro, fast-xml-parser and decode-uri-component moderate) — needs the RN upgrade (P2).
- Verified: lint, typecheck, jest, `npm run bundle:android`. Native module autolinks once `android/`/`ios/` exist (P0 above).
