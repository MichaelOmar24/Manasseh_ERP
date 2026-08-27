import { useState } from "react";
import { toast } from "sonner";
import { Plus, Briefcase, FileText, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useJobPostings, useJobApplications, useTableMutation } from "@/lib/api";
import { cvUrlToLink } from "@/lib/upload";
import type { JobApplication, JobPosting } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function Recruitment() {
  return (
    <div>
      <PageHeader
        title="Recruitment"
        description="Job postings and the applicant pipeline for your care team."
        action={<AddPostingDialog />}
      />
      <Tabs defaultValue="postings">
        <TabsList>
          <TabsTrigger value="postings">Job postings</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>
        <TabsContent value="postings" className="pt-4"><PostingsTab /></TabsContent>
        <TabsContent value="applications" className="pt-4"><ApplicationsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function PostingsTab() {
  const { data: postings = [], isLoading } = useJobPostings();
  const columns: Column<JobPosting>[] = [
    { header: "Title", cell: (j) => <span className="font-medium">{j.title}</span> },
    { header: "Department", cell: (j) => j.department ?? "—" },
    { header: "Location", cell: (j) => j.location ?? "—" },
    { header: "Type", cell: (j) => j.employment_type ?? "—" },
    { header: "Salary", cell: (j) => j.salary_range ?? "—" },
    { header: "Status", cell: (j) => <StatusBadge status={j.status} /> },
  ];
  return <DataTable columns={columns} rows={postings} loading={isLoading} keyOf={(j) => j.id} emptyTitle="No postings yet" />;
}

function ApplicationsTab() {
  const { data: applications = [], isLoading } = useJobApplications();
  const { mutateAsync } = useTableMutation<JobApplication>("job_applications");

  const setStatus = async (id: string, status: string) => {
    await mutateAsync({ id, values: { status } });
    toast.success("Application updated.");
  };

  const columns: Column<JobApplication>[] = [
    { header: "Applicant", cell: (a) => <span className="font-medium">{a.full_name}</span> },
    { header: "Email", cell: (a) => <span className="text-muted-foreground">{a.email}</span> },
    { header: "Role", cell: (a) => <span className="flex items-center gap-1.5 text-muted-foreground"><Briefcase className="h-3.5 w-3.5" /> {a.job_position ?? a.job_postings?.title ?? "—"}</span> },
    { header: "Applied", cell: (a) => <span className="text-muted-foreground">{formatDate(a.applied_at)}</span> },
    { header: "Status", cell: (a) => (
      <Select value={a.status} onValueChange={(v) => setStatus(a.id, v)}>
        <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="review">Review</SelectItem>
          <SelectItem value="interview">Interview</SelectItem>
          <SelectItem value="offered">Offered</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
    ) },
    { header: "", cell: (a) => <ViewApplicationDialog application={a} /> },
  ];
  return <DataTable columns={columns} rows={applications} loading={isLoading} keyOf={(a) => a.id} emptyTitle="No applications yet" />;
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 break-words text-sm">{value || "—"}</p>
    </div>
  );
}

function ViewApplicationDialog({ application }: { application: JobApplication }) {
  const [open, setOpen] = useState(false);
  const [cvLink, setCvLink] = useState<string | null>(null);
  const [loadingCv, setLoadingCv] = useState(false);

  const openDialog = async (next: boolean) => {
    setOpen(next);
    if (next && application.cv_url) {
      setLoadingCv(true);
      const link = await cvUrlToLink(application.cv_url);
      setCvLink(link);
      setLoadingCv(false);
    } else {
      setCvLink(null);
    }
  };

  const groups: { title: string; rows: [string, string | null | undefined][] }[] = [
    {
      title: "Personal details",
      rows: [
        ["Full name", application.full_name],
        ["Date of birth", application.date_of_birth ? formatDate(application.date_of_birth) : null],
        ["Gender", application.gender],
        ["Marital status", application.marital_status],
        ["Nationality", application.nationality],
      ],
    },
    {
      title: "Right to work",
      rows: [
        ["Right to work share code", application.right_to_work_sharecode],
        ["Requires sponsorship / switch", application.requires_sponsorship],
        ["DBS number", application.dbs_number],
        ["Social Care Wales number", application.social_care_wales_number],
      ],
    },
    {
      title: "Contact",
      rows: [
        ["Email", application.email],
        ["Phone", application.phone],
        ["House address", application.address],
      ],
    },
    {
      title: "Driving & education",
      rows: [
        ["Valid UK driver's licence", application.has_uk_driving_license],
        ["Owns a car", application.owns_car],
        ["Highest qualification", application.highest_qualification],
      ],
    },
    {
      title: "Role & experience",
      rows: [
        ["Job position applied for", application.job_position],
        ["Current employment", application.current_employment],
        ["Previous employment", application.previous_employment],
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={openDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Eye className="h-4 w-4" /> View</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{application.full_name}</DialogTitle>
        </DialogHeader>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span>{application.email}</span>
            {application.phone ? <span>· {application.phone}</span> : null}
            <StatusBadge status={application.status} />
          </div>
          {application.cv_url ? (
            loadingCv ? (
              <span className="text-xs text-muted-foreground">Preparing CV…</span>
            ) : cvLink ? (
              <Button size="sm" asChild>
                <a href={cvLink} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" /> Open CV
                </a>
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">CV unavailable</span>
            )
          ) : null}
        </div>

        {groups.map((g) => (
          <div key={g.title} className="mb-5">
            <h3 className="mb-2 font-display font-semibold">{g.title}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {g.rows.map(([label, value]) => (
                <DetailRow key={label} label={label} value={value} />
              ))}
            </div>
          </div>
        ))}

        {application.care_training ? (
          <div className="mb-5">
            <h3 className="mb-2 font-display font-semibold">Care training</h3>
            <p className="whitespace-pre-line rounded-lg border bg-muted/20 p-3 text-sm">{application.care_training}</p>
          </div>
        ) : null}
        {application.cover_letter ? (
          <div>
            <h3 className="mb-2 font-display font-semibold">Cover letter</h3>
            <p className="whitespace-pre-line rounded-lg border bg-muted/20 p-3 text-sm">{application.cover_letter}</p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function AddPostingDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", department: "Care", location: "", employment_type: "Full-time", salary_range: "", description: "", requirements: "" });
  const { mutateAsync, isPending } = useTableMutation<JobPosting>("job_postings");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return toast.error("Job title is required.");
    await mutateAsync({ values: { title: form.title, department: form.department, location: form.location || null, employment_type: form.employment_type, salary_range: form.salary_range || null, description: form.description || null, requirements: form.requirements || null, status: "open" } });
    toast.success("Job posting published.");
    setOpen(false);
    setForm({ title: "", department: "Care", location: "", employment_type: "Full-time", salary_range: "", description: "", requirements: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> New posting</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>Create job posting</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Care Worker" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div className="space-y-2"><Label>Salary range</Label><Input value={form.salary_range} onChange={(e) => setForm({ ...form, salary_range: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Department</Label>
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Care">Care</SelectItem><SelectItem value="Operations">Operations</SelectItem><SelectItem value="Management">Management</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Employment type</Label>
              <Select value={form.employment_type} onValueChange={(v) => setForm({ ...form, employment_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem><SelectItem value="Bank">Bank</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="space-y-2"><Label>Requirements</Label><Textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} /></div>
          <DialogFooter><Button type="submit" disabled={isPending}><FileText className="h-4 w-4" /> {isPending ? "Creating…" : "Publish posting"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
