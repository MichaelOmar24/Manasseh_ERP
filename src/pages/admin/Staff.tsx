import { useState } from "react";
import { toast } from "sonner";
import { Plus, GraduationCap, BookOpen, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useStaff, useQualifications, useTraining, useTableMutation, useDeleteRow } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import type { Qualification, Staff, Training } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StaffPage() {
  const { data: staff = [], isLoading } = useStaff();

  const columns: Column<Staff>[] = [
    { header: "Staff no.", cell: (s) => <span className="font-mono text-xs">{s.staff_number}</span> },
    { header: "Name", cell: (s) => (
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {(s.profiles?.full_name ?? "?").split(" ").map((x) => x[0]).slice(0, 2).join("")}
        </div>
        <span className="font-medium">{s.profiles?.full_name ?? "—"}</span>
      </div>
    ) },
    { header: "Department", cell: (s) => s.department ?? "—" },
    { header: "Job title", cell: (s) => s.job_title ?? "—" },
    { header: "DBS", cell: (s) => <StatusBadge status={s.dbs_check_status} /> },
    { header: "Rate", cell: (s) => <span className="text-muted-foreground">{formatCurrency(s.hourly_rate)}</span> },
    { header: "", cell: (s) => <StaffDetailDialog staff={s} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Staff Management"
        description="Care team records, qualifications and mandatory training."
        action={<AddStaffDialog />}
      />
      <DataTable columns={columns} rows={staff} loading={isLoading} keyOf={(s) => s.id} emptyTitle="No staff records" />
    </div>
  );
}

function StaffDetailDialog({ staff }: { staff: Staff }) {
  const [open, setOpen] = useState(false);
  const { data: quals = [] } = useQualifications(staff.id);
  const { data: training = [] } = useTraining(staff.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Eye className="h-4 w-4" /> Details</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{staff.profiles?.full_name ?? "Staff member"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 rounded-xl border bg-muted/30 p-4 text-sm sm:grid-cols-3">
          <div><p className="text-xs uppercase text-muted-foreground">Department</p><p className="font-medium">{staff.department ?? "—"}</p></div>
          <div><p className="text-xs uppercase text-muted-foreground">Role</p><p className="font-medium">{staff.job_title ?? "—"}</p></div>
          <div><p className="text-xs uppercase text-muted-foreground">Employment</p><StatusBadge status={staff.employment_status} /></div>
          <div><p className="text-xs uppercase text-muted-foreground">Rate</p><p className="font-medium">{formatCurrency(staff.hourly_rate)}</p></div>
          <div><p className="text-xs uppercase text-muted-foreground">DBS</p><StatusBadge status={staff.dbs_check_status} /></div>
          <div><p className="text-xs uppercase text-muted-foreground">Started</p><p className="font-medium">{formatDate(staff.start_date)}</p></div>
        </div>
        <Tabs defaultValue="qualifications">
          <TabsList>
            <TabsTrigger value="qualifications">Qualifications ({quals.length})</TabsTrigger>
            <TabsTrigger value="training">Training ({training.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="qualifications" className="space-y-3 pt-4">
            {quals.length ? (
              quals.map((q) => (
                <div key={q.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">{q.title}</p>
                      <p className="text-xs text-muted-foreground">{q.issuer ?? ""} {q.issue_date ? `· ${formatDate(q.issue_date)}` : ""}</p>
                    </div>
                  </div>
                  {q.verified ? <Badge variant="outline" className="border-success/30 bg-success/10 text-success">Verified</Badge> : <Badge variant="outline">Unverified</Badge>}
                </div>
              ))
            ) : (
              <EmptyState title="No qualifications recorded" />
            )}
            <AddQualificationDialog staffId={staff.id} />
          </TabsContent>
          <TabsContent value="training" className="space-y-3 pt-4">
            {training.length ? (
              training.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">{t.course_title}</p>
                      <p className="text-xs text-muted-foreground">{t.provider ?? ""} · expires {formatDate(t.expiry_date)}</p>
                    </div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))
            ) : (
              <EmptyState title="No training recorded" />
            )}
            <AddTrainingDialog staffId={staff.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function AddQualificationDialog({ staffId }: { staffId: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", issuer: "", issue_date: "", expiry_date: "" });
  const { mutateAsync, isPending } = useTableMutation<Qualification>("qualifications");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return toast.error("Qualification title is required.");
    await mutateAsync({ values: { staff_id: staffId, title: form.title, issuer: form.issuer || null, issue_date: form.issue_date || null, expiry_date: form.expiry_date || null, verified: false } });
    toast.success("Qualification added.");
    setOpen(false);
    setForm({ title: "", issuer: "", issue_date: "", expiry_date: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Plus className="h-4 w-4" /> Add qualification</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add qualification</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-2"><Label>Issuer</Label><Input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Issue date</Label><Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></div>
            <div className="space-y-2"><Label>Expiry date</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
          </div>
          <DialogFooter><Button type="submit" disabled={isPending}>{isPending ? "Adding…" : "Add"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddTrainingDialog({ staffId }: { staffId: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ course_title: "", provider: "", completion_date: "", expiry_date: "" });
  const { mutateAsync, isPending } = useTableMutation<Training>("training");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.course_title) return toast.error("Course title is required.");
    await mutateAsync({ values: { staff_id: staffId, course_title: form.course_title, provider: form.provider || null, completion_date: form.completion_date || null, expiry_date: form.expiry_date || null, status: "completed" } });
    toast.success("Training record added.");
    setOpen(false);
    setForm({ course_title: "", provider: "", completion_date: "", expiry_date: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Plus className="h-4 w-4" /> Add training</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add training record</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2"><Label>Course *</Label><Input value={form.course_title} onChange={(e) => setForm({ ...form, course_title: e.target.value })} /></div>
          <div className="space-y-2"><Label>Provider</Label><Input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Completed</Label><Input type="date" value={form.completion_date} onChange={(e) => setForm({ ...form, completion_date: e.target.value })} /></div>
            <div className="space-y-2"><Label>Expires</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
          </div>
          <DialogFooter><Button type="submit" disabled={isPending}>{isPending ? "Adding…" : "Add"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddStaffDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ staff_number: "", job_title: "", department: "Care", hourly_rate: "", contract_type: "Full-time", dbs_check_status: "pending" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.staff_number) return toast.error("Staff number is required.");
    const { error } = await supabase.from("staff").insert({
      staff_number: form.staff_number,
      department: form.department,
      job_title: form.job_title || null,
      hourly_rate: Number(form.hourly_rate) || 0,
      contract_type: form.contract_type,
      dbs_check_status: form.dbs_check_status,
      employment_status: "active",
    });
    if (error) {
      toast.error(error.message.includes("duplicate") ? "That staff number already exists." : "Failed to create staff record.");
      return;
    }
    toast.success("Staff record created. Link a user account in User Management.");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Add staff</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add staff record</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2"><Label>Staff number *</Label><Input value={form.staff_number} onChange={(e) => setForm({ ...form, staff_number: e.target.value })} placeholder="STF-013" /></div>
          <div className="space-y-2"><Label>Job title</Label><Input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} placeholder="Care Worker" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Hourly rate (£)</Label><Input type="number" step="0.5" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} /></div>
            <div className="space-y-2"><Label>Contract</Label>
              <Select value={form.contract_type} onValueChange={(v) => setForm({ ...form, contract_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem><SelectItem value="Bank">Bank</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button type="submit">Create record</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
