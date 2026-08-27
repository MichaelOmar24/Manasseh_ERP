import { Users, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/context/auth";
import { useVisits, useClients } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function Clients() {
  const { profile } = useAuth();
  const { data: visits = [] } = useVisits();
  const { data: clients = [] } = useClients();

  const myVisits = visits.filter((v) => v.caregiver_id === profile?.id);
  const myClientIds = new Set(myVisits.map((v) => v.client_id));
  const assigned = clients.filter((c) => myClientIds.has(c.id));

  return (
    <div>
      <PageHeader title="My Clients" description="The people you support and their key details." />
      {assigned.length === 0 ? (
        <EmptyState title="No assigned clients yet" />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {assigned.map((c) => {
            const cVisits = myVisits.filter((v) => v.client_id === c.id);
            const lastVisit = cVisits.find((v) => v.status === "completed");
            return (
              <Card key={c.id} className="p-5 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 font-semibold text-primary">
                    {(c.full_name ?? "?").split(" ").map((x) => x[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 font-display text-lg font-semibold">
                      <Users className="h-4 w-4 text-primary" /> {c.full_name}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">{c.reference}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {c.address ? (
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {c.address}</p>
                  ) : null}
                  {c.emergency_contact_phone ? (
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {c.emergency_contact_phone}</p>
                  ) : null}
                </div>
                {c.medical_conditions?.length ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.medical_conditions.map((m) => (
                      <span key={m} className="rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-medium text-warning-foreground">{m}</span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                  <span>{cVisits.length} visits assigned</span>
                  {lastVisit ? (
                    <span>Last: <StatusBadge status={lastVisit.status} /></span>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
