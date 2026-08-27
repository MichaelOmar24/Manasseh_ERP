import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { PhoneCall, Mail, MapPin, Phone, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export default function RequestCallback() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", location: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.location) {
      toast.error("Please enter your email address and location.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name || null,
      email: form.email,
      phone: form.phone || null,
      subject: "Callback request",
      message: `Callback requested from ${form.location}`,
      status: "new",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setDone(true);
    toast.success("Request received! We'll be in touch shortly.");
  };

  if (done) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <Card className="w-full max-w-md p-10 text-center shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">Request received</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you. Our team has your details and will call or email you back shortly.
          </p>
          <Button asChild className="mt-6">
            <Link to="/services/cleaning">Back to cleaning services</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="gradient-subtle">
      <div className="container grid min-h-[80vh] items-center gap-10 py-14 lg:grid-cols-2">
        {/* Left: intro */}
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground">
            <Link to="/services/cleaning">
              <ArrowLeft className="h-4 w-4" /> Back to cleaning services
            </Link>
          </Button>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PhoneCall className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Manasseh Clean</p>
              <h1 className="font-display text-4xl font-semibold tracking-tight">Request a call back</h1>
            </div>
          </div>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
            Leave your email and location and a member of our team will get in touch to
            discuss your cleaning needs. No forms, no fuss — we'll call you.
          </p>
          <div className="mt-8 space-y-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> <a href="tel:+447801480923" className="hover:text-foreground">+44 7801 480923</a></p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> <a href="mailto:info@manassehhealthcare.org" className="hover:text-foreground">info@manassehhealthcare.org</a></p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Swansea &amp; South Wales</p>
          </div>
        </div>

        {/* Right: simple form */}
        <Card className="p-8 shadow-soft">
          <h2 className="font-display text-xl font-semibold">We'll call you back</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fields marked * are required. Takes under a minute.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="r-email">Email address *</Label>
              <Input id="r-email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-location">Location address *</Label>
              <Input id="r-location" value={form.location} onChange={set("location")} placeholder="Town, street or postcode" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="r-name">Name (optional)</Label>
                <Input id="r-name" value={form.name} onChange={set("name")} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-phone">Phone (optional)</Label>
                <Input id="r-phone" value={form.phone} onChange={set("phone")} placeholder="If you'd prefer a call" />
              </div>
            </div>
            <Button type="submit" size="lg" disabled={submitting} className="w-full">
              <PhoneCall className="h-4 w-4" />
              {submitting ? "Sending…" : "Request a call back"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
