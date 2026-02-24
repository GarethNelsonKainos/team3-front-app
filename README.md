# team3-front-app
Team 3 Frontend Application Feb/March 2026

## Installation

Install the dependencies:

```bash
npm install
```

## Development

Run the application in development mode with watch mode:

```bash
npm run dev
```

This will start the development server and automatically restart on file changes.

## Build

Build the TypeScript application for production:

```bash
npm run build
```

The compiled JavaScript will be output to the `dist/` directory.

## Run Production Build

After building, run the production version:

```bash
npm start
```

## Testing

Run tests:

```bash
npm test
```

Run tests with coverage report:

```bash
## Testing

### Playwright UI/E2E Testing Framework

All Playwright-related files are now centralized in the `playwright/` folder:

```
playwright/
	config.ts                # Playwright configuration
	tests/                   # All Playwright .spec.ts files
	helpers/                 # Playwright helpers/utilities
	report/                  # Playwright HTML reports
```

#### Running Playwright Tests

To run Playwright tests locally:

```bash
npx playwright test --config playwright/config.ts
```

Test reports will be generated in `playwright/report/`.

#### Adding New Tests

Add new `.spec.ts` files to `playwright/tests/`.

#### Using Helpers

Place reusable utilities in `playwright/helpers/` and import as needed in your tests.

#### Configuration

Edit `playwright/config.ts` to update test settings, browser projects, or baseURL.

---
Other test frameworks (e.g., unit tests) remain in their original locations.
Lint code:

```bash
npm run lint
```

Format code:

```bash
npm run format
```
