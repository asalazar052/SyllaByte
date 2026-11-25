This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Code structure

Code sits in layers, lowest first. A layer imports only from the ones before it in this list, and ESLint enforces that (see `eslint.config.js`, which says what to do instead when a rule trips).

1. `src/lib`: plain helpers (dates, formatting, input). Nothing app-specific.
2. `src/db`: schema, queries, `useQuery` and `db/hooks`, the change bus, migrations, seed data.
3. `src/domain`: the app's rules and the only way it changes data. No React, no screens, no device APIs.
4. `src/components`, `src/hooks`: shared UI and hooks.
5. `src/features/<name>`: one area of the app. Features use each other only through the other's `index.ts`.
6. `src/app`: routes. Each file is a thin wrapper that renders a feature's screen.

How data moves:

- **Reading:** build a query in `db/queries.ts`, then read it with `useQuery` (or a hook in `db/hooks.ts`). `useQuery` re-runs it whenever any table it reads changes, joins included.
- **Writing:** call a command from `@/domain/commands` (`createEvent`, `deleteCourse`, `saveSyllabusCourse`, ...). Screens never write to the database themselves, and `@/db/client` can't be imported from features, components, hooks or routes.
- **Things that happen because of a change** (a notification recorded, permission asked for, a reminder scheduled) belong in the command that makes the change, or, for things driven by time, in `ReminderSync`. They don't belong in a screen. If you add a new effect, add it there and every screen gets it.
- **Notifications** are stored in the `notifications` table when they happen (`domain/notifications`, `recordFiredReminders`), not worked out when the screen opens.
- **Reminders** go through `domain/reminders/resolve.ts` (what an item's reminder is and when it fires) and `plan.ts`. The calendar, the scheduled notifications and the notification list all use the same functions.
- **Rules about event types** (labels, which are due or important) are in `domain/event-types.ts`.
- **The device** (notification permission) is reached from the domain through `domain/ports.ts`, which `app/_layout.tsx` fills in.

Course extraction is meant to be swappable. `CourseDraft` (`domain/course-draft.ts`) is the hand-off: whatever reads a syllabus (today the demo in `features/upload/mock-extraction.ts` and `sample-draft.ts`) produces one, and `saveSyllabusCourse` saves a reviewed one without caring where it came from.

Database changes: edit `src/db/schema.ts`, then run `npx drizzle-kit generate --name <what-changed>`. If new data is needed for the app to be usable, add it to `src/db/seed.ts`.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
