import { UserRound, HeartPulse } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/context/auth";
import { useVisits, useProfiles, useClients } from "@/lib/api";

export default function Caregiver() {
  const { profile } = useAuth();
  const { data: visits = [] } = useVisits();
  const { data: profiles = [] } = useProfiles();
  const { data: clients = [] } = useClients();

  const myClient = clients.find((c) => c.profile_id === profile?.id);
  const myVisits = visits.filter((v) => v.clients?.profile_id === profile?.id && v.caregiver_id);
  const caregiverIds = Array.from(new Set(myVisits.map((v) => v.caregiver_id!)));
  const caregivers = profiles.filter((p) => caregiverIds.includes(p.id));

  const careManager = myClient?.care_manager_id ? profiles.find((p) => p.id === myClient!.care_manager_id) : null;

  return (
    <div>
      <PageHeader title="My Caregiver" description="The wonderful people who support you." />
      <div className="grid gap-5 md:grid-cols-2">
        {caregivers.length === 0 ? (
          <EmptyState title="No caregivers assigned yet" description="Your care team will appear here once visits are scheduled." />
        ) : (
          caregivers.map((cg) => (
            <Card key={cg.id} className="flex items-center gap-4 p-5 shadow-soft">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-xl font-semibold text-primary">
                {(cg.full_name ?? "?").split(" ").map((x) => x[0]).slice(0, 2).join("")}
              </div>
              <div>
                <p className="flex items-center gap-2 font-display text-lg font-semibold">
                  <UserRound className="h-4 w-4 text-primary" /> {cg.full_name}
                </p>
                <p className="text-sm text-muted-foreground">Care Worker · {cg.email}</p>
              </div>
            </Card>
          ))
        )}

        {careManager && (
          <Card className="flex items-center gap-4 border-primary/20 bg-primary/5 p-5 shadow-soft">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-semibold text-primary-foreground">
              {(careManager.full_name ?? "?").split(" ").map((x) => x[0]).slice(0, 2).join("")}
            </div>
            <div>
              <p className="flex items-center gap-2 font-display text-lg font-semibold">
                <HeartPulse className="h-4 w-4 text-primary" /> {careManager.full_name}
              </p>
              <p className="text-sm text-muted-foreground">Your Care Manager · {careManager.email}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
