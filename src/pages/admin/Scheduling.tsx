import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useVisits, useClients, useProfiles, useCarePlans, useTableMutation } from "@/lib/api";
import type { Visit } from "@/lib/types";
import { formatTime } from "@/lib/utils";

export default function Scheduling() {
  const [date, setDate] = useState<Date>(new Date());
  const { data: visits = [], isLoading } = useVisits();
  const { data: clients = [] } = useClients();
  const { data: profiles = [] } = useProfiles();

  const dayKey = date.toISOString().slice(0, 10);
  const caregivers = profiles.filter((p) => p.role === "caregiver");
  const clientName = (id: string) => clients.find((c) => c.id === id)?.full_name ?? "—";

  const dayVisits = useMemo(
    () =>
      visits
        .filter((v) => v.scheduled_start?.slice(0, 10) === dayKey)
        .sort((a, b) => (a.scheduled_start ?? "").localeCompare(b.scheduled_start ?? "")),
    [visits, dayKey],
  );

  return (
    <div>
      <PageHeader
        title="Scheduling"
        description="Plan and manage caregiver visits on the care calendar."
        action={<NewVisitDialog />}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-4 shadow-soft">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && setDate(d)}
            className="rounded-lg border"
          />
        </Card>
        <Card className="shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between border-b p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <CalendarDays className="h-5 w-5 text-primary" />
              {date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </h2>
            <span className="text-sm text-muted-foreground">{dayVisits.length} visit(s)</span>
          </div>
          <div className="p-5">
            {isLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : dayVisits.length === 0 ? (
              <EmptyState title="No visits on this day" description="Select another date or schedule a new visit." />
            ) : (
              <div className="space-y-3">
                {dayVisits.map((v) => (
                  <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center rounded-lg bg-primary/10 px-3 py-1.5 text-primary">
                        <span className="text-xs font-semibold uppercase">{formatTime(v.scheduled_start)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{clientName(v.client_id)}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.profiles?.full_name ?? "Unassigned"} · {formatTime(v.scheduled_end)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function NewVisitDialog() {
  const { data: clients = [] } = useClients();
  const { data: profiles = [] } = useProfiles();
  const { data: plans = [] } = useCarePlans();
  const caregivers = profiles.filter((p) => p.role === "caregiver");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ client_id: "", caregiver_id: "", care_plan_id: "", date: "", time: "", duration: "60" });
  const { mutateAsync, isPending } = useTableMutation<Visit>("visits");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id || !form.caregiver_id || !form.date || !form.time) {
      return toast.error("Please select a client, caregiver, date and time.");
    }
    const start = new Date(`${form.date}T${form.time}`);
    const end = new Date(start.getTime() + Number(form.duration) * 60000);
    await mutateAsync({
      values: {
        client_id: form.client_id,
        caregiver_id: form.caregiver_id,
        care_plan_id: form.care_plan_id || null,
        scheduled_start: start.toISOString(),
        scheduled_end: end.toISOString(),
        status: "scheduled",
      },
    });
    toast.success("Visit scheduled.");
    setOpen(false);
    setForm({ client_id: "", caregiver_id: "", care_plan_id: "", date: "", time: "", duration: "60" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Schedule visit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Schedule a visit</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2"><Label>Client *</Label>
            <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name} ({c.reference})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Caregiver *</Label>
            <Select value={form.caregiver_id} onValueChange={(v) => setForm({ ...form, caregiver_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select caregiver" /></SelectTrigger>
              <SelectContent>{caregivers.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Care plan (optional)</Label>
            <Select value={form.care_plan_id} onValueChange={(v) => setForm({ ...form, care_plan_id: v })}>
              <SelectTrigger><SelectValue placeholder="Link a care plan" /></SelectTrigger>
              <SelectContent>{plans.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2 col-span-1"><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div className="space-y-2"><Label>Time *</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
            <div className="space-y-2"><Label>Duration</Label>
              <Select value={form.duration} onValueChange={(v) => setForm({ ...form, duration: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="30">30 min</SelectItem><SelectItem value="60">60 min</SelectItem><SelectItem value="90">90 min</SelectItem><SelectItem value="120">120 min</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button type="submit" disabled={isPending}>{isPending ? "Scheduling…" : "Schedule visit"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
