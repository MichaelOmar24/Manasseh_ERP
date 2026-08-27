import { Link } from "react-router-dom";
import { ClipboardCheck, Bell, Users, AlertTriangle, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useAuth } from "@/context/auth";
import { useVisits, useIncidents, useNotifications, useClients } from "@/lib/api";
import { formatDateTime, formatTime } from "@/lib/utils";

export default function CaregiverDashboard() {
  const { profile } = useAuth();
  const { data: visits = [] } = useVisits();
  const { data: incidents = [] } = useIncidents();
  const { data: notifications = [] } = useNotifications();
  const { data: clients = [] } = useClients();

  const myVisits = visits.filter((v) => v.caregiver_id === profile?.id);
  const today = new Date().toISOString().slice(0, 10);
  const todayVisits = myVisits.filter((v) => v.scheduled_start?.slice(0, 10) === today);
  const nextVisit = todayVisits
    .filter((v) => v.status === "scheduled")
    .sort((a, b) => (a.scheduled_start ?? "").localeCompare(b.scheduled_start ?? ""))[0];

  const myClientIds = new Set(myVisits.map((v) => v.client_id));
  const assignedClients = clients.filter((c) => myClientIds.has(c.id));
  const myIncidents = incidents.filter((i) => i.reported_by === profile?.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Good day, {profile?.full_name?.split(" ")[0] ?? "Carer"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Your visits and care tasks for today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Visits today" value={todayVisits.length} icon={ClipboardCheck} tone="brand" hint={`${todayVisits.filter((v) => v.status === "completed").length} completed`} />
        <StatCard title="Assigned clients" value={assignedClients.length} icon={Users} hint="under your care" />
        <StatCard title="My incident reports" value={myIncidents.length} icon={AlertTriangle} tone={myIncidents.length ? "warning" : "success"} hint="reported" />
        <StatCard title="Notifications" value={notifications.filter((n) => !n.read_at).length} icon={Bell} hint="unread" />
      </div>

      {nextVisit && (
        <Card className="gradient-brand p-6 text-white shadow-lift">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Next visit</p>
              <h2 className="mt-1 font-display text-2xl font-semibold">{formatDateTime(nextVisit.scheduled_start)}</h2>
              <p className="mt-1 text-sm text-white/85">
                {nextVisit.clients?.reference ?? "Client"} · {nextVisit.clients?.address ?? ""} · until {formatTime(nextVisit.scheduled_end)}
              </p>
            </div>
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link to="/portal/caregiver/visits">Manage visit</Link>
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between p-5 pb-2">
            <h2 className="font-display text-lg font-semibold">Today's schedule</h2>
            <Button variant="ghost" size="sm" asChild><Link to="/portal/caregiver/schedule">Full schedule <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
          <div className="space-y-3 p-5 pt-2">
            {todayVisits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No visits scheduled today.</p>
            ) : (
              todayVisits.map((v) => (
                <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-4">
                  <div>
                    <p className="font-medium">{v.clients?.reference ?? "Client"}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(v.scheduled_start)} – {formatTime(v.scheduled_end)}</p>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-5 pb-2">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><Bell className="h-5 w-5 text-primary" /> Notifications</h2>
          </div>
          <div className="space-y-3 p-5 pt-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notifications.</p>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body ? <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p> : null}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
