# Manasseh Health Care Management System

## Context

The user wants a brand-new, independent enterprise healthcare ERP: **Manasseh Health Care Management System**. It must include a public marketing site, three role-scoped user portals (Client, Caregiver, Admin ERP), 7 user roles, 11 ERP modules, and role-specific dashboards, backed by a secure database with authentication and row-level security.

Current state: the workspace is a fresh Vite + React 19 + TypeScript + Tailwind + shadcn template (react-router 7, TanStack Query, recharts, framer-motion, sonner, lucide-react, i18n scaffolding). No backend exists yet — Enter Cloud must be enabled.

Confirmed decisions (user selected "option 1"): **clinical teal + deep navy** brand; **seed rich demo data** so every dashboard/portal is immediately usable. Build order: full build in phases.

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
- **Design system**: clinical teal + deep navy tokens in `src/index.css` + `tailwind.config.ts`, healthcare fonts, reusable shadcn components.

## Database Design (Enter Cloud migrations)

Migrations under `supabase/migrations/`. All tables get RLS enabled with role-scoped policies using SQL helper functions `is_super_admin()`, `is_director()`, `is_care_manager()`, `is_caregiver()`, `is_client()`, `is_hr()`, `is_finance()`, `is_compliance()` (each reads the caller's `profiles.role` via `auth.uid()`).

Tables (each listed with key columns):
1. `profiles` — id (FK `auth.users`), email, full_name, phone, avatar_url, role (enum: super_admin|director|care_manager|caregiver|client|hr_manager|finance_officer|compliance_officer), status, created_at.
2. `clients` — profile_id, reference (e.g. `MH-0001`), dob, gender, address, emergency_contact_name/phone, medical_conditions[], allergies[], gp_name, gp_phone, care_manager_id (FK profiles), funding_source, status.
3. `staff` — profile_id, staff_number, department, job_title, employment_status, hourly_rate, contract_type, manager_id, dbs_check_status/date, start_date.
4. `care_plans` — client_id, title, description, baseline_notes, start_date, review_date, end_date, status, created_by.
5. `care_plan_tasks` — care_plan_id, title, instructions, frequency, scheduled_time.
6. `appointments` — client_id (nullable), name/email/phone (public booking), appointment_type, requested_date, time_slot, status (pending|confirmed|cancelled|completed), notes.
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
- **Public**: `/` home, `/services`, `/about`, `/contact`, `/book-appointment`, `/careers`, `/blog`, `/blog/:slug`.
- **Auth**: `/login`.
- **Admin ERP** (`/portal/admin/*`): dashboard, clients (list + detail), users, roles, staff (list + detail), recruitment (postings + applications), care-plans, scheduling (calendar), appointments, visits, finance (invoices + payments), compliance, incidents, reports, documents, messages, blog, settings.
- **Client portal** (`/portal/client/*`): dashboard, profile, schedule, caregiver, care-plans, documents, messages, invoices.
- **Caregiver portal** (`/portal/caregiver/*`): dashboard, schedule, clients, visits (check-in/out), incidents, notifications.

## Design System

- Update `src/index.css` + `tailwind.config.ts`: primary teal (`~172` hue), deep navy foreground/sidebar, `--gradient-primary`, soft shadows, focus rings. Add brand fonts via Google Fonts link in `index.html` (display + body pairing, e.g. a clean humanist sans + refined serif accent for headings).
- Keep existing shadcn components; add variants where needed (e.g. `StatusBadge` color variants mapped to status enums).
- Dark-mode-aware (light default, dark styles verified).

## Implementation checklist

- [ ] Enable Enter Cloud (`supabase_enable`) and load `enter_cloud` skill references (database, auth, edge-functions).
- [ ] Create `src/lib/supabase.ts` client + `src/lib/types.ts` (all table types + `Role` union + permission map).
- [ ] Migration 1 — schema: create all 22 tables with FKs, enums, indexes, updated_at triggers.
- [ ] Migration 2 — RLS: enable RLS on every table; add role-scoped policies using helper role functions; storage bucket policies.
- [ ] Migration 3 — seed: demo auth users (all 8 roles, password `Demo@1234`), clients, staff, care plans/tasks, visits, invoices/payments, appointments, incidents, compliance, training, job postings/applications, blog posts, messages, notifications.
- [ ] Backend function `create_user` + `update_user_role` (service-role admin provisioning).
- [ ] Design tokens: teal/navy palette, fonts, gradients, shadows in `index.css` + `tailwind.config.ts`; update `index.html` meta/title/fonts.
- [ ] `AuthProvider` + `RequireRole` guard + `/login` page with role redirect.
- [ ] `PublicLayout` + public pages: Home, Services, About, Contact (form → `contact_messages`), Book Appointment (form → `appointments`), Careers (postings + application form → `job_applications`), Blog list + Blog post (from `blog_posts`).
- [ ] `PortalLayout` + role-aware `navigation.ts` sidebar.
- [ ] Admin ERP: dashboard (KPIs via aggregate queries), Clients (CRM list/detail/add), Users + Roles management, Staff (list/detail + training/qualifications), Recruitment (postings + applications pipeline), Care Plans (CRUD + tasks), Scheduling calendar, Appointments (approve/cancel), Visits (status tracking), Finance (invoices + items + payments + overdue), Compliance (records + audits), Incidents, Reports (recharts: revenue, visits, client mix), Documents, Messages, Blog admin, Settings.
- [ ] Client portal: dashboard, profile, schedule, caregiver, care-plans, documents, messages, invoices (payable view).
- [ ] Caregiver portal: dashboard, schedule, clients, visit check-in/out + care notes, incident reporting, notifications.
- [ ] Responsive pass: mobile sidebar (shadcn mobile sheet), public site mobile nav, tables → cards on small screens.
- [ ] Replace template Index/NotFound with branded public home + 404 linking to `/`.

## Verification checklist

- [ ] `pnpm lint` and `pnpm exec tsc --noEmit` pass with zero errors.
- [ ] `pnpm run build` succeeds.
- [ ] Login as each seeded role (Super Admin, Director, Care Manager, Caregiver, Client, HR, Finance, Compliance) with `Demo@1234`; each lands on its own dashboard and sees only permitted nav items.
- [ ] Client portal shows only own data; caregiver sees only assigned clients/visits (RLS enforced client-side and server-side).
- [ ] Unauthenticated user hitting `/portal/*` is redirected to `/login`; a wrong-role user is redirected to their own dashboard.
- [ ] Public flows write rows: contact form → `contact_messages`; appointment booking → `appointments` (pending); job application → `job_applications`.
- [ ] Admin can create a user via `create_user` backend function; new user can log in and is restricted to their role.
- [ ] Visit check-in/out updates `visits` status and timestamps; incident creation appears in compliance officer's view.
- [ ] Invoice → payment updates status to `paid`; overdue invoices flagged in finance view.
- [ ] Responsive check with `website_screenshot` at `mobile_390` and `desktop_1280` on the public home, admin dashboard, and one portal page each.
- [ ] Blog/Careers public pages render seeded content; contact + appointment pages show success toasts.
