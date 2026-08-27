import { CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/context/auth";
import { useVisits } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

export default function Schedule() {
  const { profile } = useAuth();
  const { data: visits = [], isLoading } = useVisits();
  const myVisits = visits
    .filter((v) => v.clients?.profile_id === profile?.id)
    .sort((a, b) => (a.scheduled_start ?? "").localeCompare(b.scheduled_start ?? ""));

  const groups = [
    { label: "Upcoming", items: myVisits.filter((v) => v.status === "scheduled" || v.status === "in_progress") },
    { label: "Past visits", items: myVisits.filter((v) => v.status === "completed" || v.status === "missed" || v.status === "cancelled") },
  ];

  return (
    <div>
      <PageHeader title="Care Schedule" description="Your planned and completed care visits." />
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : myVisits.length === 0 ? (
        <EmptyState title="No care visits scheduled" />
      ) : (
        <div className="space-y-8">
          {groups.map((g) =>
            g.items.length ? (
              <div key={g.label}>
                <h2 className="mb-3 font-display text-lg font-semibold">{g.label}</h2>
                <div className="space-y-3">
                  {g.items.map((v) => (
                    <Card key={v.id} className="flex flex-wrap items-center justify-between gap-3 p-5 shadow-soft">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <CalendarDays className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{formatDateTime(v.scheduled_start)}</p>
                          <p className="text-xs text-muted-foreground">
                            Carer: {v.profiles?.full_name ?? "To be assigned"} · {formatDateTime(v.scheduled_end)}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={v.status} />
                    </Card>
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
