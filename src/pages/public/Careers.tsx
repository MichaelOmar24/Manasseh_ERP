import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Clock, BadgePoundSterling, Send, GraduationCap, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useJobPostings } from "@/lib/api";
import type { JobPosting } from "@/lib/types";

export default function Careers() {
  const { data: postings = [], isLoading } = useJobPostings();
  const open = postings.filter((p) => p.status === "open");
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", cover_letter: "", cv_url: "" });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !form.full_name || !form.email) {
      toast.error("Please choose a role and complete your name and email.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("job_applications").insert({
      job_posting_id: selectedJob,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      cover_letter: form.cover_letter || null,
      cv_url: form.cv_url || null,
      status: "new",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    toast.success("Application received! Our recruitment team will be in touch.");
    setForm({ full_name: "", email: "", phone: "", cover_letter: "", cv_url: "" });
    setSelectedJob("");
  };

  return (
    <div>
      <section className="gradient-subtle">
        <div className="container py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Join us</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Build a career in care
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            We're always looking for kind, reliable people to join our care team. No
            experience? We'll train you. Ready to make a difference? Apply today.
          </p>
        </div>
      </section>

      <section className="container py-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/15 bg-primary/5 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">Questions about joining?</h2>
              <p className="text-sm text-muted-foreground">Our team is happy to talk you through the process.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> <a href="tel:+447801480923" className="hover:text-foreground">+44 7801 480923</a></p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> <a href="mailto:info@manassehhealthcare.org" className="hover:text-foreground">info@manassehhealthcare.org</a></p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> 9 Kilvey Terrace, Swansea SA1 8BA</p>
          </div>
        </div>

        <h2 className="font-display text-2xl font-semibold tracking-tight">Current vacancies</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <p className="text-muted-foreground">Loading vacancies…</p>
          ) : open.length === 0 ? (
            <p className="text-muted-foreground">No open roles right now — please check back soon.</p>
          ) : (
            open.map((job: JobPosting) => (
              <Card key={job.id} className="flex flex-col p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
                <h3 className="font-display text-xl font-semibold">{job.title}</h3>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {job.location}</p>
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {job.employment_type}</p>
                  <p className="flex items-center gap-2"><BadgePoundSterling className="h-4 w-4 text-primary" /> {job.salary_range}</p>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{job.description}</p>
                <Button className="mt-4" variant="outline" onClick={() => setSelectedJob(job.id)}>
                  Apply for this role
                </Button>
              </Card>
            ))
          )}
        </div>
      </section>

      <section className="container pb-16 lg:pb-20">
        <Card className="p-6 shadow-soft lg:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">Application form</h2>
              <p className="text-sm text-muted-foreground">Takes about 5 minutes. We reply to every applicant.</p>
            </div>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger id="role"><SelectValue placeholder="Select a role" /></SelectTrigger>
                  <SelectContent>
                    {open.map((job) => (
                      <SelectItem key={job.id} value={job.id}>{job.title} — {job.location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fname">Full name *</Label>
                <Input id="fname" value={form.full_name} onChange={set("full_name")} placeholder="Your full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="femail">Email *</Label>
                <Input id="femail" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fphone">Phone</Label>
                <Input id="fphone" value={form.phone} onChange={set("phone")} placeholder="Optional" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="cv">CV / portfolio link (optional)</Label>
                <Input id="cv" value={form.cv_url} onChange={set("cv_url")} placeholder="https://…" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover">Why would you be a great fit?</Label>
              <Textarea id="cover" rows={5} value={form.cover_letter} onChange={set("cover_letter")} placeholder="Tell us about your experience, values and availability." />
            </div>
            <Button type="submit" size="lg" disabled={submitting}>
              <Send className="h-4 w-4" />
              {submitting ? "Submitting…" : "Submit application"}
            </Button>
          </form>
        </Card>
      </section>
    </div>
  );
}
