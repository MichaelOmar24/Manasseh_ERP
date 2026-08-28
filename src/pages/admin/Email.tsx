import { useState } from "react";
import { toast } from "sonner";
import { Mail, RefreshCw, Send, Reply, Inbox, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { useMailMessages } from "@/lib/api";
import { useAuth } from "@/context/auth";
import { supabase } from "@/integrations/supabase/client";
import type { MailMessage } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

const MAILBOX = "info@manassehhealthcare.org";

function stripUnsafeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "");
}

export default function Email() {
  const { data: messages = [], isLoading, refetch } = useMailMessages();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const selected = messages.find((m) => m.id === selectedId) ?? null;

  const markRead = async (m: MailMessage) => {
    if (m.seen) return;
    await supabase.from("mail_messages").update({ seen: true }).eq("id", m.id);
    void refetch();
  };

  const select = (m: MailMessage) => {
    setSelectedId(m.id);
    void markRead(m);
  };

  const sync = async () => {
    setSyncing(true);
    const { data, error } = await supabase.functions.invoke("mail-sync");
    setSyncing(false);
    if (error || !data?.ok) {
      toast.error(data?.error ?? "Failed to sync mailbox.");
      return;
    }
    toast.success(`Mailbox synced — ${data.synced} message(s) fetched.`);
    void refetch();
  };

  const unread = messages.filter((m) => !m.seen).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email"
        description={`Reading and sending from ${MAILBOX}.`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={sync} disabled={syncing}>
              <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
              {syncing ? "Syncing…" : "Refresh"}
            </Button>
            <ComposeDialog />
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* List */}
        <Card className="overflow-hidden shadow-soft">
          <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Inbox className="h-4 w-4 text-primary" /> Inbox
            </p>
            <span className="text-xs text-muted-foreground">{unread} unread</span>
          </div>
          <div className="max-h-[70vh] divide-y overflow-y-auto">
            {isLoading ? (
              <p className="p-6 text-sm text-muted-foreground">Loading…</p>
            ) : messages.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="No mail yet"
                  description="Click Refresh to pull emails from the mailbox."
                />
              </div>
            ) : (
              messages.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => select(m)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/60",
                    selectedId === m.id && "bg-accent",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("truncate text-sm", !m.seen ? "font-semibold" : "font-medium text-muted-foreground")}>
                        {m.from_name || m.from_email || (m.direction === "sent" ? "You" : "Unknown")}
                      </p>
                      {!m.seen ? <span className="h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
                    </div>
                    <p className={cn("truncate text-sm", m.seen ? "text-muted-foreground" : "font-medium")}>
                      {m.subject || "(no subject)"}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {m.direction === "sent" ? `To: ${m.to_email ?? ""} · ` : ""}
                      {(m.body_text ?? "").replace(/\s+/g, " ").slice(0, 90)}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {formatDateTime(m.date)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Detail */}
        <Card className="overflow-hidden shadow-soft">
          {!selected ? (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Mail className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm">Select a message to read it</p>
            </div>
          ) : (
            <div className="flex max-h-[70vh] flex-col">
              <div className="border-b p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-display text-xl font-semibold leading-snug">
                    {selected.subject || "(no subject)"}
                  </h2>
                  {selected.direction === "inbound" ? (
                    <ComposeDialog
                      trigger={
                        <Button size="sm" variant="outline">
                          <Reply className="h-4 w-4" /> Reply
                        </Button>
                      }
                      presetTo={selected.from_email ?? ""}
                      presetSubject={selected.subject ? `Re: ${selected.subject}` : ""}
                    />
                  ) : null}
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">
                      {selected.from_name || selected.from_email || "You"}
                    </span>
                    {selected.from_email ? ` <${selected.from_email}>` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">To: {selected.to_email || MAILBOX}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {formatDateTime(selected.date)}
                  </p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 text-sm leading-relaxed">
                {selected.body_html ? (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: stripUnsafeHtml(selected.body_html) }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {selected.body_text || "No message body."}
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function ComposeDialog({
  trigger,
  presetTo = "",
  presetSubject = "",
}: {
  trigger?: React.ReactNode;
  presetTo?: string;
  presetSubject?: string;
}) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ to: presetTo, subject: presetSubject, body: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.to || !form.subject || !form.body) {
      toast.error("Please complete the recipient, subject and message.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("mail-send", {
      body: { to: form.to, subject: form.subject, text: form.body },
    });
    setBusy(false);
    if (error || !data?.ok) {
      toast.error(data?.error ?? "Failed to send email.");
      return;
    }
    toast.success("Email sent.");
    setOpen(false);
    setForm({ to: "", subject: "", body: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Send className="h-4 w-4" /> Compose
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Compose email{profile ? ` — signed in as ${profile.full_name ?? profile.email}` : ""}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mail-to">To *</Label>
            <Input id="mail-to" type="email" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="recipient@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mail-subject">Subject *</Label>
            <Input id="mail-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mail-body">Message *</Label>
            <Textarea id="mail-body" rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Write your message…" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              <Send className="h-4 w-4" /> {busy ? "Sending…" : "Send email"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
