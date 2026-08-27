import { useState } from "react";
import { toast } from "sonner";
import { Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/context/auth";
import { useClients } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/utils";

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const { data: clients = [] } = useClients();
  const client = clients.find((c) => c.profile_id === profile?.id);

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone: phone || null }).eq("id", profile.id);
    setBusy(false);
    if (error) return toast.error("Failed to save profile.");
    await refreshProfile();
    toast.success("Profile updated.");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="My Profile" description="Your personal details and care information." />
      <Card className="p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">{profile?.full_name}</h2>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>
        <form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Email</Label>
            <Input value={profile?.email ?? ""} disabled />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy}><Save className="h-4 w-4" /> {busy ? "Saving…" : "Save changes"}</Button>
          </div>
        </form>
      </Card>

      {client && (
        <Card className="p-6 shadow-soft">
          <h3 className="font-display text-lg font-semibold">Care record</h3>
          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div><p className="text-xs uppercase text-muted-foreground">Reference</p><p className="font-mono">{client.reference}</p></div>
            <div><p className="text-xs uppercase text-muted-foreground">Date of birth</p><p>{formatDate(client.date_of_birth)}</p></div>
            <div><p className="text-xs uppercase text-muted-foreground">Address</p><p>{client.address}</p></div>
            <div><p className="text-xs uppercase text-muted-foreground">GP</p><p>{client.gp_name ?? "—"}</p></div>
            <div><p className="text-xs uppercase text-muted-foreground">Medical conditions</p><p>{client.medical_conditions?.join(", ") ?? "—"}</p></div>
            <div><p className="text-xs uppercase text-muted-foreground">Allergies</p><p>{client.allergies?.join(", ") ?? "—"}</p></div>
          </div>
        </Card>
      )}
    </div>
  );
}
