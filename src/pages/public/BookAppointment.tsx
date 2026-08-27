import { useState } from "react";
import { toast } from "sonner";
import { CalendarCheck, PhoneCall, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const timeSlots = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
];

export default function BookAppointment() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    appointment_type: "initial_assessment",
    requested_date: "",
    time_slot: "",
    preferred_contact_method: "phone",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.requested_date || !form.time_slot) {
      toast.error("Please complete your name, email, preferred date and time.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("appointments").insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      appointment_type: form.appointment_type,
      requested_date: form.requested_date,
      time_slot: form.time_slot,
      preferred_contact_method: form.preferred_contact_method,
      notes: form.notes || null,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    toast.success("Appointment request received! Our team will be in touch shortly.");
    setForm({
      name: "",
      email: "",
      phone: "",
      appointment_type: "initial_assessment",
      requested_date: "",
      time_slot: "",
      preferred_contact_method: "phone",
      notes: "",
    });
  };

  return (
    <div>
      <section className="gradient-subtle">
        <div className="container py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Book an appointment</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Arrange a free care assessment
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Tell us when suits you and a member of our care team will call to confirm your
            appointment. All assessments are free and without obligation.
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
                <Label htmlFor="type">Appointment type</Label>
                <Select value={form.appointment_type} onValueChange={(v) => setForm((f) => ({ ...f, appointment_type: v }))}>
                  <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial_assessment">Initial care assessment</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="care_review">Care review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Preferred date *</Label>
                <Input id="date" type="date" value={form.requested_date} onChange={set("requested_date")} min={new Date().toISOString().slice(0, 10)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slot">Preferred time *</Label>
                <Select value={form.time_slot} onValueChange={(v) => setForm((f) => ({ ...f, time_slot: v }))}>
                  <SelectTrigger id="slot"><SelectValue placeholder="Select a time slot" /></SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Preferred contact method</Label>
                <Select value={form.preferred_contact_method} onValueChange={(v) => setForm((f) => ({ ...f, preferred_contact_method: v }))}>
                  <SelectTrigger id="contact"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Tell us about your needs</Label>
              <Textarea id="notes" rows={4} value={form.notes} onChange={set("notes")} placeholder="A few details about the care you're looking for…" />
            </div>
            <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
              <CalendarCheck className="h-4 w-4" />
              {submitting ? "Sending…" : "Request appointment"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold">Prefer to talk?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Our friendly care coordinators are available Monday to Friday, 9am–5pm.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2"><PhoneCall className="h-4 w-4 text-primary" /> 029 2074 0000</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> info@manasseh.care</p>
            </div>
          </Card>
          <Card className="p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold">What happens next?</h3>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>We call to confirm your appointment.</li>
              <li>A care manager visits you at home for a free assessment.</li>
              <li>Together we build a personalised care plan.</li>
              <li>Your matched care team starts when you're ready.</li>
            </ol>
          </Card>
        </div>
      </section>
    </div>
  );
}
