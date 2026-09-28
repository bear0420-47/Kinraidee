# Implementation Plan

## Status

Approved — full-app build plan updated through 2026-09-28 decisions. Implementation work may begin from this plan; production deployment still requires separate approval.

## Build Boundary

- Build the full application with React, Express, PostgreSQL, and Prisma using the stack locked in `docs/03-implementation/engineering-guidelines.md`.
- The public meal-recommendation workflow remains available without login.
- Registered users and administrators share the `User` model with `USER` and `ADMIN` roles.
- Authentication uses email/password, Argon2id password hashes, and a JWT stored in an HTTP-only cookie with a 7-day lifetime.
- Administrators manage zones, food types, tastes, restaurants, and menu items through protected APIs and admin screens.
- Catalog and account data are stored in PostgreSQL through Prisma.
- The web application deploys to Cloudflare Pages as a static Vite React SPA.
- The Express API deploys to Koyeb as a stateless web service.
- The approved production PostgreSQL provider is Koyeb Serverless Postgres once production deployment is explicitly approved; Prisma migrations remain provider-neutral so the database can move to Neon or another PostgreSQL provider if production quota or reliability requires it.
- Restaurant and menu-item images accept approved external URLs in every environment. Development/test may also use the internal `/uploads` directory; PostgreSQL stores only image keys and delivered URLs, never image blobs. Production internal uploads remain disabled until durable object storage is implemented.
- Recommendation conditions and rejected menu-item IDs remain in web `sessionStorage`; they are not persisted in PostgreSQL.
- The recommendation API is stateless and receives current conditions and rejected menu-item IDs with each request.
- Registered users can save menu-item favorites, one set of default zone, food type, taste, and budget preferences, and selected-menu history.
- Persistent food exclusions and detailed recommendation telemetry remain pending their separate privacy, retention, and schema decisions.
- GPS, latitude/longitude, ordering, payment, delivery fulfillment, public reviews, and external restaurant-provider data remain out of scope.
- Schema decisions in `docs/03-implementation/data-model.md` are the source of truth for Prisma model implementation.

## Proposed Sequence

1. Confirm the requirements, full-app build boundary, and this implementation plan with the human approver.
2. Implement the locked Prisma models and migrations from `docs/03-implementation/data-model.md`.
3. Add database seed support for the initial administrator and approved catalog starter data.
   - Seed data includes the initial administrator, minimum master data, and local/demo sample restaurant/menu data. Admin UI remains the source for maintaining real catalog data.
   - The seeded administrator is the only administrator in the first full-app pass; no admin creation or role-management flow is implemented.
4. Implement authentication with email/password, Argon2id, JWT cookies, and `USER`/`ADMIN` authorization.
5. Implement protected admin modules for zones, food types, tastes, restaurants, and menu items.
6. Implement minimized `AuditLog` records for protected catalog mutations.
7. Implement the public catalog queries required by recommendation filtering and result display.
8. Implement the stateless recommendation API for conditions, shortlist, reject/no-repeat, edit, and new-session flows.
   - Apply F19 restaurant diversity after mandatory filters and rejected-item exclusions: fill distinct restaurant slots first, then allow repeated restaurants only when necessary.
9. Implement the public React meal flow using the approved user journey, design system, typed OpenAPI client, and `sessionStorage` state.
   - Implement against the human-approved user journey and visual baseline in `docs/02-design/`; do not treat exploratory behavior in `wireframe.html` as requirements.
10. Implement registered-user favorites, saved default recommendation preferences, and selected-menu history.
11. Implement React admin screens for catalog CRUD and audit-log review.
12. Add focused unit, integration, authorization, validation, recommendation, accessibility, and verification checks.
13. Run build, test, lint, typecheck, format, and required design/requirement audits; record exact results in `docs/verification.md`.
14. Complete `docs/REVIEW.md`, resolve findings, and request human approval for the pull request.
15. Request production deployment approval separately before creating or exposing public Cloudflare Pages, Koyeb API, Koyeb Postgres, or future production object-storage resources.

## Deferred Work

- Persistent food exclusions or allergy-related profiles.
- Detailed recommendation telemetry, including displayed shortlists, rejected menu-item IDs, and full recommendation-session conditions.
- GPS and distance-based recommendation.
- Group voting.
- Promotions, delivery fees, ratings, and external restaurant integrations. Wait-time data is outside the product scope.
- Consent evidence schemas unless an approved feature activates consent requirements.
- Computer Crime Act traffic-retention schemas unless accountable legal review confirms applicability.
- Self-service password reset, email delivery, and password-reset token flows.
- Registered-user password-change flow.
- Cloudflare R2 or another durable production object-storage integration. Until then, production accepts approved external image URLs and does not enable internal uploads.

## Evidence Expected

- Requirement decisions: `docs/01-requirements/intent.md`, the current specification under `docs/01-requirements/01-spec/`, and `docs/01-requirements/backlog.md`.
- Schema decisions: `docs/03-implementation/data-model.md`.
- Engineering and stack decisions: `docs/03-implementation/engineering-guidelines.md`.
- Implementation decisions and deviations: this file and the relevant implementation-ready GitHub issue.
- Verification commands and results: `docs/verification.md`.
- Bug, security, PDPA, and requirement review: `docs/REVIEW.md`.

## Deployment Decisions

- Web hosting: Cloudflare Pages.
- Reason: the web app is a static Vite React SPA, Cloudflare Pages has no runtime cold start for static assets, its free tier is generous for static requests and bandwidth, and it supports team Git workflows.
- Web conditions: configure SPA fallback for React Router, set `VITE_API_BASE_URL` per environment, and do not use Pages Functions in the first full-app pass.
- API hosting: Koyeb.
- API conditions: deploy the Express API from Git or a reproducible container, keep it stateless, expose `/health`, store configuration in environment variables, do not depend on local disk persistence, and accept free-tier sleep/cold-start and resource limits until production requirements justify a paid deployment.
- Database hosting: Koyeb Serverless Postgres for the approved production environment.
- Database conditions: use the standard PostgreSQL connection string through Prisma, do not use Koyeb-specific database features in application code, commit all Prisma migrations, and reassess Neon or another PostgreSQL provider only if production quota, latency, capacity, or reliability becomes insufficient.
- Development/test image storage: internal ignored directory served from `/uploads`; uploads require an authenticated administrator, validate actual image type and size, and use generated filenames.
- Production image storage before the deferred R2 issue: approved external image URLs only. The local upload route and `/uploads` static serving remain disabled because Koyeb local disk is not durable application storage.
- Future durable object-storage integration must preserve the `imageKey`/`imageUrl` contract. Soft deletion keeps the referenced image; replacement removes a superseded internally owned object only after the database safely points to the new object.

## Deployment Boundary

- Development and verification run locally by default.
- Creating or exposing Cloudflare Pages, Koyeb API, Koyeb Postgres, or future production object-storage resources is treated as public production deployment.
- Do not deploy publicly until the human explicitly approves production deployment after verification, privacy review, and deployment review.
- Production deployment is blocked until an accountable human/legal reviewer confirms whether Computer Crime Act Section 26 traffic-log duties apply.
- Do not implement traffic-log storage before that confirmation. `AuditLog` is not a substitute for legal traffic logs.
- If Section 26 applies, approve a separate traffic-log schema, required fields, access rules, security controls, and retention configuration before production deployment.
