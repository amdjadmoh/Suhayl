# WannaOut (Suhayl) — Roadmap

A working plan for the next ~30 days, derived from a full structural audit, architectural review, and competitive survey of study-abroad platforms (ApplyBoard, Cialfo, Yocket, Studyportals, CollegeAI, admit.org).

This document is forward-looking. See `README.md` for what the product is and how to run it.

---

## Project summary

A study-abroad university organizer for international students and the agencies that serve them. Two-sided: B2C (individual students) and B2B (agencies managing cohorts). Stack: React 19 + Vite 8 + Tailwind 4 + shadcn/ui on the front, Express 5 + MongoDB/Mongoose on the back. Three roles: `student`, `agency`, `admin`.

## Current state — what works

- **Catalog**: 27 seeded countries with rich visa / cost / pros-cons data; linked cities (with quality-of-life scores), universities, and programs.
- **Application tracker**: 6-stage pipeline (Preparing → Applied → Accepted/Rejected/Waitlisted → Enrolled) plus a per-application checklist (SOP, documents, LORs, test scores, visa, interview, fees).
- **Discovery**: filterable program list (country, degree, tuition, scholarship), program matching by budget / GPA / IELTS / preferred countries, side-by-side compare (max 3), favorites (4 entity types).
- **Notifications**: in-process deadline checker runs every 24h; in-app bell with unread count; client polls every 60s.
- **Agency B2B**: agency users can CRUD students under their agency and manage those students' applications.
- **Admin**: user management and dashboard stats.
- **Auth**: email + password, JWT (7d), bcrypt, role-based route guards.

Domain modeling is the strongest part of the codebase. The 9-model schema captures the workflow well; gaps are concentrated in the security / validation / infra layer and in additive features.

---

## P0 — Ship-blockers (security & production readiness)

These must be fixed before any real user touches the system. Not "features" in the product sense, but their absence makes the rest of the roadmap unsafe to ship.

| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 1 | Unauthenticated application data leak — `GET /api/applications` returns all applications when no token is sent | `server/src/routes/applicationRoutes.ts:13–14`, `server/src/controllers/applicationController.ts:12–23, 55–70` | Change `optionalAuth` to `authenticate` on `GET` routes |
| 2 | Mass assignment — `Model.create(req.body)` / `findByIdAndUpdate(id, req.body)` everywhere; clients can overwrite `isOfficial`, `createdBy`, `agencyId`, `verificationStatus` | All controllers in `server/src/controllers/` | Whitelist allowed fields per endpoint |
| 3 | No input validation — no Zod / Joi / express-validator; emails, passwords, string lengths, numeric coercion are all unchecked | Everywhere; add `server/src/validators/` | Add Zod schemas per route |
| 4 | No rate limiting — `/api/auth/login` and `/api/auth/register` are brute-forceable indefinitely | `server/src/index.ts` | Add `express-rate-limit`, stricter on auth routes |
| 5 | No security headers — no CSP, HSTS, X-Frame-Options | `server/src/index.ts` | Add `helmet` |
| 6 | Hardcoded JWT secret fallback in source — `process.env["JWT_SECRET"] ?? "super_secret_key_for_wannaout_dev"` | `server/src/middleware/auth.ts:13`, `server/src/controllers/authController.ts:7` | Throw on startup if `JWT_SECRET` is unset |
| 7 | CORS hardcoded to `http://localhost:5173` — breaks in production | `server/src/index.ts:38` | Read allowed origins from env |
| 8 | `passwordHash` returned by default in `User.find()` / `User.findById()` | `server/src/models/User.ts:24` | Add `select: false`; explicitly select in login handler |


---

## P0 — Product features for the first beta

