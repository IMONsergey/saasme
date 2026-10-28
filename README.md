# SAASME

Interactive studio workspace prototype: projects, screenshot review, annotations, revisions, local client signoff and handoff reports.

## Run

Node.js 22.12+ (Node.js 24 recommended).

```sh
npm install
npm run dev
npm run check
npm run preview
```

## Implemented

- Responsive studio overview, project cards/list, archive, project and issue search.
- Real PNG/JPEG/WebP uploads with file-size and image-dimension safeguards.
- Side-by-side, curtain, overlay and difference comparison; zoom and image-relative annotations.
- Issues with priority, assignee label, scope-change classification, status and persistent comments.
- Revision history. New revisions or reopened issues invalidate acceptance.
- Screen acceptance and a project signoff bound to the current screen versions.
- Local client-view demonstration, revision requests and a portable, escaped HTML report.
- IndexedDB persistence, validated JSON backup import/export.
- Asset preflight: dimensions, weight, byte-identical duplicates, expected count, CSV export.
- Case outline editor with Markdown export.
- Domain-level automated tests.

## Prototype boundaries

This is a frontend prototype, not a production multi-tenant service. All project data and uploads stay in IndexedDB in the current browser. Demo projects and client identities are fictional. There is no real authentication, cloud sync, authorization, invitation delivery, billing, external integration or legal electronic signature. Client-view routes are a local workflow demonstration, not shared customer URLs. A link alone cannot transfer local projects to another device; export/import a backup instead. The case-outline draft is intentionally transient; download it before leaving.

Comparison operates on supplied images, not a live web page. Viewport labels describe captured screenshots and do not emulate responsive layouts. Difference mode is a visual aid, not an automated error score. Preflight validates only declared file parameters and exact-byte duplicates; it does not certify copyright, visual correctness or brand compliance.

Single-browser editing is supported. Simultaneous editing in multiple tabs is not a collaboration implementation. Use non-confidential test materials only. IndexedDB can be cleared by the browser: keep backups.

## Architecture

`src/domain.ts` — typed entities and immutable workflow rules.

`src/storage.ts` — IndexedDB repository, backup validation and image ingestion.

`src/demo.ts` — self-contained fictional sample projects; no external image dependencies.

`src/App.tsx` — shell, navigation, overview, search and workspace settings.

`src/Project.tsx` — review canvas, issues, versions, project and client workflows.

`src/Tools.tsx` — independent delivery and publishing utilities.

`src/report.ts` — portable HTML reports and JSON backups.

`src/ui.tsx`, `src/styles.css` — shared controls, icon set, responsive design tokens.

## Next production milestone

1. API contracts and server-side copies of workflow invariants.
2. PostgreSQL workspace/project membership and object storage with signed URLs.
3. Authentication and per-workspace authorization on every request.
4. Real share links with expiry, revocation and scoped read/comment/signoff permissions.
5. Audit log, optimistic concurrency, migrations, retention and backups.
6. Screenshot capture workers with URL validation and SSRF protections.
7. Figma OAuth/plugin integration; no user API keys in frontend bundles.
8. Billing, telemetry with consent and accessible error/recovery paths.

No database provider is hard-wired. The prototype has no external runtime dependencies beyond its compiled React assets and browser APIs.
