# Verification

## Unit tests and production build

```sh
npm install
npm run check
```

Nineteen domain tests cover workflow invariants, image/version binding, acceptance invalidation, signoff fingerprints, issue references, coordinate clamping, immutable updates, escaped reports and URL protocol filtering.

## Browser scenarios

Start the built preview in one terminal:

```sh
npm run build
npm run preview
```

In another terminal:

```sh
npx playwright install chromium
npm run test:browser
```

An installed Chrome may be used with `CHROMIUM_PATH=/path/to/chrome`. A deployed prototype can be checked with `BASE_URL=https://your-project.vercel.app npm run test:browser`.

The browser check creates an isolated context and synthetic local data. It does not need an account. Output files, downloads and screenshots go into ignored `test-results/browser/`; override with `QA_OUTPUT`.

## Scenarios covered

1. Dashboard, project navigation, search, project filters and list view.
2. Project creation and real PNG file upload.
3. Four comparison modes, sliders, zoom and image-relative annotations.
4. Discussion, issue status changes, revision history and acceptance invalidation.
5. Client-view signoff, escaped HTML report and post-approval change request.
6. IndexedDB persistence, JSON export/restore and malformed-backup rejection.
7. Asset dimensions, exact duplicates, file-count mismatch and CSV export.
8. Case outline editor and Markdown export.
9. Eleven mobile routes at 390 px, drawer navigation and overflow checks.

The first implementation was exercised in Chromium at 1440 × 1000 and 390 × 844. All nineteen unit tests and nine browser scenario groups passed. This is not a certification of Safari, Firefox, accessibility compliance, real device support or production security. Those need dedicated validation before launch.

## Manual review

Inspect overview, project screen grid, comparison canvas and client view at desktop and mobile widths. Check empty states and deliberately failed uploads. Keep the local-only scope labels visible. Verify that a copied route on a different browser does not imply shared server data.
