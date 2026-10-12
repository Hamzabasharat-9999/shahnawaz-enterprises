# Live Production Verification Checklist — Phase 23

Use this checklist only against the staging environment first. Record public URLs in your private project notes; do not record passwords, JWT secrets, API keys, database URIs, or personal customer data here.

## Deployment record
- [ ] Frontend provider/project and deployment ID recorded privately
- [ ] Backend provider/service and deployment ID recorded privately
- [ ] Git commit/release identifier recorded
- [ ] Production frontend URL and backend URL verified over HTTPS
- [ ] MongoDB production database is separate from staging
- [ ] Secret values exist only in host secret settings; no secret files committed
- [ ] Backup and restore procedure documented; test restore completed in a non-production DB

## Endpoint checks
- [ ] `GET /api/health`: HTTP 200, `ok: true`, phase 23
- [ ] `GET /api/ready`: HTTP 200, database connected
- [ ] `/api/company`: approved public company information only
- [ ] `/api/appointments/config`: expected configuration
- [ ] `/api/deliveries/config`: expected configuration
- [ ] `/api/estimates/config`: expected estimate configuration and disclaimer
- [ ] `/api/chatbot/config`: expected chatbot configuration
- [ ] Controlled test confirms readiness fails if the staging DB is unavailable (do not interrupt production DB just to test this)

## Frontend checks
- [ ] HTTPS certificate valid; no mixed content
- [ ] `/`, `/products`, `/portfolio`, `/calculator`, `/appointments` load
- [ ] Direct refresh on React routes works
- [ ] `VITE_API_URL` points to the actual backend `/api` URL; no production request targets localhost
- [ ] Browser console and Network panel have no unexpected errors
- [ ] Images load from the intended Cloudinary account/folder
- [ ] robots.txt and private-route noindex behavior are correct
- [ ] Lighthouse results recorded for mobile and desktop

## Security and workflow checks (staging first)
- [ ] Customer registration, login, logout, invalid credentials and token expiry
- [ ] Admin-only routes reject unauthenticated/non-admin users
- [ ] Customer A cannot access Customer B's quotation/order/invoice/delivery data
- [ ] Estimate → quotation → admin review → order → invoice → delivery flow
- [ ] Appointment booking and status updates
- [ ] Review eligibility and submission
- [ ] Inventory updates and product/portfolio management
- [ ] Cloudinary upload validation and failure handling
- [ ] Chatbot works with configured AI and fallback when AI is unavailable
- [ ] Rate limiting, request size limits and controlled error responses
- [ ] No stack traces, secrets or connection strings returned to browser clients

## Launch blockers / master workstreams
- [ ] Official company data approved by the company
- [ ] Email provider integrated and real end-to-end notification delivery verified
- [ ] Privacy/contact/terms and data retention decisions approved
- [ ] Final security review findings resolved or accepted in writing
- [ ] Full production test and rollback rehearsal completed
- [ ] FYP report, diagrams, test evidence and deployment handover updated

## Results
- Verification date/time:
- Tester:
- Environment: staging / production
- Frontend deployment ID:
- Backend deployment ID:
- Passed items:
- Failed items and evidence:
- Fixes/retest references:
- Rollback reference:

Never write secret values or customer-identifying data into this file.
