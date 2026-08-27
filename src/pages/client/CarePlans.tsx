import { HeartPulse, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/context/auth";
import { useCarePlans, useCarePlanTasks } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function CarePlans() {
  const { profile } = useAuth();
  const { data: plans = [], isLoading } = useCarePlans();
  const myPlans = plans.filter((p) => p.clients?.profile_id === profile?.id);

  return (
    <div>
      <PageHeader title="My Care Plans" description="Your personalised plans of care and daily tasks." />
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : myPlans.length === 0 ? (
        <EmptyState title="No care plans yet" />
      ) : (
        <div className="space-y-5">
          {myPlans.map((p) => (
            <PlanCard key={p.id} planId={p.id} title={p.title} status={p.status} description={p.description} baseline={p.baseline_notes} reviewDate={p.review_date} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({
  planId,
  title,
  status,
  description,
  baseline,
  reviewDate,
}: {
  planId: string;
  title: string;
  status: string;
  description: string | null;
  baseline: string | null;
  reviewDate: string | null;
}) {
  const { data: tasks = [] } = useCarePlanTasks(planId);

  return (
    <Card className="overflow-hidden shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">{title}</h2>
            {reviewDate ? (
              <p className="text-xs text-muted-foreground">Next review: {formatDate(reviewDate)}</p>
            ) : null}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="space-y-4 p-5">
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        {baseline ? (
          <div className="rounded-lg bg-muted/40 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">About your care</p>
            <p className="mt-1">{baseline}</p>
          </div>
        ) : null}
        <div>
          <h3 className="flex items-center gap-1.5 font-display font-semibold">
            <ListChecks className="h-4 w-4 text-primary" /> Daily care tasks
          </h3>
          {tasks.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No specific tasks listed.</p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {tasks.map((t) => (
                <div key={t.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{t.title}</p>
                  {t.instructions ? <p className="mt-0.5 text-xs text-muted-foreground">{t.instructions}</p> : null}
                  <p className="mt-1 text-xs capitalize text-muted-foreground">
                    {t.frequency} {t.scheduled_time ? `· ${t.scheduled_time}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
