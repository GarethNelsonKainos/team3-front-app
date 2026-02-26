# Cucumber + Playwright Demo (Simple)

This demo converts one existing Playwright test into a basic Cucumber scenario.

## What was converted

Original Playwright spec:
- `playwright/tests/view-login.spec.ts`

Cucumber equivalents:
- Feature: `playwright/features/login-navigation.feature`
- Steps: `playwright/step-definitions/login-navigation.steps.ts`
- Hooks/world: `playwright/support/hooks.ts`, `playwright/support/world.ts`

## Run the demo

1. Start the app:

```bash
npm run dev
```

2. In another terminal, run the Cucumber scenario:

```bash
npm run bdd
```

Optional headed mode:

```bash
npm run bdd:headed
```

## Presentation flow

1. Show the plain-English scenario in `playwright/features/login-navigation.feature`.
2. Show how each step maps to page object methods in `playwright/pages/HomePage.ts` and `playwright/pages/LoginPage.ts`.
3. Run `npm run bdd` to show the green scenario output.

## Why this is a good starter demo

- Uses a public flow (no test credentials needed).
- Reuses existing page objects (clean and maintainable).
- Keeps setup minimal while demonstrating BDD structure.
