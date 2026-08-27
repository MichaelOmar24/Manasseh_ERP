import { toast } from "sonner";
import { MailOpen, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useContactMessages, useTableMutation } from "@/lib/api";
import type { ContactMessage } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function Enquiries() {
  const { data: messages = [], isLoading } = useContactMessages();
  const { mutateAsync } = useTableMutation<ContactMessage>("contact_messages");

  const markReplied = async (m: ContactMessage) => {
    await mutateAsync({ id: m.id, values: { status: "replied" } });
    toast.success("Marked as replied.");
  };

  const columns: Column<ContactMessage>[] = [
    { header: "Received", cell: (m) => <span className="text-muted-foreground">{formatDate(m.created_at)}</span> },
    { header: "Name", cell: (m) => (
      <div>
        <p className="font-medium">{m.name}</p>
        <a href={`mailto:${m.email}`} className="text-xs text-primary hover:underline">{m.email}</a>
      </div>
    ) },
    { header: "Subject", cell: (m) => m.subject ?? "—" },
    { header: "Message", cell: (m) => <span className="line-clamp-2 max-w-[300px] text-muted-foreground">{m.message}</span> },
    { header: "Status", cell: (m) => <StatusBadge status={m.status} /> },
    { header: "Actions", cell: (m) => (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" asChild>
          <a
            href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject ?? "Your enquiry"))}`}
            title="Reply by email"
          >
            <Send className="h-4 w-4" /> Reply
          </a>
        </Button>
        {m.status === "new" ? (
          <Button size="sm" variant="ghost" onClick={() => markReplied(m)}>
            <MailOpen className="h-4 w-4" /> Mark replied
          </Button>
        ) : null}
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader
        title="Enquiries"
        description="Messages submitted through the public contact form."
        action={
          <Button variant="outline" asChild>
            <a href="mailto:info@manassehhealthcare.org">
              <Mail className="h-4 w-4" /> Email info@manassehhealthcare.org
            </a>
          </Button>
        }
      />
      <DataTable columns={columns} rows={messages} loading={isLoading} keyOf={(m) => m.id} emptyTitle="No enquiries yet" />
    </div>
  );
}
