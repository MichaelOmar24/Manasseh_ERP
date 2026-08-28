import type { Role } from "./types";
import {
  LayoutDashboard,
  Users,
  UserCog,
  ShieldCheck,
  HeartPulse,
  CalendarDays,
  ClipboardCheck,
  Briefcase,
  Stethoscope,
  FileText,
  Receipt,
  Scale,
  AlertTriangle,
  BarChart3,
  FolderOpen,
  MessageSquare,
  Newspaper,
  Settings,
  User,
  ClipboardList,
  Bell,
  Building2,
  Pill,
  Wallet,
  GraduationCap,
  Mail,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
};

export const rolePortal = (role: Role): string => {
  switch (role) {
    case "client":
      return "/portal/client/dashboard";
    case "caregiver":
      return "/portal/caregiver/dashboard";
    default:
      return "/portal/admin/dashboard";
  }
};

export const adminNav: NavItem[] = [
  { title: "Dashboard", href: "/portal/admin/dashboard", icon: LayoutDashboard, roles: ["super_admin", "director", "care_manager", "hr_manager", "finance_officer", "compliance_officer"] },
  { title: "Clients", href: "/portal/admin/clients", icon: Users, roles: ["super_admin", "director", "care_manager"] },
  { title: "Users", href: "/portal/admin/users", icon: UserCog, roles: ["super_admin", "director", "hr_manager"] },
  { title: "Roles & Permissions", href: "/portal/admin/roles", icon: ShieldCheck, roles: ["super_admin"] },
  { title: "Staff", href: "/portal/admin/staff", icon: Briefcase, roles: ["super_admin", "director", "care_manager", "hr_manager"] },
  { title: "Recruitment", href: "/portal/admin/recruitment", icon: GraduationCap, roles: ["super_admin", "hr_manager"] },
  { title: "Care Plans", href: "/portal/admin/care-plans", icon: HeartPulse, roles: ["super_admin", "director", "care_manager"] },
  { title: "Scheduling", href: "/portal/admin/scheduling", icon: CalendarDays, roles: ["super_admin", "director", "care_manager"] },
  { title: "Appointments", href: "/portal/admin/appointments", icon: Stethoscope, roles: ["super_admin", "director", "care_manager"] },
  { title: "Visits", href: "/portal/admin/visits", icon: ClipboardCheck, roles: ["super_admin", "director", "care_manager"] },
  { title: "Finance", href: "/portal/admin/finance", icon: Wallet, roles: ["super_admin", "director", "finance_officer", "care_manager"] },
  { title: "Compliance", href: "/portal/admin/compliance", icon: Scale, roles: ["super_admin", "director", "compliance_officer", "hr_manager"] },
  { title: "Incidents", href: "/portal/admin/incidents", icon: AlertTriangle, roles: ["super_admin", "director", "care_manager", "compliance_officer"] },
  { title: "Reports", href: "/portal/admin/reports", icon: BarChart3, roles: ["super_admin", "director", "finance_officer"] },
  { title: "Documents", href: "/portal/admin/documents", icon: FolderOpen, roles: ["super_admin", "director", "care_manager", "hr_manager", "finance_officer", "compliance_officer"] },
  { title: "Messages", href: "/portal/admin/messages", icon: MessageSquare, roles: ["super_admin", "director", "care_manager", "hr_manager", "finance_officer", "compliance_officer"] },
  { title: "Email", href: "/portal/admin/email", icon: Mail, roles: ["super_admin", "director", "care_manager", "hr_manager", "finance_officer", "compliance_officer"] },
  { title: "Enquiries", href: "/portal/admin/enquiries", icon: ClipboardList, roles: ["super_admin", "director", "care_manager"] },
  { title: "Blog", href: "/portal/admin/blog", icon: Newspaper, roles: ["super_admin", "director", "care_manager"] },
  { title: "Settings", href: "/portal/admin/settings", icon: Settings, roles: ["super_admin"] },
];

export const clientNav: NavItem[] = [
  { title: "Dashboard", href: "/portal/client/dashboard", icon: LayoutDashboard, roles: ["client"] },
  { title: "My Profile", href: "/portal/client/profile", icon: User, roles: ["client"] },
  { title: "Care Schedule", href: "/portal/client/schedule", icon: CalendarDays, roles: ["client"] },
  { title: "My Caregiver", href: "/portal/client/caregiver", icon: UserCog, roles: ["client"] },
  { title: "Care Plans", href: "/portal/client/care-plans", icon: HeartPulse, roles: ["client"] },
  { title: "Documents", href: "/portal/client/documents", icon: FolderOpen, roles: ["client"] },
  { title: "Messages", href: "/portal/client/messages", icon: MessageSquare, roles: ["client"] },
  { title: "Invoices", href: "/portal/client/invoices", icon: Receipt, roles: ["client"] },
];

export const caregiverNav: NavItem[] = [
  { title: "Dashboard", href: "/portal/caregiver/dashboard", icon: LayoutDashboard, roles: ["caregiver"] },
  { title: "My Schedule", href: "/portal/caregiver/schedule", icon: CalendarDays, roles: ["caregiver"] },
  { title: "My Clients", href: "/portal/caregiver/clients", icon: Users, roles: ["caregiver"] },
  { title: "Visits", href: "/portal/caregiver/visits", icon: ClipboardCheck, roles: ["caregiver"] },
  { title: "Report Incident", href: "/portal/caregiver/incidents", icon: AlertTriangle, roles: ["caregiver"] },
  { title: "Notifications", href: "/portal/caregiver/notifications", icon: Bell, roles: ["caregiver"] },
];

export const NAV_BY_PORTAL: Record<"admin" | "client" | "caregiver", NavItem[]> = {
  admin: adminNav,
  client: clientNav,
  caregiver: caregiverNav,
};

export const portalOfRole = (role: Role): "admin" | "client" | "caregiver" => {
  if (role === "client") return "client";
  if (role === "caregiver") return "caregiver";
  return "admin";
};
