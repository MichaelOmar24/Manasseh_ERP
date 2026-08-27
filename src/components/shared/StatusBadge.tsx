import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const toneMap: Record<string, string> = {
  active: "border-success/30 bg-success/10 text-success",
  paid: "border-success/30 bg-success/10 text-success",
  confirmed: "border-success/30 bg-success/10 text-success",
  completed: "border-success/30 bg-success/10 text-success",
  clear: "border-success/30 bg-success/10 text-success",
  open: "border-primary/30 bg-primary/10 text-primary",
  published: "border-primary/30 bg-primary/10 text-primary",
  sent: "border-primary/30 bg-primary/10 text-primary",
  in_progress: "border-primary/30 bg-primary/10 text-primary",
  investigating: "border-warning/40 bg-warning/15 text-warning-foreground",
  pending: "border-warning/40 bg-warning/15 text-warning-foreground",
  partial: "border-warning/40 bg-warning/15 text-warning-foreground",
  overdue: "border-destructive/30 bg-destructive/10 text-destructive",
  missed: "border-destructive/30 bg-destructive/10 text-destructive",
  cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
  closed: "bg-muted text-muted-foreground border-border",
  draft: "bg-muted text-muted-foreground border-border",
  archived: "bg-muted text-muted-foreground border-border",
  resolved: "border-success/30 bg-success/10 text-success",
  new: "border-primary/30 bg-primary/10 text-primary",
  review: "border-warning/40 bg-warning/15 text-warning-foreground",
  interview: "border-primary/30 bg-primary/10 text-primary",
  offered: "border-success/30 bg-success/10 text-success",
  rejected: "bg-muted text-muted-foreground border-border",
  expiring: "border-warning/40 bg-warning/15 text-warning-foreground",
  expired: "border-destructive/30 bg-destructive/10 text-destructive",
  replied: "border-success/30 bg-success/10 text-success",
};

export function StatusBadge({ status }: { status: string }) {
  const display = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", toneMap[status] ?? "bg-muted text-muted-foreground border-border")}
    >
      {display}
    </Badge>
  );
}