| # | Feature | Why | Where | Effort |
|---|---------|-----|-------|--------|
| 10 | Email deadline reminders via Resend | In-app notifications are useless if the user isn't logged in. Students managing 10–20 apps across timezones will miss deadlines without email. The cron already exists. | New `server/src/services/email.ts`, extend `checkDeadlines` in `server/src/index.ts:96–135` | S–M |
| 11 | Deadline `.ics` calendar export | One-click "Add deadlines to my calendar". Universal compatibility (Google/Apple/Outlook). No ongoing infra. | New `GET /api/applications/calendar.ics` using `ical-generator`; button in `client/src/pages/ApplicationsTracker.tsx` | S |
| 12 | University rankings display (QS / THE / ARWU) | Every competitor shows rankings. Currently `University.ranking` is free-text. | Add `qsRank`, `theRank`, `arwuRank` to `server/src/models/University.ts`; badge in `client/src/pages/UniversityDetail.tsx`; admin endpoint to bulk-update | S |
| 13 | CSV export of applications (agencies) | Agencies need spreadsheet views for reporting. | New `GET /api/agency/applications/export.csv` using `papaparse`; button in `client/src/pages/AgencyDashboard.tsx` | S |

---

## P1 — Adds real value

| # | Feature | Why | Where | Effort |
|---|---------|-----|-------|--------|
| 16 | Full-text search across programs and universities | Current search uses `$regex` on a few fields — slow and unranked. | MongoDB `$text` index on `Program` and `University`; replace regex search in `programController.ts`, `universityController.ts` | M |
| 17 | Cost-of-attendance calculator | Students need tuition + living cost + visa fees + insurance = real budget. All data is already in the DB; just not multiplied. | New `client/src/pages/BudgetCalculator.tsx` + `GET /api/budget?programId=...` | M |
| 18 | SOP / personal-statement editor with auto-save and word count | The `Application.personalStatement` field exists but has no editor. | New `client/src/pages/StatementEditor.tsx`, autosave via React Query mutation | M |
| 19 | Admit-chance predictor (heuristic, no ML) | Score programs as Reach / Target / Safety from GPA percentile + IELTS percentile + program competitiveness tier. Killer retention feature (CollegeAI, Yocket, admit.org). | Extend `matches` endpoint in `programController.ts`; display in `client/src/pages/Matches.tsx` | M |
| 20 | Status-change notifications | Today only deadline changes trigger notifications. Application moves to Accepted / Rejected should ping the user. | Extend `applicationController.ts` update handler to emit a `Notification` | S |
| 21 | Bulk CSV import of students (agencies) | Agencies won't manually enter students. ApplyBoard and Cialfo have this. | New `POST /api/agency/students/import` using `papaparse`; UI in `AgencyStudents.tsx` | M |
| 22 | Saved searches / filter presets | Students re-run the same searches repeatedly. | New `SavedSearch` model; UI in `Programs.tsx` and `Universities.tsx` | S |
| 23 | Sentry error tracking (client + server) + structured logging | Production errors are invisible today. | Add `@sentry/react` and `@sentry/node`; replace `console.log` with `pino` in `server/src/index.ts` | S–M |
| 24 | Mongoose indexes on hot query paths | `Application` has zero indexes despite filtering by `createdBy`, `agencyId`, `applicationStatus`, `applicationDeadline` constantly. | `server/src/models/Application.ts`, `Program.ts`, `University.ts` | S |

---

## P2 — Differentiators (later)

