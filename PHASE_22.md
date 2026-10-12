# Phase 22 — Performance, Accessibility & SEO Audit

## Scope and safety

This phase is based on the verified Phase 21 `SNE5` source. It keeps the existing React/Vite architecture and business APIs. It does not change MongoDB models, authentication rules, order/quotation workflows, or company facts.

### Implemented improvements

- Moved Google Fonts loading from CSS `@import` into the HTML head and added `preconnect` hints. This makes font discovery earlier; the font request still depends on Google Fonts availability.
- Added route-aware document titles, descriptions, Open Graph title/description and robots directives for client-side navigation. Private account/admin routes are marked `noindex, nofollow`.
- Added `client/public/robots.txt` with public crawling allowed and administrative/account paths discouraged from indexing. Robots directives are not a security control; backend authorization remains mandatory.
- Added a keyboard-visible skip link, a main landmark target, focus-visible styling, a labelled main navigation landmark, and expanded/collapsed state for the mobile navigation button.
- Added reduced-motion CSS for visitors whose operating system requests reduced motion.
- Added a conservative SEO default description and social preview metadata in `index.html`. No canonical URL or sitemap is generated because the verified production domain has not been provided.

## Windows verification

Run from the project root in separate CMD windows as needed.

### 1. Backend regression tests

```cmd
cd /d E:\SNEPHASES\SNE6\server
npm ci
npm test
npm run test:e2e:api
```

Expected: all Phase 21 regression and workflow API tests pass. The Phase 22 client-only changes should not alter these tests.

### 2. Production frontend build

```cmd
cd /d E:\SNEPHASES\SNE6\client
npm ci
npm run build
```

Expected: Vite completes without errors and writes `client/dist`. Review any bundle-size warning rather than suppressing it blindly.

### 3. Local route and metadata checks

Run the normal backend and frontend development servers. In the browser, inspect DevTools → Elements and verify:

- `/` has a descriptive title and meta description.
- `/products`, `/portfolio`, `/calculator`, `/appointments` update the title/description after client-side navigation.
- `/account` and `/admin` have `noindex, nofollow` metadata when visited. They must still require authentication/authorization; metadata does not protect data.
- `http://localhost:5173/robots.txt` loads and includes the intended disallow rules.
- `GET /api/health` still reports phase 21 and `GET /api/ready` confirms the DB connection. The phase number is intentionally not changed by this client audit.

### 4. Keyboard accessibility

- Reload the home page and press Tab. The “Skip to main content” link should become visible. Press Enter and verify focus moves to the main content landmark.
- Navigate the desktop and mobile menus with Tab/Shift+Tab and Enter/Space. Focus must remain visible.
- Check mobile navigation button state using DevTools: `aria-expanded` toggles between `true` and `false`, and `aria-controls` points to the mobile navigation container.
- Enable reduced motion in Windows accessibility settings or emulate it in DevTools. Non-essential animation/scroll transitions should be reduced.
- Test forms for visible labels, meaningful errors, logical focus order and usable keyboard submission. This is a manual review, not a claim of WCAG certification.

### 5. Performance audit

Use Chrome DevTools Lighthouse on the production build preview, not only the Vite development server. Run Performance, Accessibility, Best Practices and SEO audits for mobile and desktop. Record the scores, largest-contentful-paint (LCP), cumulative-layout-shift (CLS), total blocking time (TBT) or the current Lighthouse replacement metric, and all critical/serious accessibility findings. Compare results before and after any further tuning.

Do not chase a score by hiding errors or removing working features. Inspect oversized images, render-blocking requests, console errors, failed network requests and bundle warnings. Cloudinary-hosted images and externally loaded fonts require a real network test.

## SEO limitations to resolve before production

- The React SPA updates metadata after JavaScript executes. This does not provide server-rendered per-route metadata to every crawler. If search indexing of product/project detail pages is a requirement, consider prerendering or SSR as a separately tested change.
- Do not add a canonical URL or XML sitemap until the company confirms the exact production domain and preferred host (www or non-www), and the public routes intended for indexing.
- Do not publish invented address, phone, email, opening hours, company history, certifications, customer testimonials, or project claims.
- Admin/account paths are marked noindex and listed in robots.txt, but authorization is the actual security boundary.

## Completion criteria

- [ ] `npm test` passes and `npm run test:e2e:api` passes.
- [ ] `npm run build` succeeds on Windows.
- [ ] Health/readiness and existing customer/admin workflows remain intact.
- [ ] Skip link, focus indicator, mobile menu keyboard interaction and reduced-motion behavior verified manually.
- [ ] Lighthouse results recorded; serious issues documented or fixed and re-tested.
- [ ] Company confirms production domain before canonical URLs/sitemap/structured company identity are added.
