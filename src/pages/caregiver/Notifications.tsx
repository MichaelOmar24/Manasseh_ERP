import { toast } from "sonner";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/context/auth";
import { useNotifications } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/utils";

export default function Notifications() {
  const { profile } = useAuth();
  const { data: notifications = [], isLoading } = useNotifications();
  const myNotifications = notifications.filter((n) => n.user_id === profile?.id);

  const markAllRead = async () => {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", profile?.id).is("read_at", null);
    toast.success("All notifications marked as read.");
  };

  const unread = myNotifications.filter((n) => !n.read_at);

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Updates about your shifts and care."
        action={
          unread.length ? (
            <Button variant="outline" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          ) : null
        }
      />
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : myNotifications.length === 0 ? (
        <EmptyState title="No notifications" />
      ) : (
        <div className="space-y-3">
          {myNotifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 rounded-xl border p-4 shadow-soft ${n.read_at ? "bg-card opacity-70" : "border-primary/25 bg-primary/5"}`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{n.title}</p>
                {n.body ? <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p> : null}
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.created_at)}</p>
              </div>
              {!n.read_at ? (
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" title="Unread" />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
