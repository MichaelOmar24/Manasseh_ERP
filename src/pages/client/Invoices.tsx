import { Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/context/auth";
import { useInvoices, useClients } from "@/lib/api";
import type { Invoice } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function Invoices() {
  const { profile } = useAuth();
  const { data: invoices = [], isLoading } = useInvoices();
  const { data: clients = [] } = useClients();
  const myClient = clients.find((c) => c.profile_id === profile?.id);
  const myInvoices = invoices.filter((i) => i.client_id === myClient?.id);

  const totalOutstanding = myInvoices
    .filter((i) => i.status === "sent" || i.status === "partial" || i.status === "overdue")
    .reduce((s, i) => s + Number(i.total), 0);

  const columns: Column<Invoice>[] = [
    { header: "Invoice", cell: (i) => <span className="flex items-center gap-2 font-mono text-xs font-medium"><Receipt className="h-4 w-4 text-primary" /> {i.invoice_number}</span> },
    { header: "Period", cell: (i) => <span className="text-muted-foreground">{formatDate(i.period_start)} – {formatDate(i.period_end)}</span> },
    { header: "Issued", cell: (i) => <span className="text-muted-foreground">{formatDate(i.issue_date)}</span> },
    { header: "Due", cell: (i) => <span className="text-muted-foreground">{formatDate(i.due_date)}</span> },
    { header: "Total", cell: (i) => <span className="font-semibold">{formatCurrency(i.total)}</span> },
    { header: "Status", cell: (i) => <StatusBadge status={i.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Invoices & Payments" description="A clear record of your care billing." />
      {myInvoices.length ? (
        <>
          <Card className="mb-6 flex flex-wrap items-center justify-between gap-3 border-primary/20 bg-primary/5 p-5 shadow-soft">
            <div>
              <p className="text-sm text-muted-foreground">Outstanding balance</p>
              <p className="font-display text-3xl font-semibold">{formatCurrency(totalOutstanding)}</p>
            </div>
            <p className="max-w-xs text-xs text-muted-foreground">
              Payment options: bank transfer to our office or by card over the phone. Contact finance for help.
            </p>
          </Card>
          <DataTable columns={columns} rows={myInvoices} loading={isLoading} keyOf={(i) => i.id} emptyTitle="No invoices" />
        </>
      ) : (
        <EmptyState title="No invoices yet" description="Your invoices will appear here after your first billing period." />
      )}
    </div>
  );
}
