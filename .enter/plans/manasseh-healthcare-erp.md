# Manasseh Health Care Management System

## Context

The user wants a brand-new, independent enterprise healthcare ERP: **Manasseh Health Care Management System**. It must include a public marketing site, three role-scoped user portals (Client, Caregiver, Admin ERP), 7 user roles, 11 ERP modules, and role-specific dashboards, backed by a secure database with authentication and row-level security.

Current state: the workspace is a fresh Vite + React 19 + TypeScript + Tailwind + shadcn template (react-router 7, TanStack Query, recharts, framer-motion, sonner, lucide-react, i18n scaffolding). No backend exists yet — Enter Cloud must be enabled.

Confirmed decisions: **seed rich demo data** so every dashboard/portal is immediately usable. Build order: full build in phases.

**Brand assets supplied by the user** (two transparent PNGs):
- `logo1` (936×304, intact): horizontal lockup — line-art heart+house icon in blue (~`#00A0E2`), wordmark "Manasseh" / "Health Care" in near-black (~`#050505`), tagline "Tender Love & Care" in blue. Used on the public header/footer.
- `logo2` (468×647): a **wireframe of the front-page header**, not an asset. It specifies: logo top-left, and the nav items in order: Home · Services · Book our staff · About us · CIW Annual return · Join Us → Application form · Book an appointment · Contact Us, with a footer registration line referencing the **Care Inspectorate Wales (CIW)**. The public site must implement this nav exactly.

Brand color: the logo blue (~`#00A0E2`, hsl ≈ `195 100% 44%`) becomes the primary brand color; near-black navy for text/sidebar depth; white/light surfaces (the wordmark is near-black, so the public header stays light).

**Key platform rules applied:**
- Backend = Enter Cloud (managed Postgres + auth + storage + backend functions). Never say "Supabase" to the user.
- Frontend uses the shadcn design system + Tailwind tokens only; no inline color literals.
- English only (user wrote in English). i18n scaffolding left in place, content in English.
- No `VITE_*` env vars; no direct edits to `auth/storage` schemas.

---

## Architecture Overview

- **Frontend**: React SPA with `createBrowserRouter` (react-router 7). Public site under `/`, authenticated portals under `/portal/{admin,client,caregiver}`.
- **Backend**: Enter Cloud Postgres + email/password auth + storage buckets + a small set of backend functions (admin user provisioning).
- **Auth**: `AuthProvider` context + `RequireRole` route guard. Nav menu is derived from role-based permission map.
- **Data access**: TanStack Query hooks wrapping the Enter Cloud client (`src/lib/supabase.ts`) with typed row definitions in `src/lib/types.ts`.
- **Design system**: logo-blue primary + navy tokens in `src/index.css` + `tailwind.config.ts`, healthcare fonts, reusable shadcn components. The supplied logo PNG is copied into `public/assets/manasseh-logo.png` and rendered in the public header/footer (light surfaces only, since the wordmark is near-black).

## Database Design (Enter Cloud migrations)

