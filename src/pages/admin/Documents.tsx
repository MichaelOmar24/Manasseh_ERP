import { useState } from "react";
import { toast } from "sonner";
import { Plus, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { useDocuments, useTableMutation, useClients, useStaff } from "@/lib/api";
import type { Document } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const categories = ["care_plan", "assessment", "invoice", "ciw_annual_return", "compliance", "hr", "medical"];

export default function DocumentsPage() {
  const { data: docs = [], isLoading } = useDocuments();

  const columns: Column<Document>[] = [
    { header: "Title", cell: (d) => (
      <span className="flex items-center gap-2 font-medium">
        <FileText className="h-4 w-4 text-primary" /> {d.title}
      </span>
    ) },
    { header: "Category", cell: (d) => <span className="capitalize text-muted-foreground">{(d.category ?? "—").replace(/_/g, " ")}</span> },
    { header: "Owner", cell: (d) => <span className="capitalize text-muted-foreground">{d.owner_type}</span> },
    { header: "File", cell: (d) => d.file_name ?? "—" },
    { header: "Added", cell: (d) => <span className="text-muted-foreground">{formatDate(d.created_at)}</span> },
    { header: "", cell: (d) => (
      d.file_url ? (
        <Button variant="ghost" size="sm" asChild>
          <a href={d.file_url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Open</a>
        </Button>
      ) : null
    ) },
  ];

  return (
    <div>
      <PageHeader
        title="Document Management"
        description="Central repository for care, finance, HR and compliance documents."
        action={<AddDocumentDialog />}
      />
      <DataTable columns={columns} rows={docs} loading={isLoading} keyOf={(d) => d.id} emptyTitle="No documents yet" />
    </div>
  );
}

function AddDocumentDialog() {
  const { data: clients = [] } = useClients();
  const { data: staff = [] } = useStaff();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", category: "care_plan", owner_type: "client", owner_id: "", file_name: "", file_url: "" });
  const { mutateAsync, isPending } = useTableMutation<Document>("documents");

  const owners = form.owner_type === "client" ? clients : staff;
  const ownerLabel = (o: { id: string; full_name?: string | null; profiles?: { full_name?: string | null } | null }) =>
    o.full_name ?? o.profiles?.full_name ?? "—";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return toast.error("Document title is required.");
    await mutateAsync({
      values: {
        title: form.title,
        category: form.category,
        owner_type: form.owner_type,
        owner_id: form.owner_id || null,
        file_name: form.file_name || null,
        file_url: form.file_url || null,
      },
    });
    toast.success("Document registered.");
    setOpen(false);
    setForm({ title: "", category: "care_plan", owner_type: "client", owner_id: "", file_name: "", file_url: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Add document</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Register a document</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Owner type</Label>
              <Select value={form.owner_type} onValueChange={(v) => setForm({ ...form, owner_type: v, owner_id: "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="client">Client</SelectItem><SelectItem value="staff">Staff</SelectItem><SelectItem value="organisation">Organisation</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          {form.owner_type !== "organisation" && (
            <div className="space-y-2"><Label>Owner</Label>
              <Select value={form.owner_id} onValueChange={(v) => setForm({ ...form, owner_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
                <SelectContent>{owners.map((o) => <SelectItem key={o.id} value={o.id}>{ownerLabel(o)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>File name</Label><Input value={form.file_name} onChange={(e) => setForm({ ...form, file_name: e.target.value })} placeholder="report.pdf" /></div>
            <div className="space-y-2"><Label>File URL</Label><Input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="https://…" /></div>
          </div>
          <DialogFooter><Button type="submit" disabled={isPending}>{isPending ? "Adding…" : "Add document"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
