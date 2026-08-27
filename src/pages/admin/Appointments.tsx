import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useAppointments, useTableMutation } from "@/lib/api";
import type { Appointment } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const typeLabel: Record<string, string> = {
  initial_assessment: "Initial assessment",
  care_review: "Care review",
  consultation: "Consultation",
  staff_booking: "Staff booking",
};

export default function Appointments() {
  const { data: appointments = [], isLoading } = useAppointments();
  const { mutateAsync } = useTableMutation<Appointment>("appointments");

  const setStatus = async (a: Appointment, status: string) => {
    await mutateAsync({ id: a.id, values: { status } });
    toast.success(status === "confirmed" ? "Appointment confirmed." : "Appointment cancelled.");
  };

  const columns: Column<Appointment>[] = [
    { header: "Type", cell: (a) => <span className="font-medium">{typeLabel[a.appointment_type]}</span> },
    { header: "Requester", cell: (a) => (
      <div>
        <p className="font-medium">{a.name ?? "—"}</p>
        <p className="text-xs text-muted-foreground">{a.email}</p>
      </div>
    ) },
    { header: "Date", cell: (a) => <span className="text-muted-foreground">{formatDate(a.requested_date)}</span> },
    { header: "Time", cell: (a) => <span className="text-muted-foreground">{a.time_slot ?? "—"}</span> },
    { header: "Status", cell: (a) => <StatusBadge status={a.status} /> },
    { header: "Actions", cell: (a) => (
      a.status === "pending" ? (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setStatus(a, "confirmed")}><Check className="h-4 w-4" /> Confirm</Button>
          <Button size="sm" variant="outline" onClick={() => setStatus(a, "cancelled")}><X className="h-4 w-4" /> Decline</Button>
        </div>
      ) : a.status === "confirmed" ? (
        <Button size="sm" variant="outline" onClick={() => setStatus(a, "completed")}>Mark completed</Button>
      ) : null
    ) },
  ];

  return (
    <div>
      <PageHeader
        title="Appointment Management"
        description="Review and action appointment and staff booking requests."
      />
      <DataTable columns={columns} rows={appointments} loading={isLoading} keyOf={(a) => a.id} emptyTitle="No appointments" />
    </div>
  );
}
