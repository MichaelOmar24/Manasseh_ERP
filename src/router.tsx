import { Navigate } from "react-router-dom";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { PortalLayout } from "@/components/layouts/PortalLayout";
import { RequireRole } from "@/components/guards/RequireRole";
import type { Role } from "@/lib/types";

import Home from "@/pages/public/Home";
import Services from "@/pages/public/Services";
import CleaningServices from "@/pages/public/CleaningServices";
import BookStaff from "@/pages/public/BookStaff";
import About from "@/pages/public/About";
import CIWAnnualReturn from "@/pages/public/CIWAnnualReturn";
import Careers from "@/pages/public/Careers";
import BookAppointment from "@/pages/public/BookAppointment";
import Contact from "@/pages/public/Contact";
import Blog from "@/pages/public/Blog";
import BlogPost from "@/pages/public/BlogPost";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminClients from "@/pages/admin/Clients";
import ClientDetail from "@/pages/admin/ClientDetail";
import AdminUsers from "@/pages/admin/Users";
import AdminRoles from "@/pages/admin/Roles";
import AdminStaff from "@/pages/admin/Staff";
import AdminRecruitment from "@/pages/admin/Recruitment";
import AdminCarePlans from "@/pages/admin/CarePlans";
import AdminScheduling from "@/pages/admin/Scheduling";
import AdminAppointments from "@/pages/admin/Appointments";
import AdminVisits from "@/pages/admin/Visits";
import AdminFinance from "@/pages/admin/Finance";
import AdminCompliance from "@/pages/admin/Compliance";
import AdminIncidents from "@/pages/admin/Incidents";
import AdminReports from "@/pages/admin/Reports";
import AdminDocuments from "@/pages/admin/Documents";
import AdminMessages from "@/pages/admin/Messages";
import AdminEnquiries from "@/pages/admin/Enquiries";
import AdminBlog from "@/pages/admin/BlogAdmin";
import AdminSettings from "@/pages/admin/Settings";

import ClientDashboard from "@/pages/client/Dashboard";
import ClientProfile from "@/pages/client/Profile";
import ClientSchedule from "@/pages/client/Schedule";
import ClientCaregiver from "@/pages/client/Caregiver";
import ClientCarePlans from "@/pages/client/CarePlans";
import ClientDocuments from "@/pages/client/Documents";
import ClientMessages from "@/pages/client/Messages";
import ClientInvoices from "@/pages/client/Invoices";

import CaregiverDashboard from "@/pages/caregiver/Dashboard";
import CaregiverSchedule from "@/pages/caregiver/Schedule";
import CaregiverClients from "@/pages/caregiver/Clients";
import CaregiverVisits from "@/pages/caregiver/Visits";
import CaregiverIncidents from "@/pages/caregiver/Incidents";
import CaregiverNotifications from "@/pages/caregiver/Notifications";

const ADMIN_ROLES: Role[] = [
  "super_admin",
  "director",
  "care_manager",
  "hr_manager",
  "finance_officer",
  "compliance_officer",
];

const adminChild = (path: string, roles: Role[], element: React.ReactNode) => [
  { path, element: <RequireRole roles={roles}>{element}</RequireRole> },
];

export const routers = [
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "services", element: <Services /> },
      { path: "services/cleaning", element: <CleaningServices /> },
      { path: "book-staff", element: <BookStaff /> },
      { path: "about", element: <About /> },
      { path: "ciw-annual-return", element: <CIWAnnualReturn /> },
      { path: "careers", element: <Careers /> },
      { path: "book-appointment", element: <BookAppointment /> },
      { path: "contact", element: <Contact /> },
      { path: "blog", element: <Blog /> },
      { path: "blog/:slug", element: <BlogPost /> },
    ],
  },
  { path: "/login", element: <Login /> },
  {
    path: "/portal/admin",
    element: (
      <RequireRole roles={ADMIN_ROLES}>
        <PortalLayout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      ...adminChild("dashboard", ["super_admin", "director", "care_manager", "hr_manager", "finance_officer", "compliance_officer"], <AdminDashboard />),
      ...adminChild("clients", ["super_admin", "director", "care_manager"], <AdminClients />),
      ...adminChild("clients/:id", ["super_admin", "director", "care_manager"], <ClientDetail />),
      ...adminChild("users", ["super_admin", "director", "hr_manager"], <AdminUsers />),
      ...adminChild("roles", ["super_admin"], <AdminRoles />),
      ...adminChild("staff", ["super_admin", "director", "care_manager", "hr_manager"], <AdminStaff />),
      ...adminChild("recruitment", ["super_admin", "hr_manager"], <AdminRecruitment />),
      ...adminChild("care-plans", ["super_admin", "director", "care_manager"], <AdminCarePlans />),
      ...adminChild("scheduling", ["super_admin", "director", "care_manager"], <AdminScheduling />),
      ...adminChild("appointments", ["super_admin", "director", "care_manager"], <AdminAppointments />),
      ...adminChild("visits", ["super_admin", "director", "care_manager"], <AdminVisits />),
      ...adminChild("finance", ["super_admin", "director", "finance_officer", "care_manager"], <AdminFinance />),
      ...adminChild("compliance", ["super_admin", "director", "compliance_officer", "hr_manager"], <AdminCompliance />),
      ...adminChild("incidents", ["super_admin", "director", "care_manager", "compliance_officer"], <AdminIncidents />),
      ...adminChild("reports", ["super_admin", "director", "finance_officer"], <AdminReports />),
      ...adminChild("documents", ["super_admin", "director", "care_manager", "hr_manager", "finance_officer", "compliance_officer"], <AdminDocuments />),
      ...adminChild("messages", ["super_admin", "director", "care_manager", "hr_manager", "finance_officer", "compliance_officer"], <AdminMessages />),
      ...adminChild("enquiries", ["super_admin", "director", "care_manager"], <AdminEnquiries />),
      ...adminChild("blog", ["super_admin", "director", "care_manager"], <AdminBlog />),
      ...adminChild("settings", ["super_admin"], <AdminSettings />),
    ],
  },
  {
    path: "/portal/client",
    element: (
      <RequireRole roles={["client"]}>
        <PortalLayout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <ClientDashboard /> },
      { path: "profile", element: <ClientProfile /> },
      { path: "schedule", element: <ClientSchedule /> },
      { path: "caregiver", element: <ClientCaregiver /> },
      { path: "care-plans", element: <ClientCarePlans /> },
      { path: "documents", element: <ClientDocuments /> },
      { path: "messages", element: <ClientMessages /> },
      { path: "invoices", element: <ClientInvoices /> },
    ],
  },
  {
    path: "/portal/caregiver",
    element: (
      <RequireRole roles={["caregiver"]}>
        <PortalLayout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <CaregiverDashboard /> },
      { path: "schedule", element: <CaregiverSchedule /> },
      { path: "clients", element: <CaregiverClients /> },
      { path: "visits", element: <CaregiverVisits /> },
      { path: "incidents", element: <CaregiverIncidents /> },
      { path: "notifications", element: <CaregiverNotifications /> },
    ],
  },
  {
    path: "*",
    name: "404",
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
