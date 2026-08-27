import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Appointment,
  BlogPost,
  CarePlan,
  CarePlanTask,
  Client,
  ComplianceRecord,
  ContactMessage,
  Document,
  Incident,
  Invoice,
  InvoiceItem,
  JobApplication,
  JobPosting,
  Message,
  Notification,
  Payment,
  Profile,
  Qualification,
  Staff,
  Training,
  Visit,
} from "./types";

const list = <T,>(table: string, order = "created_at") =>
  ({
    queryKey: [table],
    queryFn: async (): Promise<T[]> => {
      const { data, error } = await supabase
        .from(table as never)
        .select("*")
        .order(order, { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as T[];
    },
  }) as const;

export const useProfiles = () =>
  useQuery({ ...list<Profile>("profiles"), queryKey: ["profiles"] });
export const useClients = () =>
  useQuery({ ...list<Client>("clients"), queryKey: ["clients"] });
export const useStaff = () =>
  useQuery({
    queryKey: ["staff"],
    queryFn: async (): Promise<Staff[]> => {
      const { data, error } = await supabase
        .from("staff")
        .select("*, profiles(full_name, email, phone, role)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Staff[];
    },
  });
export const useCarePlans = () =>
  useQuery({
    queryKey: ["care_plans"],
    queryFn: async (): Promise<CarePlan[]> => {
      const { data, error } = await supabase
        .from("care_plans")
        .select("*, clients(reference, profile_id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as CarePlan[];
    },
  });
export const useCarePlanTasks = (planId?: string) =>
  useQuery({
    queryKey: ["care_plan_tasks", planId],
    queryFn: async (): Promise<CarePlanTask[]> => {
      let q = supabase.from("care_plan_tasks").select("*").order("scheduled_time");
      if (planId) q = q.eq("care_plan_id", planId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as CarePlanTask[];
    },
  });
export const useAppointments = () =>
  useQuery({ ...list<Appointment>("appointments", "requested_date"), queryKey: ["appointments"] });
export const useVisits = () =>
  useQuery({
    queryKey: ["visits"],
    queryFn: async (): Promise<Visit[]> => {
      const { data, error } = await supabase
        .from("visits")
        .select("*, clients(reference, address, profile_id), profiles(full_name)")
        .order("scheduled_start", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Visit[];
    },
  });
export const useIncidents = () =>
  useQuery({
    queryKey: ["incidents"],
    queryFn: async (): Promise<Incident[]> => {
      const { data, error } = await supabase
        .from("incidents")
        .select("*, clients(reference, profile_id), profiles(full_name)")
        .order("reported_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Incident[];
    },
  });
export const useInvoices = () =>
  useQuery({
    queryKey: ["invoices"],
    queryFn: async (): Promise<Invoice[]> => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, clients(reference, profile_id)")
        .order("issue_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Invoice[];
    },
  });
export const useInvoiceItems = (invoiceId?: string) =>
  useQuery({
    queryKey: ["invoice_items", invoiceId],
    queryFn: async (): Promise<InvoiceItem[]> => {
      let q = supabase.from("invoice_items").select("*");
      if (invoiceId) q = q.eq("invoice_id", invoiceId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as InvoiceItem[];
    },
  });
export const usePayments = (invoiceId?: string) =>
  useQuery({
    queryKey: ["payments", invoiceId],
    queryFn: async (): Promise<Payment[]> => {
      let q = supabase.from("payments").select("*").order("received_at", { ascending: false });
      if (invoiceId) q = q.eq("invoice_id", invoiceId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as Payment[];
    },
  });
export const useMessages = () =>
  useQuery({
    queryKey: ["messages"],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("*, senders:profiles!messages_sender_id_fkey(full_name), receivers:profiles!messages_receiver_id_fkey(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Message[];
    },
  });
export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: async (): Promise<Notification[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Notification[];
    },
  });
export const useDocuments = () =>
  useQuery({ ...list<Document>("documents"), queryKey: ["documents"] });
export const useQualifications = (staffId?: string) =>
  useQuery({
    queryKey: ["qualifications", staffId],
    queryFn: async (): Promise<Qualification[]> => {
      let q = supabase.from("qualifications").select("*").order("issue_date", { ascending: false });
      if (staffId) q = q.eq("staff_id", staffId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as Qualification[];
    },
  });
export const useTraining = (staffId?: string) =>
  useQuery({
    queryKey: ["training", staffId],
    queryFn: async (): Promise<Training[]> => {
      let q = supabase.from("training").select("*").order("completion_date", { ascending: false });
      if (staffId) q = q.eq("staff_id", staffId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as Training[];
    },
  });
export const useComplianceRecords = () =>
  useQuery({ ...list<ComplianceRecord>("compliance_records"), queryKey: ["compliance_records"] });
export const useJobPostings = () =>
  useQuery({ ...list<JobPosting>("job_postings"), queryKey: ["job_postings"] });
export const useJobApplications = () =>
  useQuery({
    queryKey: ["job_applications"],
    queryFn: async (): Promise<JobApplication[]> => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*, job_postings(title)")
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as JobApplication[];
    },
  });
export const useBlogPosts = () =>
  useQuery({
    queryKey: ["blog_posts"],
    queryFn: async (): Promise<BlogPost[]> => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, profiles(full_name)")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as BlogPost[];
    },
  });
export const useContactMessages = () =>
  useQuery({ ...list<ContactMessage>("contact_messages"), queryKey: ["contact_messages"] });
export const useAuditLogs = () =>
  useQuery({ ...list<{ id: string; action: string; created_at: string; details: unknown }>("audit_logs"), queryKey: ["audit_logs"] });

// ---- mutation helpers ----
export function useTableMutation<T extends Record<string, unknown>>(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id?: string; values: Partial<T>; upsert?: boolean }) => {
      if (payload.id) {
        const { error } = await supabase.from(table as never).update(payload.values as never).eq("id", payload.id);
        if (error) throw error;
        return payload.id;
      }
      const { data, error } = await supabase.from(table as never).insert(payload.values as never).select().single();
      if (error) throw error;
      return (data as unknown as { id: string }).id;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [table] });
    },
  });
}

export function useDeleteRow(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table as never).delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [table] });
    },
  });
}

// Invoice + payments + status rollup (client-side), used by finance + reports
export function useFinance() {
  const invoices = useInvoices();
  const items = useInvoiceItems();
  const payments = usePayments();
  return { invoices, items, payments };
}
