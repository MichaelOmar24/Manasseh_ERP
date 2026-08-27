import { useState } from "react";
import { toast } from "sonner";
import { Plus, HeartPulse, ListChecks, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCarePlans, useClients, useCarePlanTasks, useTableMutation } from "@/lib/api";
import type { CarePlan, CarePlanTask } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function CarePlansPage() {
  const { data: plans = [], isLoading } = useCarePlans();
  const { data: clients = [] } = useClients();

  const nameOf = (clientId: string) => clients.find((c) => c.id === clientId)?.full_name ?? "—";

  const columns: Column<CarePlan>[] = [
    { header: "Client", cell: (p) => <span className="font-medium">{nameOf(p.client_id)}</span> },
    { header: "Plan", cell: (p) => p.title },
    { header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
    { header: "Started", cell: (p) => <span className="text-muted-foreground">{formatDate(p.start_date)}</span> },
    { header: "Review due", cell: (p) => <span className="text-muted-foreground">{formatDate(p.review_date)}</span> },
    { header: "", cell: (p) => <CarePlanDetail plan={p} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Care Plan Management"
        description="Person-centred plans and scheduled care tasks for every client."
        action={<AddCarePlanDialog />}
      />
      <DataTable columns={columns} rows={plans} loading={isLoading} keyOf={(p) => p.id} emptyTitle="No care plans yet" />
    </div>
  );
}

function CarePlanDetail({ plan }: { plan: CarePlan }) {
  const [open, setOpen] = useState(false);
  const { data: tasks = [] } = useCarePlanTasks(plan.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Eye className="h-4 w-4" /> View</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{plan.title}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <StatusBadge status={plan.status} />
          <span className="text-xs text-muted-foreground">Review due {formatDate(plan.review_date)}</span>
        </div>
        {plan.description ? <p className="text-sm text-muted-foreground">{plan.description}</p> : null}
        {plan.baseline_notes ? (
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Baseline notes</p>
            <p className="mt-1 text-sm">{plan.baseline_notes}</p>
          </div>
        ) : null}
        <div>
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-1.5 font-display font-semibold"><ListChecks className="h-4 w-4 text-primary" /> Care tasks</h4>
          </div>
          <div className="mt-3 space-y-2">
            {tasks.length ? (
              tasks.map((t) => (
                <div key={t.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{t.title}</p>
                  {t.instructions ? <p className="mt-0.5 text-xs text-muted-foreground">{t.instructions}</p> : null}
                  <p className="mt-1 text-xs text-muted-foreground capitalize">
                    {t.frequency} {t.scheduled_time ? `· ${t.scheduled_time}` : ""}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState title="No tasks yet" />
            )}
          </div>
          <AddTaskDialog planId={plan.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddTaskDialog({ planId }: { planId: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", instructions: "", frequency: "daily", scheduled_time: "" });
  const { mutateAsync, isPending } = useTableMutation<CarePlanTask>("care_plan_tasks");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return toast.error("Task title is required.");
    await mutateAsync({ values: { care_plan_id: planId, title: form.title, instructions: form.instructions || null, frequency: form.frequency, scheduled_time: form.scheduled_time || null } });
    toast.success("Task added.");
    setOpen(false);
    setForm({ title: "", instructions: "", frequency: "daily", scheduled_time: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-3"><Plus className="h-4 w-4" /> Add task</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add care task</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-2"><Label>Instructions</Label><Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="custom">Custom</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Time</Label><Input type="time" value={form.scheduled_time} onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })} /></div>
          </div>
          <DialogFooter><Button type="submit" disabled={isPending}>{isPending ? "Adding…" : "Add task"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddCarePlanDialog() {
  const { data: clients = [] } = useClients();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ client_id: "", title: "", description: "", baseline_notes: "", start_date: "", review_date: "" });
  const { mutateAsync, isPending } = useTableMutation<CarePlan>("care_plans");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id || !form.title) return toast.error("Select a client and enter a plan title.");
    await mutateAsync({ values: { client_id: form.client_id, title: form.title, description: form.description || null, baseline_notes: form.baseline_notes || null, start_date: form.start_date || null, review_date: form.review_date || null, status: "active" } });
    toast.success("Care plan created.");
    setOpen(false);
    setForm({ client_id: "", title: "", description: "", baseline_notes: "", start_date: "", review_date: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> New care plan</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>Create care plan</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2"><Label>Client *</Label>
            <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name} ({c.reference})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="space-y-2"><Label>Baseline notes</Label><Textarea value={form.baseline_notes} onChange={(e) => setForm({ ...form, baseline_notes: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Start date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
            <div className="space-y-2"><Label>Review date</Label><Input type="date" value={form.review_date} onChange={(e) => setForm({ ...form, review_date: e.target.value })} /></div>
          </div>
          <DialogFooter><Button type="submit" disabled={isPending}><HeartPulse className="h-4 w-4" /> {isPending ? "Creating…" : "Create plan"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
