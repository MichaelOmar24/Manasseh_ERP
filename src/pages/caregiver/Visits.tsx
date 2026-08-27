import { useState } from "react";
import { toast } from "sonner";
import { LogIn, LogOut, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/context/auth";
import { useVisits, useTableMutation } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import type { Visit } from "@/lib/types";
import { formatDateTime, formatTime } from "@/lib/utils";

export default function Visits() {
  const { profile } = useAuth();
  const { data: visits = [], isLoading } = useVisits();
  const { mutateAsync } = useTableMutation<Visit>("visits");

  const myVisits = visits
    .filter((v) => v.caregiver_id === profile?.id)
    .sort((a, b) => (a.scheduled_start ?? "").localeCompare(b.scheduled_start ?? ""));

  const checkIn = async (v: Visit) => {
    await mutateAsync({ id: v.id, values: { status: "in_progress", check_in_at: new Date().toISOString() } });
    toast.success("Checked in. Have a great visit!");
  };

  const checkOut = async (v: Visit, notes?: string) => {
    await mutateAsync({ id: v.id, values: { status: "completed", check_out_at: new Date().toISOString(), care_notes: notes ?? v.care_notes } });
    toast.success("Visit completed. Care notes saved.");
  };

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div>
      <PageHeader title="My Visits" description="Check in, check out and record your care notes." />
      {myVisits.length === 0 ? (
        <EmptyState title="No visits assigned" />
      ) : (
        <div className="space-y-4">
          {myVisits.map((v) => (
            <VisitRow key={v.id} visit={v} onCheckIn={() => checkIn(v)} onCheckOut={(notes) => checkOut(v, notes)} />
          ))}
        </div>
      )}
    </div>
  );
}

function VisitRow({
  visit,
  onCheckIn,
  onCheckOut,
}: {
  visit: Visit;
  onCheckIn: () => Promise<void>;
  onCheckOut: (notes?: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState(visit.care_notes ?? "");
  const [busy, setBusy] = useState(false);

  return (
    <Card className="p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold">
            {visit.clients?.reference ?? "Client"} · {formatDateTime(visit.scheduled_start)}
          </p>
          <p className="text-sm text-muted-foreground">
            {visit.clients?.address ?? ""} · {formatTime(visit.scheduled_end)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={visit.status} />
          {visit.status === "scheduled" && (
            <Button size="sm" onClick={async () => { setBusy(true); await onCheckIn(); setBusy(false); }} disabled={busy}>
              <LogIn className="h-4 w-4" /> Check in
            </Button>
          )}
          {visit.status === "in_progress" && (
            <Button size="sm" onClick={async () => { setBusy(true); await onCheckOut(notes); setBusy(false); }} disabled={busy}>
              <LogOut className="h-4 w-4" /> Check out
            </Button>
          )}
          {visit.status === "completed" && (
            <span className="flex items-center gap-1 text-xs font-medium text-success">
              <CheckCircle2 className="h-4 w-4" /> Completed
            </span>
          )}
        </div>
      </div>
      {(visit.status === "in_progress" || visit.status === "completed") && (
        <div className="mt-4">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Care notes</label>
          <Textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record what you did, how the client was, and anything to flag…"
            className="mt-2"
          />
          {visit.status === "in_progress" && (
            <p className="mt-2 text-xs text-muted-foreground">
              Notes are saved automatically when you check out.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
