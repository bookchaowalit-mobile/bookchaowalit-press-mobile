# Press — Mobile

React Native CLI (bare workflow) mobile app for **Press**.

Part of [Chaowalit Greepoke](https://bookchaowalit.com)'s 101 Portfolio Projects.

## Tech Stack

- **Framework:** React Native 0.76 (bare CLI)
- **Language:** TypeScript
- **Navigation:** React Navigation v6
- **UI:** React Native Vector Icons

## Features

- **Compose** tab: write a press release (headline, dateline, body, quote,
  boilerplate, media contact) with a live readiness checklist — headline
  length and tone, valid dateline, 150–800-word body, attributed quote,
  "About" section, valid contact email — and word count / reading time.
- **Preview** tab: the release in the conventional layout ("FOR IMMEDIATE
  RELEASE" … `###`), selectable and shareable through the native share sheet.
- Everything runs on-device; nothing is sent anywhere.

## Getting Started

```bash
npm ci
npm start
```

The native `android/` and `ios/` projects have not been generated yet, so
`npm run android` / `npm run ios` need that step first (see
`docs/UPGRADE-PLAN.md`).

## Validation

```bash
npm run validate      # eslint + tsc --noEmit + jest
mkdir -p dist && npm run bundle:android   # Metro bundle smoke check
```

Pure logic lives in `src/lib/` and is unit-tested with Jest (`__tests__/`).
CI (`.github/workflows/build.yml`) runs all of the above and fails on errors.

## Related

- **Frontend:** [bookchaowalit-website/press-frontend](https://github.com/bookchaowalit-website/press-frontend)
- **Portfolio:** [bookchaowalit.com](https://bookchaowalit.com)

## License

MIT
