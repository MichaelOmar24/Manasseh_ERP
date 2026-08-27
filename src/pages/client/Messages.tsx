import { useState } from "react";
import { toast } from "sonner";
import { Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/context/auth";
import { useMessages, useClients, useVisits, useProfiles } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/utils";

export default function Messages() {
  const { profile } = useAuth();
  const { data: messages = [], isLoading } = useMessages();
  const { data: clients = [] } = useClients();
  const { data: visits = [] } = useVisits();
  const { data: profiles = [] } = useProfiles();

  const myClient = clients.find((c) => c.profile_id === profile?.id);
  const myVisits = visits.filter((v) => v.clients?.profile_id === profile?.id && v.caregiver_id);
  const caregiverIds = Array.from(new Set(myVisits.map((v) => v.caregiver_id!)));
  const careTeam = profiles.filter(
    (p) => p.id === myClient?.care_manager_id || caregiverIds.includes(p.id),
  );

  const thread = messages
    .filter((m) => m.sender_id === profile?.id || m.receiver_id === profile?.id || (m.client_id != null && m.client_id === myClient?.id))
    .sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));

  return (
    <div>
      <PageHeader title="Messages" description="Talk to your care team." action={<ComposeDialog team={careTeam} />} />
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : thread.length === 0 ? (
        <EmptyState title="No messages yet" description="Reach out to your care team any time." />
      ) : (
        <div className="space-y-3">
          {thread.slice().reverse().map((m) => {
            const mine = m.sender_id === profile?.id;
            return (
              <Card key={m.id} className={`max-w-3xl p-4 shadow-soft ${mine ? "ml-auto border-primary/25 bg-primary/5" : ""}`}>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">
                    {mine ? "You" : (m.senders?.full_name ?? "Care team")} → {m.receivers?.full_name ?? "You"}
                  </span>
                  <span>{formatDateTime(m.created_at)}</span>
                </div>
                {m.subject ? <p className="mt-2 text-sm font-medium">{m.subject}</p> : null}
                <p className="mt-1 whitespace-pre-line text-sm">{m.body}</p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ComposeDialog({ team }: { team: { id: string; full_name: string | null }[] }) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [receiverId, setReceiverId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverId || !body) return toast.error("Choose a recipient and write your message.");
    setBusy(true);
    const { error } = await supabase.from("messages").insert({
      sender_id: profile?.id,
      receiver_id: receiverId,
      subject: subject || null,
      body,
    });
    setBusy(false);
    if (error) return toast.error("Failed to send message.");
    toast.success("Message sent to your care team.");
    setOpen(false);
    setReceiverId("");
    setSubject("");
    setBody("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> New message</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Message your care team</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">To *</label>
            <select
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a team member</option>
              {team.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name ?? "Care team"}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Subject"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message *</label>
            <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy}><Send className="h-4 w-4" /> {busy ? "Sending…" : "Send"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
