import { useState } from "react";
import { toast } from "sonner";
import { Plus, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { useMessages, useProfiles } from "@/lib/api";
import { useAuth } from "@/context/auth";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function Messages() {
  const { data: messages = [], isLoading } = useMessages();
  const { profile } = useAuth();

  const visible = messages.filter(
    (m) => m.sender_id === profile?.id || m.receiver_id === profile?.id || (m.client_id != null && m.receivers?.id === profile?.id),
  );

  const columns: Column<Message>[] = [
    { header: "Date", cell: (m) => <span className="text-muted-foreground">{formatDateTime(m.created_at)}</span> },
    { header: "From", cell: (m) => m.senders?.full_name ?? "—" },
    { header: "To", cell: (m) => m.receivers?.full_name ?? "—" },
    { header: "Subject", cell: (m) => <span className="font-medium">{m.subject ?? "(no subject)"}</span> },
    { header: "Message", cell: (m) => <span className="line-clamp-1 max-w-[280px] text-muted-foreground">{m.body}</span> },
    { header: "Status", cell: (m) => <span className="text-xs text-muted-foreground">{m.read_at ? "Read" : "Unread"}</span> },
  ];

  return (
    <div>
      <PageHeader title="Messages" description="Internal communication across the care team." action={<ComposeDialog />} />
      <DataTable columns={columns} rows={visible} loading={isLoading} keyOf={(m) => m.id} emptyTitle="No messages" />
    </div>
  );
}

function ComposeDialog() {
  const { profile } = useAuth();
  const { data: profiles = [] } = useProfiles();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ receiver_id: "", subject: "", body: "" });
  const [busy, setBusy] = useState(false);

  const recipients = profiles.filter((p) => p.id !== profile?.id);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.receiver_id || !form.body) return toast.error("Choose a recipient and write a message.");
    setBusy(true);
    const { error } = await supabase.from("messages").insert({
      sender_id: profile?.id,
      receiver_id: form.receiver_id,
      subject: form.subject || null,
      body: form.body,
    });
    setBusy(false);
    if (error) return toast.error("Failed to send message.");
    toast.success("Message sent.");
    setOpen(false);
    setForm({ receiver_id: "", subject: "", body: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Compose</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New message</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2"><Label>Recipient *</Label>
            <Select value={form.receiver_id} onValueChange={(v) => setForm({ ...form, receiver_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger>
              <SelectContent>{recipients.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name ?? p.email}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div className="space-y-2"><Label>Message *</Label><Textarea rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
          <DialogFooter><Button type="submit" disabled={busy}><Send className="h-4 w-4" /> {busy ? "Sending…" : "Send"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
