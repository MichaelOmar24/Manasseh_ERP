import { useState } from "react";
import { toast } from "sonner";
import { Mail, MapPin, PhoneCall, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please complete your name, email and message.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      subject: form.subject || null,
      message: form.message,
      status: "new",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    toast.success("Thank you! Your message has been sent and we'll reply soon.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <div>
      <section className="gradient-subtle">
        <div className="container py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Contact us</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            We'd love to hear from you
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Questions about care, referrals, feedback or joining our team — get in touch
            and a real person will reply.
          </p>
        </div>
      </section>

      <section className="container grid gap-10 py-14 lg:grid-cols-5">
        <Card className="p-6 shadow-soft lg:col-span-3 lg:p-8">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={form.name} onChange={set("name")} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={set("phone")} placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={form.subject} onChange={set("subject")} placeholder="What's this about?" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea id="message" rows={5} value={form.message} onChange={set("message")} placeholder="How can we help?" />
            </div>
            <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
              <Send className="h-4 w-4" />
              {submitting ? "Sending…" : "Send message"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold">Head office</h3>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> 9 Kilvey Terrace, St Thomas, Swansea, SA1 8BA, Wales</p>
              <p className="flex items-center gap-2"><PhoneCall className="h-4 w-4 text-primary" /> <a href="tel:+447801480923" className="hover:text-foreground">+44 7801 480923</a></p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> <a href="mailto:info@manassehhealthcare.org" className="hover:text-foreground">info@manassehhealthcare.org</a></p>
              <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Mon–Fri, 9am–5pm</p>
            </div>
          </Card>
          <Card className="p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold">Feedback & complaints</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We take feedback seriously. You can also raise a concern directly with the
              Care Inspectorate Wales at ciw.gov.wales.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
