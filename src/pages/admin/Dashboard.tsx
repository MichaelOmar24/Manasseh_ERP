import { Link } from "react-router-dom";
import {
  Users,
  Briefcase,
  ClipboardCheck,
  AlertTriangle,
  Wallet,
  HeartPulse,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useVisits, useClients, useStaff, useIncidents, useInvoices, useAppointments, useCarePlans } from "@/lib/api";
import { formatTime } from "@/lib/utils";

export default function AdminDashboard() {
  const { data: visits = [] } = useVisits();
  const { data: clients = [] } = useClients();
  const { data: staff = [] } = useStaff();
  const { data: incidents = [] } = useIncidents();
  const { data: invoices = [] } = useInvoices();
  const { data: appointments = [] } = useAppointments();
  const { data: carePlans = [] } = useCarePlans();

  const today = new Date().toISOString().slice(0, 10);
  const todayVisits = visits.filter((v) => v.scheduled_start?.slice(0, 10) === today);
  const openIncidents = incidents.filter((i) => i.status === "open" || i.status === "investigating");
  const pendingAppointments = appointments.filter((a) => a.status === "pending");
  const overdueInvoices = invoices.filter((i) => i.status === "overdue");
  const reviewsDue = carePlans.filter((p) => p.status === "review");
  const activeClients = clients.filter((c) => c.status === "active");
  const revenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Executive Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live overview of clients, staff, visits and operations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active clients" value={activeClients.length} icon={Users} tone="brand" hint={`${clients.length} total`} />
        <StatCard title="Care staff" value={staff.filter((s) => s.employment_status === "active").length} icon={Briefcase} hint="active workers" />
        <StatCard title="Visits today" value={todayVisits.length} icon={ClipboardCheck} tone="success" hint={`${todayVisits.filter((v) => v.status === "completed").length} completed`} />
        <StatCard title="Open incidents" value={openIncidents.length} icon={AlertTriangle} tone={openIncidents.length > 0 ? "danger" : "success"} hint="needs attention" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Revenue (paid)" value={`£${revenue.toLocaleString()}`} icon={Wallet} tone="brand" hint="all time" />
        <StatCard title="Pending reviews" value={reviewsDue.length} icon={HeartPulse} tone="warning" hint="care plans" />
        <StatCard title="Pending appointments" value={pendingAppointments.length} icon={ArrowRight} hint="awaiting confirmation" />
        <StatCard title="Overdue invoices" value={overdueInvoices.length} icon={Wallet} tone={overdueInvoices.length > 0 ? "danger" : "success"} hint="finance action" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-5 pb-2">
            <h2 className="font-display text-lg font-semibold">Today's visits</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/portal/admin/visits">View all <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          {todayVisits.length === 0 ? (
            <div className="p-5 pt-2"><EmptyState title="No visits scheduled today" /></div>
          ) : (
            <div className="divide-y px-5">
              {todayVisits.slice(0, 6).map((v) => (
                <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="font-medium">
                      {v.clients?.reference ?? "—"} · {v.clients?.address ?? "Client"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(v.scheduled_start)} – {formatTime(v.scheduled_end)} · {v.profiles?.full_name ?? "Unassigned"}
                    </p>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between p-5 pb-2">
            <h2 className="font-display text-lg font-semibold">Alerts</h2>
          </div>
          <div className="space-y-3 p-5 pt-2">
            {openIncidents.length > 0 ? (
              openIncidents.slice(0, 4).map((i) => (
                <div key={i.id} className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{i.category} incident</p>
                    <StatusBadge status={i.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{i.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No open incidents. All clear.</p>
            )}
            {reviewsDue.length > 0 && (
              <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
                <p className="font-medium">Care plan reviews due</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{reviewsDue.length} plan(s) in review</p>
              </div>
            )}
            {overdueInvoices.length > 0 && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm">
                <p className="font-medium">Overdue invoices</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {overdueInvoices.length} invoice(s) overdue — total £{overdueInvoices.reduce((s, i) => s + Number(i.total), 0).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
