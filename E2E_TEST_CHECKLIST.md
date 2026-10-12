# Shahnawaz Enterprises — End-to-End Test Checklist

**Environment:** ☐ Local with test DB ☐ Staging  
**Build/commit:** ____________________  
**Tester/date:** ____________________  
**Test database name (never paste credentials):** ____________________

> Use only test customer data and a dedicated test/staging database. Never run destructive test cases against the live company database. Do not paste passwords, tokens, MongoDB URIs, or Cloudinary secrets into this document.

Status key: `PASS` / `FAIL` / `BLOCKED` / `NOT RUN`.

| ID | Journey / verification | Expected result | Status | Evidence / notes |
|---|---|---|---|---|
| E2E-01 | Customer registers with valid details | Account created once; password not returned; customer session established | NOT RUN | |
| E2E-02 | Duplicate registration | Controlled conflict; no duplicate account | NOT RUN | |
| E2E-03 | Customer logs in and opens profile | Correct customer identity; no password/hash exposed | NOT RUN | |
| E2E-04 | Invalid login and logout/token removal | Error is controlled; protected pages/data no longer accessible without a valid token | NOT RUN | |
| E2E-05 | Browse catalog and product detail | Only published/active products appear publicly; detail and images render | NOT RUN | |
| E2E-06 | Calculate one-item estimate | Estimate contains line items, breakdown, currency, and preliminary-rate disclaimer | NOT RUN | |
| E2E-07 | Calculate multi-item estimate | Sum and line-item count agree; invalid/empty items are rejected | NOT RUN | |
| E2E-08 | Submit customer quotation | Request is saved and visible in the correct customer's account | NOT RUN | |
| E2E-09 | Admin reviews/updates quotation | Admin can manage it; non-admin cannot; customer sees authorized status | NOT RUN | |
| E2E-10 | Approve eligible quotation/create order | One linked order is created; customer and admin views agree | NOT RUN | |
| E2E-11 | Order ownership isolation | Customer A cannot view or modify Customer B's order by changing an ID | NOT RUN | |
| E2E-12 | Create invoice from eligible order | Invoice is linked to the correct order/customer; amounts are consistent | NOT RUN | |
| E2E-13 | Record test invoice payment | Payment appears once; totals/balance update correctly; invalid amounts are rejected | NOT RUN | |
| E2E-14 | Create delivery from eligible order | One delivery record linked to the order; address data is validated | NOT RUN | |
| E2E-15 | Advance delivery status | Only valid transitions accepted; timeline records changes | NOT RUN | |
| E2E-16 | Customer updates delivery address | Allowed before cutoff/status; rejected after locked statuses | NOT RUN | |
| E2E-17 | Book appointment from available slot | Appointment saved with expected date/time/status | NOT RUN | |
| E2E-18 | Double-book the same slot | Second conflicting request is rejected safely | NOT RUN | |
| E2E-19 | Admin updates appointment | Admin status changes appear in customer appointment list | NOT RUN | |
| E2E-20 | Submit review for eligible order | Rating/body validated; duplicate review rejected | NOT RUN | |
| E2E-21 | Review moderation | Pending/unapproved review is not publicly visible; approved review is visible | NOT RUN | |
| E2E-22 | Inventory adjustment | Stock and transaction history update consistently; invalid negative stock is handled per rules | NOT RUN | |
| E2E-23 | Upload product images | Allowed formats/size pass; invalid file types and oversize uploads fail safely | NOT RUN | |
| E2E-24 | Product/portfolio image rendering | Saved Cloudinary URLs, thumbnails, alt text and fallback states render | NOT RUN | |
| E2E-25 | AI recommendations | Valid request returns product suggestions or a documented safe fallback | NOT RUN | |
| E2E-26 | AI chatbot | Valid prompt responds; empty/overlong prompt rejected; no server crash on provider error | NOT RUN | |
| E2E-27 | Customer calls admin endpoint | Request denied; no admin data returned | NOT RUN | |
| E2E-28 | Customer accesses another customer's appointment/invoice/review | Ownership enforced; no other customer's data leaked | NOT RUN | |
| E2E-29 | Refresh/deep link to protected frontend route | Router loads correctly; auth guard behaves correctly | NOT RUN | |
| E2E-30 | Full regression after workflows | Health/readiness, public pages, customer pages, admin pages and image rendering remain functional | NOT RUN | |

## Completion criteria

- [ ] `npm test` passes in `server/`.
- [ ] `npm run build` passes in `client/`.
- [ ] GitHub Actions CI run passes.
- [ ] Every applicable E2E case is marked PASS, or a documented defect/blocker is linked.
- [ ] At least one customer-to-admin journey is completed end-to-end: quotation → order → invoice → delivery.
- [ ] Appointment and review journeys are completed end-to-end.
- [ ] Customer data ownership and administrator access boundaries are verified.
- [ ] Test data is removed/archived according to the staging cleanup plan.
