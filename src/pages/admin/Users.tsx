import { useState } from "react";
import { toast } from "sonner";
import { Plus, UserPlus } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useProfiles } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { ALL_ROLES, ROLE_LABELS, type Profile, type Role } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function Users() {
  const { data: profiles = [], isLoading } = useProfiles();

  const columns: Column<Profile>[] = [
    { header: "Name", cell: (p) => <span className="font-medium">{p.full_name ?? "—"}</span> },
    { header: "Email", cell: (p) => <span className="text-muted-foreground">{p.email}</span> },
    { header: "Role", cell: (p) => (
      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">{ROLE_LABELS[p.role]}</Badge>
    ) },
    { header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
    { header: "Member since", cell: (p) => <span className="text-muted-foreground">{formatDate(p.created_at)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Provision accounts and manage everyone with access to the platform."
        action={<CreateUserDialog />}
      />
      <DataTable columns={columns} rows={profiles} loading={isLoading} keyOf={(p) => p.id} emptyTitle="No users yet" />
    </div>
  );
}

function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "Demo@1234", role: "client" as Role });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || form.password.length < 8) {
      toast.error("Please complete name, email and a password of at least 8 characters.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("create-user", {
      body: {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
      },
    });
    setBusy(false);
    if (error || !data?.ok) {
      toast.error(data?.error ?? "Failed to create user.");
      return;
    }
    toast.success(`User created. They can sign in with ${data.email}.`);
    setOpen(false);
    setForm({ full_name: "", email: "", password: "Demo@1234", role: "client" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Create user</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new user</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Full name *</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="e.g. Jane Carer" />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@manasseh.care" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Temporary password *</Label>
              <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy} className="w-full sm:w-auto">
              <UserPlus className="h-4 w-4" /> {busy ? "Creating…" : "Create account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
