# Phase 23 — Deployment & Live Production Verification

## Purpose

Deploy the existing Shahnawaz Enterprises application safely and verify the real hosted system. This phase preserves the verified Phase 21 workflows and Phase 22 client improvements. It does not invent a company domain, publish unapproved company data, add an unconfigured email provider, or claim launch readiness before live tests pass.

## Proposed hosting layout

- **Frontend:** Vercel, using `client/` as the project root and `client/vercel.json` SPA rewrites.
- **Backend:** Render web service, configured by the repository-root `render.yaml` (root directory `server`).
- **Database:** MongoDB Atlas production database/user, separate from local and staging databases.
- **Images:** Existing Cloudinary account and a production folder/preset as appropriate.
- **AI:** Gemini remains optional; the application should continue to use its documented fallback if no API key is configured.

You may use equivalent providers, but adapt the environment and health-check settings to the selected platform. Do not deploy publicly until the production domain, privacy/contact information, data owner, and required notification behavior are approved by the company.

## 0. Keep a rollback copy

1. Keep `E:\SNEPHASES\SNE6` unchanged.
2. Extract this package into `E:\SNEPHASES\SNE7`.
3. Copy `server\.env` and `client\.env` only if needed for local verification. Never put them in Git or a ZIP sent to others.
4. Use a dedicated staging MongoDB database for deployment rehearsal. Never run test orders/reviews against the real production database.

## 1. Pre-deployment verification (Windows CMD)

```cmd
cd /d E:\SNEPHASES\SNE7\server
npm ci
npm test
npm run test:e2e:api
```

Then, in another CMD window:

```cmd
cd /d E:\SNEPHASES\SNE7\client
npm ci
npm run build
```

Expected: the existing automated suite passes (18 tests, unless intentionally changed and documented) and Vite produces `client\dist` cleanly. Confirm the source control working tree does not contain `.env`, credentials, database dumps, `node_modules`, or `dist`.

## 2. Prepare MongoDB Atlas

1. Create a dedicated production database and a database user with only the permissions the application needs.
2. Configure Atlas network access for the chosen backend host. Prefer the provider's supported static outbound IPs or private networking. Do not leave `0.0.0.0/0` open as a permanent shortcut.
3. Copy the Atlas connection URI into the backend host's secret/environment settings as `MONGODB_URI`; URL-encode special characters in the database password.
4. Confirm the database backup/restore plan and retention. Test restore using a non-production database before accepting real customer data.
5. Keep staging and production databases separate, including any test seed data.

## 3. Deploy backend to Render

1. Push the reviewed source to a private/approved Git repository. Confirm `.env` files are ignored and not tracked before pushing. Rotate any credential that has ever been committed.
2. In Render, create a Blueprint from the repository and select the root `render.yaml`, or create a Node web service with **Root Directory** `server`.
3. Use build command `npm ci`, start command `npm start`, and health-check path `/api/ready`.
4. Add environment variables in Render's dashboard (never in source code):

| Variable | Production value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` for the provided Render configuration; otherwise use the port supplied by the host |
| `TRUST_PROXY` | `1` only when the service is behind the single trusted proxy as configured |
| `MONGODB_URI` | Production Atlas connection URI |
| `JWT_SECRET` | Unique cryptographically random secret, at least 32 characters; do not reuse development secret |
| `CLIENT_URL` | Exact public HTTPS frontend origin, e.g. `https://your-approved-domain.example` (replace placeholder) |
| `JWT_EXPIRES_IN` | `7d`, unless the security review approves a different value |
| `CLOUDINARY_CLOUD_NAME` | Actual Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Actual Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Actual Cloudinary API secret, secret-only |
| `CLOUDINARY_FOLDER` | Approved production folder, e.g. `shahnawaz-enterprises` |
| `GEMINI_API_KEY` | Optional; leave unset if AI is not approved/configured |
| `GEMINI_MODEL` | `gemini-2.5-flash` or a currently supported model approved for this project |

5. Do not use a fake example domain as the actual `CLIENT_URL`. Add the exact final frontend origin(s), comma-separated only if multiple approved origins are required.
6. Deploy and inspect Render logs. Do not proceed if startup fails, environment validation fails, MongoDB cannot connect, or secrets/stack traces are exposed.
7. Record the actual backend URL, e.g. `https://<your-render-service>.onrender.com`, in the private deployment notes.

