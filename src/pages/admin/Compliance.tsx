import { useState } from "react";
import { toast } from "sonner";
import { Plus, ShieldCheck, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useComplianceRecords, useAuditLogs, useTableMutation, useStaff } from "@/lib/api";
import type { ComplianceRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function Compliance() {
  return (
    <div>
      <PageHeader
        title="Compliance Management"
        description="Regulatory records, certificates and audit trail."
        action={<AddRecordDialog />}
      />
      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records">Compliance records</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>
        <TabsContent value="records" className="pt-4"><RecordsTab /></TabsContent>
        <TabsContent value="audit" className="pt-4"><AuditTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function RecordsTab() {
  const { data: records = [], isLoading } = useComplianceRecords();
  const columns: Column<ComplianceRecord>[] = [
    { header: "Title", cell: (r) => (
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span className="font-medium">{r.title}</span>
      </div>
    ) },
    { header: "Type", cell: (r) => <span className="capitalize">{r.type.replace(/_/g, " ")}</span> },
    { header: "Entity", cell: (r) => <span className="capitalize text-muted-foreground">{r.entity_type}</span> },
    { header: "Issued", cell: (r) => <span className="text-muted-foreground">{formatDate(r.issue_date)}</span> },
    { header: "Expires", cell: (r) => <span className="text-muted-foreground">{formatDate(r.expiry_date)}</span> },
    { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
  ];
  return <DataTable columns={columns} rows={records} loading={isLoading} keyOf={(r) => r.id} emptyTitle="No compliance records" />;
}

type AuditRow = { id: string; action: string; created_at: string; details: unknown };

function AuditTab() {
  const { data: logs = [], isLoading } = useAuditLogs();
  const columns: Column<AuditRow>[] = [
    { header: "Date", cell: (l) => <span className="text-muted-foreground">{formatDate(l.created_at)}</span> },
    { header: "Action", cell: (l) => (
      <span className="flex items-center gap-2 font-mono text-xs"><ScrollText className="h-3.5 w-3.5 text-primary" /> {l.action}</span>
    ) },
    { header: "Details", cell: (l) => <span className="text-muted-foreground">{JSON.stringify(l.details ?? {})}</span> },
  ];
  return <DataTable columns={columns} rows={logs} loading={isLoading} keyOf={(l) => l.id} emptyTitle="No audit events yet" />;
}

function AddRecordDialog() {
  const { data: staff = [] } = useStaff();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", type: "certificate", entity_type: "organisation", entity_id: "", issue_date: "", expiry_date: "" });
  const { mutateAsync, isPending } = useTableMutation<ComplianceRecord>("compliance_records");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return toast.error("Title is required.");
    await mutateAsync({
      values: {
        title: form.title,
        type: form.type,
        entity_type: form.entity_type,
        entity_id: form.entity_id || null,
        issue_date: form.issue_date || null,
        expiry_date: form.expiry_date || null,
        status: "active",
      },
    });
    toast.success("Compliance record added.");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Add record</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add compliance record</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="certificate">Certificate</SelectItem><SelectItem value="dbs">DBS</SelectItem><SelectItem value="registration">Registration</SelectItem><SelectItem value="annual_return">Annual return</SelectItem><SelectItem value="insurance">Insurance</SelectItem><SelectItem value="audit">Audit</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Entity</Label>
              <Select value={form.entity_type} onValueChange={(v) => setForm({ ...form, entity_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="organisation">Organisation</SelectItem><SelectItem value="staff">Staff</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          {form.entity_type === "staff" && (
            <div className="space-y-2"><Label>Staff member</Label>
              <Select value={form.entity_id} onValueChange={(v) => setForm({ ...form, entity_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                <SelectContent>{staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.profiles?.full_name ?? s.staff_number}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Issue date</Label><Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></div>
            <div className="space-y-2"><Label>Expiry date</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
          </div>
          <DialogFooter><Button type="submit" disabled={isPending}>{isPending ? "Adding…" : "Add record"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
