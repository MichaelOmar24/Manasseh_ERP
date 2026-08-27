import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, HeartPulse, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth";
import { rolePortal } from "@/lib/navigation";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/types";

const demoAccounts = [
  { label: "Super Administrator", email: "superadmin@manasseh.care" },
  { label: "Director", email: "director@manasseh.care" },
  { label: "Care Manager", email: "caremanager@manasseh.care" },
  { label: "HR Manager", email: "hr@manasseh.care" },
  { label: "Finance Officer", email: "finance@manasseh.care" },
  { label: "Compliance Officer", email: "compliance@manasseh.care" },
  { label: "Caregiver", email: "caregiver1@manasseh.care" },
  { label: "Client", email: "client1@manasseh.care" },
];

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setBusy(true);
    const { error } = await signIn(email.trim(), password);
    if (error) {
      setBusy(false);
      toast.error(error === "Invalid login credentials" ? "Incorrect email or password." : error);
      return;
    }
    // Load profile to route to the right portal
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setBusy(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();
    setBusy(false);
    const p = profile as unknown as Profile | null;
    if (from?.startsWith("/portal")) {
      navigate(from, { replace: true });
    } else if (p?.role) {
      navigate(rolePortal(p.role), { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  const fillDemo = (em: string) => {
    setEmail(em);
    setPassword("Demo@1234");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="gradient-brand relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(50rem_30rem_at_20%_10%,hsl(0_0%_100%/0.18),transparent)]" />
        <Link to="/" className="relative inline-flex w-fit items-center rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
          <img src="/assets/manasseh-logo.png" alt="Manasseh Health Care" className="h-12 w-auto" />
        </Link>
        <div className="relative max-w-md">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure staff & client portal
          </p>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight">
            Your care, at your fingertips
          </h1>
          <p className="mt-4 leading-relaxed text-white/85">
            Clients can view schedules, care plans and invoices. Carers can manage visits
            and records. Our team runs the whole service from one secure platform.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-white/85">
            <HeartPulse className="h-5 w-5" /> Tender Love &amp; Care, every day.
          </div>
        </div>
        <p className="relative text-xs text-white/70">
          © {new Date().getFullYear()} Manasseh Health Care. Registered with the Care Inspectorate Wales.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex lg:hidden">
            <img src="/assets/manasseh-logo.png" alt="Manasseh Health Care" className="h-12 w-auto" />
          </Link>
          <Card className="p-8 shadow-soft">
            <h2 className="font-display text-2xl font-semibold tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back. Use your Manasseh account to continue.
            </p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@manasseh.care"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <span className="text-xs text-muted-foreground">Password: Demo@1234</span>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle password visibility"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" size="lg" disabled={busy} className="w-full">
                <LogIn className="h-4 w-4" />
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <Separator className="my-6" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Demo accounts
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Tap a role to fill its credentials (password Demo@1234).</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {demoAccounts.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => fillDemo(a.email)}
                  className="rounded-lg border bg-muted/40 px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent"
                >
                  <span className="block font-medium">{a.label}</span>
                  <span className="block truncate text-muted-foreground">{a.email}</span>
                </button>
              ))}
            </div>
          </Card>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Looking for care?{" "}
            <Link to="/book-appointment" className="font-medium text-primary hover:underline">
              Book an appointment
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
