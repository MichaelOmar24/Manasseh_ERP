import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIncidents, useTableMutation } from "@/lib/api";
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
  const { data: incidents = [], isLoading } = useIncidents();
  const { mutateAsync } = useTableMutation<Incident>("incidents");

  const setStatus = async (i: Incident, status: Incident["status"]) => {
    await mutateAsync({ id: i.id, values: { status, resolved_at: status === "resolved" || status === "closed" ? new Date().toISOString() : i.resolved_at } });
    toast.success(`Incident marked ${status}.`);
  };

  const columns: Column<Incident>[] = [
    { header: "Reported", cell: (i) => <span className="text-muted-foreground">{formatDate(i.reported_at)}</span> },
    { header: "Client", cell: (i) => <span className="font-medium">{i.clients?.reference ?? "—"}</span> },
    { header: "Severity", cell: (i) => <Badge className={cn("capitalize", severityTone[i.severity])}>{i.severity}</Badge> },
    { header: "Category", cell: (i) => <span className="capitalize">{i.category}</span> },
    { header: "Description", cell: (i) => <span className="line-clamp-2 max-w-[280px] text-muted-foreground">{i.description}</span> },
    { header: "Reporter", cell: (i) => i.profiles?.full_name ?? "—" },
    { header: "Status", cell: (i) => <StatusBadge status={i.status} /> },
    { header: "Actions", cell: (i) => (
      <div className="flex gap-2">
        {i.status === "open" && <Button size="sm" variant="outline" onClick={() => setStatus(i, "investigating")}>Investigate</Button>}
        {(i.status === "open" || i.status === "investigating") && <Button size="sm" onClick={() => setStatus(i, "resolved")}>Resolve</Button>}
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader
        title="Incidents"
        description="Safety incidents and safeguarding reports across the service."
      />
      <DataTable columns={columns} rows={incidents} loading={isLoading} keyOf={(i) => i.id} emptyTitle="No incidents reported" />
    </div>
  );
}
