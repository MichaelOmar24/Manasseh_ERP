import { Building2, HeartPulse, ShieldCheck, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";

export default function Settings() {
  return (
    <div>
      <PageHeader title="Settings" description="Organisation settings and platform configuration." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">Manasseh Health Care</h2>
              <p className="text-sm text-muted-foreground">Domiciliary Care Agency</p>
            </div>
          </div>
          <div className="mt-5 space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> 9 Kilvey Terrace, St Thomas, Swansea, SA1 8BA</p>
            <p className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-primary" /> info@manassehhealthcare.org · +44 7801 480923</p>
            <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Registered with the Care Inspectorate Wales</p>
          </div>
        </Card>
        <Card className="p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold">Platform</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span>Version</span><span className="font-mono text-xs">1.0.0</span>
            </li>
            <li className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span>Authentication</span><span>Email + password</span>
            </li>
            <li className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span>Security</span><span>Row-level access control</span>
            </li>
            <li className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span>Demo accounts</span><span>Password: Demo@1234</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
