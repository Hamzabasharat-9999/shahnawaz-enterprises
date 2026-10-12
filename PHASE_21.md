# Phase 21 — End-to-End Business Workflow Testing

## Objective

Validate how customer and administrator workflows connect across the React frontend, Express API, MongoDB, Cloudinary, and existing business services. This phase adds repeatable API workflow-contract tests and a controlled browser-based end-to-end test plan. It does not rewrite business controllers or alter existing MongoDB records.

## Changes in this package

- API health/readiness now report phase 21.
- Existing Phase 20 regression tests are retained and updated to expect phase 21.
- `server/test/phase21.test.js` adds checks for public company/chatbot/appointment/delivery/review/estimate configuration, multi-item estimates, invalid estimate input, and authentication gates across customer/admin APIs.
- `npm test` runs the existing regression suite and Phase 21 tests.
- `npm run test:e2e:api` runs the Phase 21 API workflow-contract tests alone.
- GitHub Actions workflow name and step labels reflect Phase 21; it continues to install from lockfiles, run backend tests, and build the frontend.
- `E2E_TEST_CHECKLIST.md` contains manual browser journey cases for cross-module workflows.

## Run automated tests (Windows CMD)

Terminal 1:

```cmd
cd /d E:\SNEPHASES\SNE5\server
npm ci
npm test
```

For just the Phase 21 workflow-contract suite:

```cmd
npm run test:e2e:api
```

Expected backend result: all tests pass with zero failures. Readiness may return HTTP 503 in the isolated test process because it does not connect to MongoDB; the test validates that the status and body correctly report that condition.

Build the frontend in another terminal:

```cmd
cd /d E:\SNEPHASES\SNE5\client
npm ci
npm run build
```

## Run full browser workflows safely

Use a dedicated staging/test MongoDB database and test Cloudinary folder. Do not run write-heavy test journeys against production data. Create one test customer and use the existing admin account only in your local/staging environment. Record each result in `E2E_TEST_CHECKLIST.md`.

Suggested order:

1. Customer registration/login/profile.
2. Browse a published product, open its details, calculate a preliminary estimate.
3. Submit a quotation request and verify it appears in the customer's account and admin quotation queue.
4. Admin reviews/updates quotation; customer approves it if the application supports that status transition.
5. Verify the linked order appears in both customer and admin views.
6. Admin creates invoice from order; customer can view the invoice; admin records a test payment if appropriate.
7. Admin creates delivery from an eligible order, advances delivery through valid statuses, and customer sees tracking/timeline.
8. Customer books an available appointment; admin confirms/completes or rejects it; customer sees the updated status.
9. For a delivered/completed order, submit a valid review; verify moderation and public visibility only after approval.
10. Admin updates inventory and verifies summary/transactions reflect the change.
11. Admin uploads product and portfolio images to the test Cloudinary folder; verify thumbnails and public rendering.
12. Test AI recommendations and chatbot using representative prompts; ensure unavailable AI keys degrade as documented.
13. Verify customer requests cannot access another customer's records and ordinary customer accounts cannot access administrator routes.
14. Log out, refresh protected pages, and verify the app handles expired/missing tokens gracefully.

## Important scope note

The automated Phase 21 tests are API-level workflow contract and access-control smoke tests. The full database-backed and browser-based business journeys in `E2E_TEST_CHECKLIST.md` must be run in your Windows staging environment to claim end-to-end workflow completion. This package does not claim those interactive journeys have already been executed.
