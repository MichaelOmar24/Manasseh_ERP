import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useClients, useProfiles } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import type { Client } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function Clients() {
  const { data: clients = [], isLoading } = useClients();
  const { data: profiles = [] } = useProfiles();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const careManagers = profiles.filter((p) => p.role === "care_manager" || p.role === "super_admin");

  const filtered = useMemo(
    () =>
      clients.filter((c) => {
        const matchQ = !q || (c.full_name ?? "").toLowerCase().includes(q.toLowerCase()) || c.reference.toLowerCase().includes(q.toLowerCase());
        const matchStatus = status === "all" || c.status === status;
        return matchQ && matchStatus;
      }),
    [clients, q, status],
  );

  const columns: Column<Client>[] = [
    { header: "Reference", cell: (c) => <span className="font-mono text-xs font-medium">{c.reference}</span> },
    { header: "Client", cell: (c) => (
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {(c.full_name ?? "?").split(" ").map((x) => x[0]).slice(0, 2).join("")}
        </div>
        <span className="font-medium">{c.full_name}</span>
      </div>
    ) },
    { header: "DOB", cell: (c) => <span className="text-muted-foreground">{formatDate(c.date_of_birth)}</span> },
    { header: "Address", cell: (c) => <span className="text-muted-foreground">{c.address}</span> },
    { header: "Funding", cell: (c) => <span className="capitalize text-muted-foreground">{(c.funding_source ?? "—").replace(/_/g, " ")}</span> },
    { header: "Status", cell: (c) => <StatusBadge status={c.status} /> },
    { header: "", cell: (c) => (
      <Button variant="outline" size="sm" onClick={() => navigate(`/portal/admin/clients/${c.id}`)}>
        <UserRound className="h-4 w-4" /> View
      </Button>
    ) },
  ];

  return (
    <div>
      <PageHeader
        title="Client Management"
        description="CRM records for every client receiving care."
        action={<AddClientDialog careManagers={careManagers} />}
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or reference…" className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="discharged">Discharged</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} rows={filtered} loading={isLoading} keyOf={(c) => c.id} emptyTitle="No clients found" />
    </div>
  );
}

function AddClientDialog({ careManagers }: { careManagers: { id: string; full_name: string | null }[] }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    reference: "",
    date_of_birth: "",
    gender: "",
    address: "",
    postcode: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    funding_source: "self_funded",
    care_manager_id: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.reference) {
      toast.error("Please provide a client name and reference.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("clients").insert({
      full_name: form.full_name,
      reference: form.reference,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender || null,
      address: form.address || null,
      postcode: form.postcode || null,
      emergency_contact_name: form.emergency_contact_name || null,
      emergency_contact_phone: form.emergency_contact_phone || null,
      funding_source: form.funding_source,
      care_manager_id: form.care_manager_id || null,
      status: "active",
    });
    setBusy(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "That reference already exists." : "Failed to create client.");
      return;
    }
    toast.success("Client created.");
    setOpen(false);
    setForm({ full_name: "", reference: "", date_of_birth: "", gender: "", address: "", postcode: "", emergency_contact_name: "", emergency_contact_phone: "", funding_source: "self_funded", care_manager_id: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Add client</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a new client</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Full name *</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Client's full name" />
          </div>
          <div className="space-y-2">
            <Label>Reference *</Label>
            <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="MH-0009" />
          </div>
          <div className="space-y-2">
            <Label>Date of birth</Label>
            <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Funding source</Label>
            <Select value={form.funding_source} onValueChange={(v) => setForm({ ...form, funding_source: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="self_funded">Self funded</SelectItem>
                <SelectItem value="local_authority">Local authority</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, town" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Emergency contact</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input value={form.emergency_contact_name} onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })} placeholder="Name" />
              <Input value={form.emergency_contact_phone} onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })} placeholder="Phone" />
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Care manager</Label>
            <Select value={form.care_manager_id} onValueChange={(v) => setForm({ ...form, care_manager_id: v })}>
              <SelectTrigger><SelectValue placeholder="Assign a care manager" /></SelectTrigger>
              <SelectContent>
                {careManagers.map((cm) => (
                  <SelectItem key={cm.id} value={cm.id}>{cm.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" disabled={busy}>{busy ? "Creating…" : "Create client"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
