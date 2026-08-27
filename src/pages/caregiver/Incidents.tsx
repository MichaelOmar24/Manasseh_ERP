import { useState } from "react";
import { toast } from "sonner";
import { Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth";
import { useIncidents, useVisits, useTableMutation } from "@/lib/api";
import type { Incident } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const severityTone: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/15 text-warning-foreground",
  high: "bg-destructive/10 text-destructive",
  critical: "bg-destructive text-destructive-foreground",
};

export default function Incidents() {
  const { profile } = useAuth();
  const { data: incidents = [], isLoading } = useIncidents();
  const myIncidents = incidents.filter((i) => i.reported_by === profile?.id);

  const columns: Column<Incident>[] = [
    { header: "Reported", cell: (i) => <span className="text-muted-foreground">{formatDate(i.reported_at)}</span> },
    { header: "Client", cell: (i) => <span className="font-medium">{i.clients?.reference ?? "—"}</span> },
    { header: "Severity", cell: (i) => <Badge className={cn("capitalize", severityTone[i.severity])}>{i.severity}</Badge> },
    { header: "Category", cell: (i) => <span className="capitalize">{i.category}</span> },
    { header: "Description", cell: (i) => <span className="line-clamp-2 max-w-[280px] text-muted-foreground">{i.description}</span> },
    { header: "Status", cell: (i) => <StatusBadge status={i.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Incident Reporting"
        description="Report safety incidents — your care manager and compliance team review these."
        action={<ReportIncidentDialog />}
      />
      <DataTable columns={columns} rows={myIncidents} loading={isLoading} keyOf={(i) => i.id} emptyTitle="No incidents reported" />
    </div>
  );
}

function ReportIncidentDialog() {
  const { profile } = useAuth();
  const { data: visits = [] } = useVisits();
  const myVisits = visits.filter((v) => v.caregiver_id === profile?.id && v.client_id);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ client_id: "", severity: "medium", category: "other", description: "", action_taken: "" });
  const { mutateAsync, isPending } = useTableMutation<Incident>("incidents");

  const clientIds = Array.from(new Set(myVisits.map((v) => v.client_id)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id || !form.description) return toast.error("Select a client and describe the incident.");
    await mutateAsync({
      values: {
        client_id: form.client_id,
        reported_by: profile?.id,
        severity: form.severity as Incident["severity"],
        category: form.category as Incident["category"],
        description: form.description,
        action_taken: form.action_taken || null,
        status: "open",
      },
    });
    toast.success("Incident reported. Your care manager has been notified.");
    setOpen(false);
    setForm({ client_id: "", severity: "medium", category: "other", description: "", action_taken: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Report incident</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" /> Report an incident
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2"><Label>Client *</Label>
            <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>
                {clientIds.map((cid) => {
                  const v = myVisits.find((x) => x.client_id === cid);
                  return <SelectItem key={cid} value={cid}>{v?.clients?.reference ?? "Client"}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Severity</Label>
              <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fall">Fall</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="behaviour">Behaviour</SelectItem>
                  <SelectItem value="safeguarding">Safeguarding</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>Description *</Label>
            <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What happened? Include times and people involved." />
          </div>
          <div className="space-y-2"><Label>Action taken</Label>
            <Textarea rows={2} value={form.action_taken} onChange={(e) => setForm({ ...form, action_taken: e.target.value })} placeholder="What did you do immediately?" />
          </div>
          <DialogFooter><Button type="submit" disabled={isPending}>{isPending ? "Submitting…" : "Report incident"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