| # | Feature | Notes |
|---|---------|-------|
| 25 | PDF export of application summary (`@react-pdf/renderer`) | Tangible "I did this" artifact |
| 26 | Share-by-link (read-only signed URL) | Student shares progress with parents / sponsors |
| 27 | Visa step-by-step wizard | Country-specific checklist, fee links, appointment booking. You already have the data. |
| 28 | Multi-counselor agency accounts | Currently an agency = one user. Add `counselor` sub-role and `counselorId` on `Student` |
| 29 | Pipeline funnel analytics for agencies | "100 students → 60 applied → 30 accepted → 20 enrolled" (Cialfo's killer B2B feature) |
| 30 | PWA support (manifest, service worker, app badge) | 90% of mobile value at 5% the cost of a native app |
| 31 | i18n + RTL (French, Arabic) | Unlocks the Algerian / North African market that the seed data targets |
| 32 | Blocked-account / financial-proof tracker | Germany, Netherlands, etc. require this; you have the data |
| 33 | AI SOP review (Haiku or GPT-4o-mini) | Hook into the SOP editor; structured JSON: clarity / alignment / grammar. ~$0.01/review with prompt caching |
| 34 | Premium tier (Stripe) | Unlock unlimited apps, AI features, larger compare limit. Enables monetization. |
| 35 | Pre-departure / arrival checklist | After acceptance: flight, insurance, SIM, housing, orientation |
| 36 | Student reviews of universities / programs | Builds catalog credibility (Studyportals, Educations.com) |

---

## Anti-features — do not build yet

| Feature | Why not |
|---------|---------|
| In-app chat / messaging | 200+ hours for WebSockets, persistence, typing indicators, moderation. Use email + a notes field. |
| Native iOS / Android apps | 400+ hours, App Store compliance, push infra. A well-tuned PWA covers 90% of the use case. |
| In-platform application-fee payment | Requires PCI-DSS, Stripe Connect, fraud monitoring. No revenue model yet. Keep a `Fee URL` field. |
| In-platform test prep (practice tests) | Magoosh / ETS / Kaplan own this vertical. Just link out. |
| Real-time WebSockets | Your 60s polling is correct for ~20 apps/user. Upgrade to SSE only if/when chat is added. |
| Custom Google Calendar OAuth push | Webhook channels expire every 7 days; maintenance cost is not justified at <10k users. Use static `.ics` instead. |

---

## Suggested 30-day sequence

### Week 1 — Security & infra P0 (items 1–9)
Fix the data leak, add Zod + helmet + rate limit, env-based CORS, JWT secret enforcement, `select: false` on `passwordHash`, Mongoose indexes, and a Vitest + Supertest smoke suite. Add GitHub Actions CI. The product should be safe to serve a small beta cohort by end of week.

### Week 2 — Visible quick wins (items 10–13)
Email deadline reminders (Resend), `.ics` export, university rankings badges, CSV export. All small, all user-visible. The cron extension for email is the highest-leverage single feature in the whole plan.

### Week 3 — Files + deploy (items 14, 23, Docker)
File uploads to Cloudflare R2 (SOP, transcripts, resume), Dockerfile + docker-compose for reproducible environments, Sentry + pino logging. After this, the product has real document handling and ops visibility.

### Week 4 — Highest-leverage feature
Pick based on primary user base:
- **If individual students dominate** → build the cost-of-attendance calculator (item 17) + admit-chance predictor (item 19). High engagement, low churn risk.
- **If agencies dominate** → build bulk student CSV import (item 21) + pipeline funnel analytics (item 29). This is what sells the B2B subscription.

---

## Definition of done for this roadmap

By end of week 4 the product should be able to:
- Serve a 50-user beta cohort without security incidents
- Send an email reminder 7 days before any application deadline
- Allow a student to attach a SOP PDF to an application
- Allow an agency to import 100 students from a spreadsheet
- Be deployed via `docker-compose up` from a fresh checkout
- Surface any client or server error in Sentry within 60 seconds

---

## Open questions

Decide before week 2 to avoid wasted work:

1. **B2C vs B2B primary?** Affects whether to prioritize student-facing features (cost calculator, SOP editor) or agency-facing features (multi-counselor, funnel analytics).
2. **Target geographies for i18n?** The seed data is heavy on Algeria / North Africa. French + Arabic with RTL is the natural next language pair if so.
3. **Monetization model?** Free forever (pure personal tool) → skip payment, PWA, premium tier. Freemium (premium tier) → build Stripe and a paywall. Agency SaaS → build multi-counselor and per-seat billing.
4. **Hosting target?** Affects whether to invest in Docker, S3-compatible storage, and CI now, or defer to a later sprint.
5. **Data residency / GDPR posture?** If real EU students are in scope, the security P0 list is non-negotiable and the data-leak fix jumps to day 1.
