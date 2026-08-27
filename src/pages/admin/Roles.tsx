import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { useProfiles } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { ALL_ROLES, ROLE_LABELS, type Profile, type Role } from "@/lib/types";

export default function Roles() {
  const { data: profiles = [], isLoading } = useProfiles();

  const columns: Column<Profile>[] = [
    { header: "Name", cell: (p) => <span className="font-medium">{p.full_name ?? "—"}</span> },
    { header: "Email", cell: (p) => <span className="text-muted-foreground">{p.email}</span> },
    { header: "Current role", cell: (p) => <span>{ROLE_LABELS[p.role]}</span> },
    { header: "Reassign", cell: (p) => <RoleSelect profile={p} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Assign roles that control access to each ERP module. Changes take effect immediately."
      />
      <Card className="p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h3 className="font-display font-semibold">Role access summary</h3>
        </div>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {ALL_ROLES.map((r) => (
            <div key={r} className="rounded-lg border bg-muted/30 px-3 py-2">
              <p className="font-medium">{ROLE_LABELS[r]}</p>
              <p className="text-xs text-muted-foreground">
                {r === "super_admin" && "Full access to all modules and settings"}
                {r === "director" && "Analytics, reports and read access"}
                {r === "care_manager" && "Clients, care plans, scheduling, visits"}
                {r === "caregiver" && "Own visits, clients and incident reporting"}
                {r === "client" && "Personal care information and communication"}
                {r === "hr_manager" && "Recruitment, staff records and training"}
                {r === "finance_officer" && "Invoices, payments and reports"}
                {r === "compliance_officer" && "Audits, certificates and regulatory tracking"}
              </p>
            </div>
          ))}
        </div>
      </Card>
      <DataTable columns={columns} rows={profiles} loading={isLoading} keyOf={(p) => p.id} emptyTitle="No users" />
    </div>
  );
}

function RoleSelect({ profile }: { profile: Profile }) {
  const [value, setValue] = useState<Role>(profile.role);
  const [busy, setBusy] = useState(false);
  const changed = value !== profile.role;

  const save = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("update-user-role", {
      body: { user_id: profile.id, role: value },
    });
    setBusy(false);
    if (error || !data?.ok) {
      toast.error(data?.error ?? "Failed to update role.");
      setValue(profile.role);
      return;
    }
    toast.success(`Role updated to ${ROLE_LABELS[value]}.`);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={(v) => setValue(v as Role)} disabled={profile.role === "super_admin"}>
        <SelectTrigger className="h-8 w-44"><SelectValue /></SelectTrigger>
        <SelectContent>
          {ALL_ROLES.map((r) => (
            <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {changed ? (
        <Button size="sm" onClick={save} disabled={busy}>
          <Save className="h-3.5 w-3.5" /> {busy ? "Saving…" : "Save"}
        </Button>
      ) : null}
    </div>
  );
}
