export type Role =
  | "super_admin"
  | "director"
  | "care_manager"
  | "caregiver"
  | "client"
  | "hr_manager"
  | "finance_officer"
  | "compliance_officer";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: Role;
  status: string;
  created_at: string;
};

export type Client = {
  id: string;
  profile_id: string | null;
  reference: string;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  postcode: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  medical_conditions: string[] | null;
  allergies: string[] | null;
  gp_name: string | null;
  gp_phone: string | null;
  care_manager_id: string | null;
  funding_source: string | null;
  status: string;
  created_at: string;
  profiles?: Pick<Profile, "id" | "full_name" | "email"> | null;
};

export type Staff = {
  id: string;
  profile_id: string | null;
  staff_number: string;
  department: string | null;
  job_title: string | null;
  employment_status: string;
  hourly_rate: number | null;
  contract_type: string | null;
  manager_id: string | null;
  dbs_check_status: string;
  dbs_check_date: string | null;
  start_date: string | null;
  created_at: string;
  profiles?: Pick<Profile, "id" | "full_name" | "email" | "phone" | "role"> | null;
};

export type CarePlan = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  baseline_notes: string | null;
  start_date: string | null;
  review_date: string | null;
  end_date: string | null;
  status: "active" | "review" | "archived";
  created_by: string | null;
  created_at: string;
  clients?: Pick<Client, "id" | "reference" | "profile_id"> | null;
};

export type CarePlanTask = {
  id: string;
  care_plan_id: string;
  title: string;
  instructions: string | null;
  frequency: string | null;
  scheduled_time: string | null;
  created_at: string;
};

export type Appointment = {
  id: string;
  client_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  appointment_type: "initial_assessment" | "care_review" | "consultation" | "staff_booking";
  requested_date: string | null;
  time_slot: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string | null;
  preferred_contact_method: string | null;
  created_at: string;
};

export type Visit = {
  id: string;
  client_id: string;
  caregiver_id: string | null;
  care_plan_id: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  check_in_at: string | null;
  check_out_at: string | null;
  status: "scheduled" | "in_progress" | "completed" | "missed" | "cancelled";
  care_notes: string | null;
  client_feedback: string | null;
  created_at: string;
  clients?: Pick<Client, "id" | "reference" | "address" | "profile_id"> | null;
  profiles?: Pick<Profile, "id" | "full_name"> | null;
};

export type Incident = {
  id: string;
  visit_id: string | null;
  client_id: string | null;
  reported_by: string | null;
  severity: "low" | "medium" | "high" | "critical";
  category: "fall" | "medication" | "behaviour" | "safeguarding" | "other";
  description: string;
  action_taken: string | null;
  status: "open" | "investigating" | "resolved" | "closed";
  reported_at: string;
  resolved_at: string | null;
  clients?: Pick<Client, "id" | "reference" | "profile_id"> | null;
  profiles?: Pick<Profile, "id" | "full_name"> | null;
};

export type Invoice = {
  id: string;
  client_id: string;
  invoice_number: string;
  issue_date: string | null;
  due_date: string | null;
  period_start: string | null;
  period_end: string | null;
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "partial" | "paid" | "overdue" | "cancelled";
  created_at: string;
  clients?: Pick<Client, "id" | "reference" | "profile_id"> | null;
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type Payment = {
  id: string;
  invoice_id: string;
  amount: number;
  method: string;
  reference: string | null;
  received_at: string;
  status: string;
  recorded_by: string | null;
};

export type Message = {
  id: string;
  sender_id: string | null;
  receiver_id: string | null;
  client_id: string | null;
  subject: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
  senders?: Pick<Profile, "id" | "full_name"> | null;
  receivers?: Pick<Profile, "id" | "full_name"> | null;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export type Document = {
  id: string;
  owner_id: string | null;
  owner_type: string;
  title: string;
  category: string | null;
  file_url: string | null;
  file_name: string | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
};

export type Qualification = {
  id: string;
  staff_id: string;
  title: string;
  issuer: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  verified: boolean;
  document_url: string | null;
};

export type Training = {
  id: string;
  staff_id: string;
  course_title: string;
  provider: string | null;
  completion_date: string | null;
  expiry_date: string | null;
  status: string;
};

export type ComplianceRecord = {
  id: string;
  entity_type: string;
  entity_id: string | null;
  title: string;
  type: string;
  status: "pending" | "active" | "expiring" | "expired";
  issue_date: string | null;
  expiry_date: string | null;
  created_at: string;
};

export type JobPosting = {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  salary_range: string | null;
  description: string | null;
  requirements: string | null;
  status: string;
  created_at: string;
};

export type JobApplication = {
  id: string;
  job_posting_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  cover_letter: string | null;
  cv_url: string | null;
  status: string;
  applied_at: string;
  job_postings?: Pick<JobPosting, "id" | "title"> | null;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  author_id: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  profiles?: Pick<Profile, "id" | "full_name"> | null;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
};

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Administrator",
  director: "Director",
  care_manager: "Care Manager",
  caregiver: "Caregiver",
  client: "Client",
  hr_manager: "HR Manager",
  finance_officer: "Finance Officer",
  compliance_officer: "Compliance Officer",
};

export const ALL_ROLES = Object.keys(ROLE_LABELS) as Role[];
