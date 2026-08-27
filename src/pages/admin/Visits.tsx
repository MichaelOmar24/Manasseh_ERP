import { useState } from "react";
import { toast } from "sonner";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useVisits } from "@/lib/api";
import type { Visit } from "@/lib/types";
import { formatDateTime, formatTime } from "@/lib/utils";

export default function VisitsPage() {
  const { data: visits = [], isLoading } = useVisits();
  const [status, setStatus] = useState("all");

  const filtered = status === "all" ? visits : visits.filter((v) => v.status === status);

  const columns: Column<Visit>[] = [
    { header: "Scheduled", cell: (v) => <span className="text-muted-foreground">{formatDateTime(v.scheduled_start)}</span> },
    { header: "Client", cell: (v) => <span className="font-medium">{v.clients?.reference ?? "—"}</span> },
    { header: "Carer", cell: (v) => v.profiles?.full_name ?? "Unassigned" },
    { header: "Check-in", cell: (v) => <span className="text-muted-foreground">{formatTime(v.check_in_at)}</span> },
    { header: "Check-out", cell: (v) => <span className="text-muted-foreground">{formatTime(v.check_out_at)}</span> },
    { header: "Status", cell: (v) => <StatusBadge status={v.status} /> },
    { header: "Notes", cell: (v) => <span className="line-clamp-1 max-w-[220px] text-muted-foreground">{v.care_notes ?? "—"}</span> },
  ];

  const statuses = ["all", "scheduled", "in_progress", "completed", "missed", "cancelled"];

  return (
    <div>
      <PageHeader title="Visit Tracking" description="Monitor the status of every caregiver visit." />
      <div className="mb-4 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Button
            key={s}
            variant={status === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatus(s)}
            className="capitalize"
          >
            {s === "all" ? <Filter className="h-3.5 w-3.5" /> : null}
            {s.replace(/_/g, " ")}
          </Button>
        ))}
      </div>
      <DataTable columns={columns} rows={filtered} loading={isLoading} keyOf={(v) => v.id} emptyTitle="No visits match this filter" />
    </div>
  );
}