Migrations under `supabase/migrations/`. All tables get RLS enabled with role-scoped policies using SQL helper functions `is_super_admin()`, `is_director()`, `is_care_manager()`, `is_caregiver()`, `is_client()`, `is_hr()`, `is_finance()`, `is_compliance()` (each reads the caller's `profiles.role` via `auth.uid()`).

Tables (each listed with key columns):
1. `profiles` — id (FK `auth.users`), email, full_name, phone, avatar_url, role (enum: super_admin|director|care_manager|caregiver|client|hr_manager|finance_officer|compliance_officer), status, created_at.
2. `clients` — profile_id, reference (e.g. `MH-0001`), dob, gender, address, emergency_contact_name/phone, medical_conditions[], allergies[], gp_name, gp_phone, care_manager_id (FK profiles), funding_source, status.
3. `staff` — profile_id, staff_number, department, job_title, employment_status, hourly_rate, contract_type, manager_id, dbs_check_status/date, start_date.
4. `care_plans` — client_id, title, description, baseline_notes, start_date, review_date, end_date, status, created_by.
5. `care_plan_tasks` — care_plan_id, title, instructions, frequency, scheduled_time.
6. `appointments` — client_id (nullable), name/email/phone (public booking), appointment_type (initial_assessment|care_review|consultation|staff_booking), requested_date, time_slot, status (pending|confirmed|cancelled|completed), notes.
7. `visits` — client_id, caregiver_id, care_plan_id, scheduled_start/end, check_in_at, check_out_at, status (scheduled|in_progress|completed|missed|cancelled), care_notes, client_feedback.
8. `incidents` — visit_id, client_id, reported_by, severity, category, description, action_taken, status, reported_at, resolved_at.
9. `invoices` — client_id, invoice_number (unique), issue_date, due_date, period_start/end, subtotal, tax, total, status (draft|sent|partial|paid|overdue|cancelled).
10. `invoice_items` — invoice_id, description, quantity, rate, amount.
11. `payments` — invoice_id, amount, method, reference, received_at, status, recorded_by.
12. `messages` — sender_id, receiver_id, client_id, subject, body, read_at, created_at.
13. `notifications` — user_id, title, body, type, link, read_at.
14. `documents` — owner_id, owner_type (client|staff|care_plan|invoice), title, category, file_url, file_name, mime_type, uploaded_by.
15. `qualifications` — staff_id, title, issuer, issue_date, expiry_date, verified.
16. `training` — staff_id, course_title, provider, completion_date, expiry_date, status.
17. `compliance_records` — entity_type (staff|organisation), entity_id, title, type, status (pending|active|expiring|expired), issue_date, expiry_date.
18. `audit_logs` — user_id, action, entity_type, entity_id, details (jsonb).
19. `job_postings` — title, department, location, employment_type, salary_range, description, requirements, status.
20. `job_applications` — job_posting_id, full_name, email, phone, cover_letter, cv_url, status, applied_at.
21. `blog_posts` — title, slug (unique), excerpt, content, cover_url, author_id, status, published_at.
22. `contact_messages` — name, email, phone, subject, message, status.

**Seed migration** creates demo auth users (via `crypt()` into `auth.users`, email-confirmed) for every role with password `Demo@1234`, plus 8–10 clients, 6 caregivers/2 care managers, care plans with tasks, visits (past + today + upcoming), invoices/payments, appointments, incidents, compliance records, qualifications/training, job postings + applications, 3–4 blog posts, documents (placeholder file URLs), messages, notifications.

**Storage buckets**: `documents` (private), `public-assets` (public, for blog covers/avatars). RLS on storage objects mirroring document visibility.

**Backend functions** (`supabase/functions/`):
- `create_user` — verified staff role creates a user with given role + password; inserts `profiles` row and returns credentials.
- `update_user_role` — super_admin/director reassigns role.

## Role → Module Access Matrix

| Role | Access |
|---|---|
| Super Administrator | Everything (all ERP modules + user/role management + settings) |
| Director | Business analytics, reports, dashboards, client/staff/finance read access |
| Care Manager | Clients, care plans, scheduling, visits, appointments, incidents, monitoring |
| Caregiver | Own schedule, assigned clients, visit check-in/out, care notes, incident reporting |
| Client | Own profile, schedule, caregiver, care plans, documents, messages, invoices |
| HR Manager | Recruitment, job postings/applications, staff records, training, qualifications |
| Finance Officer | Invoices, payments, financial reports |
| Compliance Officer | Compliance records, audits, incidents, certificates, regulatory tracking |

## Frontend Structure

New files under `src/`:

- `src/lib/supabase.ts` — Enter Cloud client singleton.
- `src/lib/types.ts` — TS types for all tables + `Role` union + `PermissionMap`.
- `src/lib/api.ts` — typed query helpers (clients, visits, invoices, etc.).
- `src/context/auth.tsx` — `AuthProvider`, `useAuth()`, session + profile loading.
- `src/components/guards/RequireRole.tsx` — route guard (redirects to `/login` or role dashboard).
- `src/components/layouts/PublicLayout.tsx` — public navbar + footer.
- `src/components/layouts/PortalLayout.tsx` — shadcn `SidebarProvider` shell; role-aware nav via `src/lib/navigation.ts`.
- `src/components/shared/` — `StatCard`, `DataTable`, `PageHeader`, `StatusBadge`, `EmptyState`, `FormField` (react-hook-form + zod), `ConfirmDialog`, `Avatar`.

Routes (registered in `src/router.tsx`):
- **Public** (nav order per wireframe): `/` home, `/services`, `/book-staff`, `/about`, `/ciw-annual-return`, `/careers` (Join Us → application form), `/book-appointment`, `/contact`, plus `/blog` and `/blog/:slug` (news, linked from footer/home).
- **Auth**: `/login`.
- **Admin ERP** (`/portal/admin/*`): dashboard, clients (list + detail), users, roles, staff (list + detail), recruitment (postings + applications), care-plans, scheduling (calendar), appointments, visits, finance (invoices + payments), compliance, incidents, reports, documents, messages, blog, settings.
- **Client portal** (`/portal/client/*`): dashboard, profile, schedule, caregiver, care-plans, documents, messages, invoices.
- **Caregiver portal** (`/portal/caregiver/*`): dashboard, schedule, clients, visits (check-in/out), incidents, notifications.

## Design System

- Copy the supplied transparent logo PNG into `public/assets/manasseh-logo.png`; render it in the public navbar (top-left, per wireframe) and footer. Light header/footer backgrounds so the near-black wordmark stays readable. Optionally derive a favicon from the logo's icon mark.
- Update `src/index.css` + `tailwind.config.ts`: primary = logo blue (`hsl(195 100% 44%)`), deep navy foreground/sidebar, `--gradient-primary` blue→teal, soft shadows, focus rings. Add brand fonts via Google Fonts link in `index.html` (display + body pairing).
- Keep existing shadcn components; add variants where needed (e.g. `StatusBadge` color variants mapped to status enums).
- Dark-mode-aware (light default, dark styles verified).

## Public Header & Footer (per user wireframe)

- Header: logo left; nav right: Home · Services · Book our staff · About us · CIW Annual return · Join Us · Book an appointment · Contact Us; prominent "Book an appointment" CTA; mobile hamburger menu.
- Footer: dark navy, logo + tagline, contact info, nav links, and registration line e.g. "Registered with the Care Inspectorate Wales (CIW)".
- Pages: Home (hero with logo identity, services highlights, why-us, testimonials, blog teaser, CTA), Services (care service catalog), Book our staff (request form → `appointments` with type `staff_booking`), About (company story, values, team, regulatory), CIW Annual return (public compliance page reading `documents` category `ciw_annual_return`), Careers (job postings + application form → `job_applications`), Book an appointment (booking form → `appointments`), Contact (form → `contact_messages`, map/contact cards), Blog (list + post from `blog_posts`).

## Implementation checklist

- [x] Enable Enter Cloud (`supabase_enable`) and load `enter_cloud` skill references (database, auth, edge-functions).
- [x] Create `src/integrations/supabase/client.ts` (framework-generated) + `src/lib/types.ts` (all table types + `Role` union + permission map).
- [x] Migration 1 — schema: create all 22 tables with FKs, enums, indexes, updated_at triggers (plus `clients.full_name` backfill).
- [x] Migration 2 — RLS: enable RLS on every table; add role-scoped policies using helper role functions; client care-team profile policy.
- [x] Migration 3 — seed: demo auth users (all 8 roles, password `Demo@1234`), clients, staff, care plans/tasks, visits, invoices/payments, appointments, incidents, compliance, training, job postings/applications, blog posts, messages, notifications.
- [x] Backend function `create-user` + `update-user-role` deployed (service-role admin provisioning).
- [x] Design tokens: logo-blue/navy palette, fonts (Fraunces + Hanken Grotesk), gradients, shadows in `index.css` + `tailwind.config.ts`; logo PNGs copied into `public/assets/` (colour + white variants); `index.html` meta/title/fonts.
- [x] `AuthProvider` + `RequireRole` guard + `/login` page with role redirect + demo account shortcuts.
- [x] `PublicLayout` (logo header + wireframe nav + footer with CIW line) + public pages: Home, Services, Book our staff, About, CIW Annual return, Careers, Book an appointment, Contact, Blog, Blog post.
- [x] `PortalLayout` + role-aware `navigation.ts` sidebar.
- [x] Admin ERP: dashboard, Clients + detail, Users (create via function), Roles & Permissions (reassign via function), Staff + training/qualifications, Recruitment, Care Plans + tasks, Scheduling calendar, Appointments, Visits, Finance (invoices + payments), Compliance + audit log, Incidents, Reports (recharts), Documents, Messages, Enquiries, Blog admin, Settings.
- [x] Client portal: dashboard, profile, schedule, caregiver, care-plans, documents, messages, invoices.
- [x] Caregiver portal: dashboard, schedule, clients, visit check-in/out + care notes, incident reporting, notifications.
- [x] Responsive pass: mobile sidebar (shadcn mobile sheet), public site mobile nav, single-column stacking verified at 390px.
- [x] Replace template Index/NotFound with branded public home + 404 linking to `/`.

## Verification checklist

- [x] `pnpm lint` and `pnpm exec tsc --noEmit` pass with zero errors.
- [x] `pnpm run build` succeeds.
- [x] Login as seeded roles (Super Admin, Caregiver, Client, Finance) with `Demo@1234`; each lands on its own dashboard and sees only permitted nav (verified visually + via API).
- [x] RLS verified via API: superadmin sees 8 clients; client1 sees only own client/invoices/profile; caregiver1 sees own visits + 2 assigned clients; finance sees all invoices; client insert into invoices rejected (42501).
- [x] Unauthenticated user hitting `/portal/*` is redirected to `/login` (verified via redirect flow).
- [x] Public header shows the supplied logo (transparent, readable wordmark) top-left with the 8 wireframe nav items; footer shows the CIW registration line.
- [x] Public flows write rows: anon inserts to `appointments` (201) and `job_applications` (201); anon select on appointments returns empty (RLS read block).
- [x] Admin can create a user via `create-user` backend function (deployed ACTIVE); role reassignment via `update-user-role` (deployed ACTIVE).
- [x] Visit check-in/out updates `visits` status/timestamps (caregiver UI); incident reporting writes `incidents`.
- [x] Invoice → payment updates status to `paid`/`partial` (finance UI).
- [x] Responsive verified with `website_screenshot` at `mobile_390` and `desktop_1280` on public home, admin dashboard, login, finance, and portal dashboards.
- [x] Blog/Careers public pages render seeded content; contact + appointment forms show success toasts.
