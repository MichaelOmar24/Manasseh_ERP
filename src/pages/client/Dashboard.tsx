import { Link } from "react-router-dom";
import { CalendarDays, HeartPulse, Wallet, Bell, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useAuth } from "@/context/auth";
import { useVisits, useCarePlans, useInvoices, useNotifications, useClients } from "@/lib/api";
import { formatDateTime, formatCurrency, formatDate } from "@/lib/utils";

export default function ClientDashboard() {
  const { profile } = useAuth();
  const { data: visits = [] } = useVisits();
  const { data: plans = [] } = useCarePlans();
  const { data: invoices = [] } = useInvoices();
  const { data: notifications = [] } = useNotifications();
  const { data: clients = [] } = useClients();

  const myVisits = visits.filter((v) => v.clients?.profile_id === profile?.id);
  const upcoming = myVisits
    .filter((v) => v.status === "scheduled" || v.status === "in_progress")
    .sort((a, b) => (a.scheduled_start ?? "").localeCompare(b.scheduled_start ?? ""))
    .slice(0, 3);
  const completed = myVisits.filter((v) => v.status === "completed").length;
  const myPlans = plans.filter((p) => p.clients?.profile_id === profile?.id);
  const myInvoices = invoices.filter((i) => i.clients?.profile_id === profile?.id);
  const outstanding = myInvoices
    .filter((i) => i.status === "sent" || i.status === "partial" || i.status === "overdue")
    .reduce((s, i) => s + Number(i.total), 0);
  const myClient = clients.find((c) => c.profile_id === profile?.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Hello, {profile?.full_name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening with your care today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Next visits" value={upcoming.length} icon={CalendarDays} tone="brand" hint="scheduled" />
        <StatCard title="Completed visits" value={completed} icon={HeartPulse} tone="success" hint="all time" />
        <StatCard title="Active care plans" value={myPlans.filter((p) => p.status === "active").length} icon={HeartPulse} hint="currently in place" />
        <StatCard title="Outstanding balance" value={formatCurrency(outstanding)} icon={Wallet} tone={outstanding > 0 ? "warning" : "success"} hint="unpaid invoices" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-5 pb-2">
            <h2 className="font-display text-lg font-semibold">Upcoming visits</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/portal/client/schedule">Full schedule <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="p-5 pt-2">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming visits scheduled.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((v) => (
                  <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-4">
                    <div>
                      <p className="font-medium">{formatDateTime(v.scheduled_start)}</p>
                      <p className="text-xs text-muted-foreground">
                        Carer: {v.profiles?.full_name ?? "To be assigned"} · until {formatDateTime(v.scheduled_end)}
                      </p>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-5 pb-2">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Bell className="h-5 w-5 text-primary" /> Notifications
            </h2>
          </div>
          <div className="space-y-3 p-5 pt-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notifications.</p>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body ? <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p> : null}
                  <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(n.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {myClient?.care_manager_id && (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-5 shadow-soft">
          <p className="text-sm">
            <span className="font-medium">Your care manager:</span>{" "}
            <span className="text-muted-foreground">Assigned to support you and your family.</span>
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/portal/client/messages">Send a message</Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
