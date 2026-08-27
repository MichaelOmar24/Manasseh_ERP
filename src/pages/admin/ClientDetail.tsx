import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, UserRound, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { useClients, useCarePlans, useVisits, useInvoices, useDocuments } from "@/lib/api";
import { NotFound } from "@/pages/NotFound";
import type { CarePlan, Document, Invoice, Visit } from "@/lib/types";
import { formatCurrency, formatDate, formatDateTime, formatTime } from "@/lib/utils";

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: clients = [], isLoading } = useClients();
  const { data: plans = [] } = useCarePlans();
  const { data: visits = [] } = useVisits();
  const { data: invoices = [] } = useInvoices();
  const { data: docs = [] } = useDocuments();

  const client = clients.find((c) => c.id === id);

  const clientPlans = useMemo(() => plans.filter((p) => p.client_id === id), [plans, id]);
  const clientVisits = useMemo(() => visits.filter((v) => v.client_id === id), [visits, id]);
  const clientInvoices = useMemo(() => invoices.filter((i) => i.client_id === id), [invoices, id]);
  const clientDocs = useMemo(() => docs.filter((d) => d.owner_type === "client" && d.owner_id === id), [docs, id]);

  if (isLoading) return <p className="text-muted-foreground">Loading client…</p>;
  if (!client) return <NotFound />;

  const planCols: Column<CarePlan>[] = [
    { header: "Plan", cell: (p) => <span className="font-medium">{p.title}</span> },
    { header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
    { header: "Start", cell: (p) => <span className="text-muted-foreground">{formatDate(p.start_date)}</span> },
    { header: "Review", cell: (p) => <span className="text-muted-foreground">{formatDate(p.review_date)}</span> },
  ];

  const visitCols: Column<Visit>[] = [
    { header: "Date", cell: (v) => <span className="text-muted-foreground">{formatDateTime(v.scheduled_start)}</span> },
    { header: "Carer", cell: (v) => v.profiles?.full_name ?? "Unassigned" },
    { header: "Status", cell: (v) => <StatusBadge status={v.status} /> },
    { header: "Notes", cell: (v) => <span className="line-clamp-1 max-w-[240px] text-muted-foreground">{v.care_notes ?? "—"}</span> },
  ];

  const invoiceCols: Column<Invoice>[] = [
    { header: "Number", cell: (i) => <span className="font-mono text-xs">{i.invoice_number}</span> },
    { header: "Period", cell: (i) => <span className="text-muted-foreground">{formatDate(i.period_start)} – {formatDate(i.period_end)}</span> },
    { header: "Total", cell: (i) => <span className="font-medium">{formatCurrency(i.total)}</span> },
    { header: "Status", cell: (i) => <StatusBadge status={i.status} /> },
  ];

  const docCols: Column<Document>[] = [
    { header: "Title", cell: (d) => <span className="font-medium">{d.title}</span> },
    { header: "Category", cell: (d) => <span className="capitalize text-muted-foreground">{(d.category ?? "—").replace(/_/g, " ")}</span> },
    { header: "File", cell: (d) => <span className="text-muted-foreground">{d.file_name ?? "—"}</span> },
    { header: "Added", cell: (d) => <span className="text-muted-foreground">{formatDate(d.created_at)}</span> },
  ];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground">
        <Link to="/portal/admin/clients"><ArrowLeft className="h-4 w-4" /> Back to clients</Link>
      </Button>

      <Card className="p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-semibold text-primary">
            {(client.full_name ?? "?").split(" ").map((x) => x[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold tracking-tight">{client.full_name}</h1>
              <StatusBadge status={client.status} />
              <span className="font-mono text-xs text-muted-foreground">{client.reference}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {client.address ? <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {client.address}</span> : null}
              <span>DOB: {formatDate(client.date_of_birth)}</span>
              <span>Funding: <span className="capitalize">{(client.funding_source ?? "—").replace(/_/g, " ")}</span></span>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Medical conditions</p>
            <p className="mt-1 text-sm">{client.medical_conditions?.length ? client.medical_conditions.join(", ") : "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Allergies</p>
            <p className="mt-1 text-sm">{client.allergies?.length ? client.allergies.join(", ") : "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Emergency contact</p>
            <p className="mt-1 text-sm">{client.emergency_contact_name ?? "—"}</p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">{client.emergency_contact_phone ? <Phone className="h-3 w-3" /> : null}{client.emergency_contact_phone ?? ""}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">GP</p>
            <p className="mt-1 text-sm">{client.gp_name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{client.gp_phone ?? ""}</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Care plans ({clientPlans.length})</TabsTrigger>
          <TabsTrigger value="visits">Visits ({clientVisits.length})</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({clientInvoices.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({clientDocs.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="plans" className="pt-4">
          {clientPlans.length ? (
            <DataTable columns={planCols} rows={clientPlans} keyOf={(p) => p.id} />
          ) : (
            <EmptyState title="No care plans" icon={AlertCircle} action={<Button asChild><Link to="/portal/admin/care-plans">Create a care plan</Link></Button>} />
          )}
        </TabsContent>
        <TabsContent value="visits" className="pt-4">
          {clientVisits.length ? (
            <DataTable columns={visitCols} rows={clientVisits} keyOf={(v) => v.id} />
          ) : (
            <EmptyState title="No visits recorded" />
          )}
        </TabsContent>
        <TabsContent value="invoices" className="pt-4">
          {clientInvoices.length ? (
            <DataTable columns={invoiceCols} rows={clientInvoices} keyOf={(i) => i.id} />
          ) : (
            <EmptyState title="No invoices" />
          )}
        </TabsContent>
        <TabsContent value="documents" className="pt-4">
          {clientDocs.length ? (
            <DataTable columns={docCols} rows={clientDocs} keyOf={(d) => d.id} />
          ) : (
            <EmptyState title="No documents" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
