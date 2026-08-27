import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { useAuth } from "@/context/auth";
import { useDocuments, useClients } from "@/lib/api";
import type { Document } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function Documents() {
  const { profile } = useAuth();
  const { data: docs = [], isLoading } = useDocuments();
  const { data: clients = [] } = useClients();
  const myClient = clients.find((c) => c.profile_id === profile?.id);

  const myDocs = docs.filter((d) => d.owner_type === "client" && d.owner_id === myClient?.id);

  const columns: Column<Document>[] = [
    { header: "Title", cell: (d) => (
      <span className="flex items-center gap-2 font-medium"><FileText className="h-4 w-4 text-primary" /> {d.title}</span>
    ) },
    { header: "Category", cell: (d) => <span className="capitalize text-muted-foreground">{(d.category ?? "—").replace(/_/g, " ")}</span> },
    { header: "File", cell: (d) => d.file_name ?? "—" },
    { header: "Added", cell: (d) => <span className="text-muted-foreground">{formatDate(d.created_at)}</span> },
    { header: "", cell: (d) => (
      d.file_url ? (
        <Button variant="outline" size="sm" asChild>
          <a href={d.file_url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Open</a>
        </Button>
      ) : null
    ) },
  ];

  return (
    <div>
      <PageHeader title="My Documents" description="Care plans, assessments and letters for you." />
      {myClient ? (
        <DataTable columns={columns} rows={myDocs} loading={isLoading} keyOf={(d) => d.id} emptyTitle="No documents yet" />
      ) : (
        <Card className="p-6 text-sm text-muted-foreground">No documents available.</Card>
      )}
    </div>
  );
}
