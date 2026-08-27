import { useState } from "react";
import { toast } from "sonner";
import { HandHeart, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function BookStaff() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "Personal care",
    start_date: "",
    duration: "1 week",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.start_date) {
      toast.error("Please complete your name, email and start date.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("appointments").insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      appointment_type: "staff_booking",
      requested_date: form.start_date,
      time_slot: form.duration,
      notes: `${form.service}. ${form.notes ?? ""}`.trim(),
      preferred_contact_method: "phone",
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    toast.success("Your staff request has been received. Our team will contact you within one working day.");
    setForm({ name: "", email: "", phone: "", service: "Personal care", start_date: "", duration: "1 week", notes: "" });
  };

  return (
    <div>
      <section className="gradient-subtle">
        <div className="container py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Book our staff</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Request a carer for you or your loved one
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Whether you need a regular carer, a short-term booking or a live-in placement,
            tell us what you need and we'll match you with the right person.
          </p>
        </div>
      </section>

      <section className="container grid gap-10 py-14 lg:grid-cols-5">
        <Card className="p-6 shadow-soft lg:col-span-3 lg:p-8">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name *</Label>
                <Input id="name" value={form.name} onChange={set("name")} placeholder="Your full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={set("phone")} placeholder="Mobile or landline" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Service needed</Label>
                <Select value={form.service} onValueChange={(v) => setForm((f) => ({ ...f, service: v }))}>
                  <SelectTrigger id="service"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Personal care">Personal care</SelectItem>
                    <SelectItem value="Live-in care">Live-in care</SelectItem>
                    <SelectItem value="Companionship">Companionship</SelectItem>
                    <SelectItem value="Dementia support">Dementia support</SelectItem>
                    <SelectItem value="Overnight / respite">Overnight / respite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start">Start date *</Label>
                <Input id="start" type="date" value={form.start_date} onChange={set("start_date")} min={new Date().toISOString().slice(0, 10)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">How long?</Label>
                <Select value={form.duration} onValueChange={(v) => setForm((f) => ({ ...f, duration: v }))}>
                  <SelectTrigger id="duration"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 week">Up to 1 week</SelectItem>
                    <SelectItem value="2 weeks">1–2 weeks</SelectItem>
                    <SelectItem value="1 month">2 weeks – 1 month</SelectItem>
                    <SelectItem value="ongoing">Ongoing / indefinite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Anything we should know?</Label>
              <Textarea id="notes" rows={4} value={form.notes} onChange={set("notes")} placeholder="Mobility, medications, preferences, etc." />
            </div>
            <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
              <HandHeart className="h-4 w-4" />
              {submitting ? "Sending…" : "Submit staff request"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold">How it works</h3>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Send us your request — it takes 2 minutes.</li>
              <li>A care coordinator calls to discuss your needs.</li>
              <li>We introduce you to a matched, DBS-checked carer.</li>
              <li>Care starts on your chosen date.</li>
            </ol>
          </Card>
          <Card className="p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold">Urgent help?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              For same-week bookings, call our office directly and we'll do our best to help.
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm font-medium">
              <PhoneCall className="h-4 w-4 text-primary" /> 029 2074 0000
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