## 4. Deploy frontend to Vercel

1. Import the same reviewed repository into Vercel.
2. Set **Root Directory** to `client`.
3. Framework preset: Vite (or allow Vercel to detect it); build command `npm run build`; output directory `dist`.
4. Set the build environment variable `VITE_API_URL` to the backend origin plus `/api`, for example `https://<your-render-service>.onrender.com/api`. Replace the example with the actual deployed backend URL. This variable is public client configuration, not a secret.
5. Keep the included `client/vercel.json` rewrite so direct refreshes on React routes return `index.html`.
6. Deploy a preview first. Check browser DevTools Network and Console for failed API calls, CORS errors, mixed-content requests, and missing assets.
7. Add the final production domain only after it is approved and DNS/HTTPS are configured. Then update the backend `CLIENT_URL` to the exact production origin and redeploy/restart the backend.

## 5. Live verification gates

Run these against the **actual deployed URLs** (not localhost):

- `GET <BACKEND_URL>/api/health` → HTTP 200, `ok: true`, `phase: 23`.
- `GET <BACKEND_URL>/api/ready` → HTTP 200 and `database: "connected"`.
- `GET <BACKEND_URL>/api/company` → HTTP 200 and only approved public company information.
- `GET <BACKEND_URL>/api/appointments/config`, `/api/deliveries/config`, `/api/estimates/config`, `/api/chatbot/config` → expected public configuration responses.
- Open frontend root and refresh `/products`, `/portfolio`, `/calculator`, and `/appointments` directly → no Vercel 404.
- Check login/logout, expired token behavior, customer ownership, admin authorization, quote/order/invoice/delivery flows, appointments, reviews, image upload, and chatbot/AI fallback with dedicated test accounts and test records.
- Confirm an unauthenticated request cannot read protected records, and a customer cannot access another customer's resources.
- Verify Cloudinary uploads and URLs use the intended production folder; do not test destructive upload/delete actions with real business assets.
- Check mobile and desktop layouts, Lighthouse, accessibility, metadata, robots behavior, and HTTPS.
- Confirm browser requests never target `localhost` in production and there are no mixed-content warnings.

**Do not test by creating fake orders, invoices, appointments, or reviews in the real business database.** Use a staging deployment/database first. If a minimal production smoke test is needed, agree on a controlled test account and a documented cleanup process with the data owner.

## 6. Email notifications and real company information

These remain explicit master workstreams. Before declaring production launch complete:

- Confirm approved company name, contact channels, address/service area, official domain, privacy/contact/terms content, and the products/projects that may be published.
- Choose and configure an email provider; store its API key/SMTP credentials only in the host's secret manager. Test appointment/order/quotation notifications with internal addresses, including failure behavior and duplicate-send protection.
- Do not claim email notifications work until the provider integration, templates, delivery logs/error handling, and end-to-end tests exist and have passed. This deployment phase must not imply that configuring environment variables alone implements email delivery.

## 7. Rollback plan

Before each production release, record the last known-good frontend deployment, backend deploy/commit, and database backup point. If a release fails:

1. Disable public promotion or revert traffic to the previous frontend deployment.
2. Roll back the backend to the last known-good release.
3. Do not restore an old database backup over new production data without an approved recovery decision; application rollback and data rollback are separate decisions.
4. Preserve logs, document the failure and recovery time, fix in staging, rerun tests, then redeploy.

## Completion criteria

- [ ] Source control and deploy artifacts contain no secrets.
- [ ] Automated backend tests pass and frontend build succeeds.
- [ ] Production backend health/readiness and public configuration endpoints pass.
- [ ] Production frontend HTTPS, direct route refresh, API URL, CORS and asset loading pass.
- [ ] Staging business workflows, authorization, ownership and upload/AI fallback checks pass.
- [ ] Production monitoring, backups and a tested restore plan are documented.
- [ ] Actual URLs, deployment commit IDs, verification date, test account cleanup and rollback references are recorded privately.
- [ ] Approved real company data and email notification workstreams are completed or explicitly marked as launch blockers.

Do not mark Phase 23 fully complete based on a successful deploy alone. Complete the live verification gates and record evidence for each item.
