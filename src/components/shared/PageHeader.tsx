import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export function PageHeader({
  title,
  description,
  action,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ??
        (actionLabel && onAction ? (
          <Button onClick={onAction}>
            {ActionIcon ? <ActionIcon className="h-4 w-4" /> : null}
            {actionLabel}
          </Button>
        ) : null)}
    </div>
  );
}
