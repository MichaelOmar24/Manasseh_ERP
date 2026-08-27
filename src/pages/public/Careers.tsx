import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  MapPin,
  Send,
  GraduationCap,
  Phone,
  Mail,
  FileUp,
  FileText,
  UploadCloud,
  CheckCircle2,
  Trash2,
  User,
  Car,
  BookOpen,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { uploadCv } from "@/lib/upload";

const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];
const maritalOptions = ["Single", "Married", "Divorced", "Widowed"];
const yesNoOptions = ["Yes", "No"];
const qualificationOptions = [
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate",
  "Other",
];

type FormState = {
  full_name: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  nationality: string;
  right_to_work_sharecode: string;
  requires_sponsorship: string;
  dbs_number: string;
  social_care_wales_number: string;
  email: string;
  phone: string;
  address: string;
  has_uk_driving_license: string;
  owns_car: string;
  highest_qualification: string;
  job_position: string;
  current_employment: string;
  previous_employment: string;
  care_training: string;
};

const initialForm: FormState = {
  full_name: "",
  date_of_birth: "",
  gender: "",
  marital_status: "",
  nationality: "",
  right_to_work_sharecode: "",
  requires_sponsorship: "",
  dbs_number: "",
  social_care_wales_number: "",
  email: "",
  phone: "",
  address: "",
  has_uk_driving_license: "",
  owns_car: "",
  highest_qualification: "",
  job_position: "",
  current_employment: "",
  previous_employment: "",
  care_training: "",
};

export default function Careers() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const pickCv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 10 MB.");
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["pdf", "doc", "docx"].includes(ext)) {
      toast.error("Unsupported file type. Please upload a PDF or Word document (PDF, DOC, DOCX).");
      return;
    }
    setCvFile(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone || !form.date_of_birth || !form.address || !form.job_position) {
      toast.error("Please complete the required fields: full name, email, phone, date of birth, address and job position.");
      return;
    }
    if (!cvFile) {
      toast.error("Please upload your CV (PDF or Word document).");
      return;
    }

    setSubmitting(true);
    try {
      let cvPath: string | null = null;
      if (cvFile) {
        setUploading(true);
        cvPath = await uploadCv(cvFile);
        setUploading(false);
      }

      const { error } = await supabase.from("job_applications").insert({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        marital_status: form.marital_status || null,
        nationality: form.nationality || null,
        right_to_work_sharecode: form.right_to_work_sharecode || null,
        requires_sponsorship: form.requires_sponsorship || null,
        dbs_number: form.dbs_number || null,
        social_care_wales_number: form.social_care_wales_number || null,
        address: form.address || null,
        has_uk_driving_license: form.has_uk_driving_license || null,
        owns_car: form.owns_car || null,
        highest_qualification: form.highest_qualification || null,
        job_position: form.job_position,
        current_employment: form.current_employment || null,
        previous_employment: form.previous_employment || null,
        care_training: form.care_training || null,
        cv_url: cvPath,
        status: "new",
      });
      if (error) {
        toast.error("Something went wrong. Please try again.");
        return;
      }
      setDone(true);
      toast.success("Application received! Our recruitment team will be in touch.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <Card className="w-full max-w-md p-10 text-center shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">Application submitted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you for applying to join Manasseh Healthcare. Our recruitment team will
            review your application and be in touch.
          </p>
          <Button asChild className="mt-6">
            <a href="tel:+447801480923">Call us: +44 7801 480923</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <section className="gradient-subtle">
        <div className="container py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Join us</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Job Application Form
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Please complete this form to apply for the job position. Ensure all information
            provided is accurate and up to date.
          </p>
        </div>
      </section>

      <section className="container py-12">
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

        <Card className="p-6 shadow-soft lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">Application form</h2>
                <p className="text-sm text-muted-foreground">Fields marked * are required.</p>
              </div>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              When you submit this form, it will not automatically collect your details like name and email address unless you provide them yourself.
            </span>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-10">
            {/* Personal details */}
            <section>
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <User className="h-5 w-5 text-primary" /> Personal details
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="a-full_name">1. Full name *</Label>
                  <Input id="a-full_name" value={form.full_name} onChange={set("full_name")} placeholder="Your full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="a-dob">2. Date of birth *</Label>
                  <Input id="a-dob" type="date" value={form.date_of_birth} onChange={set("date_of_birth")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="a-gender">3. Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}>
                    <SelectTrigger id="a-gender"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="a-marital">4. Marital status</Label>
                  <Select value={form.marital_status} onValueChange={(v) => setForm((f) => ({ ...f, marital_status: v }))}>
                    <SelectTrigger id="a-marital"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {maritalOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="a-nat">5. Nationality</Label>
                  <Input id="a-nat" value={form.nationality} onChange={set("nationality")} placeholder="e.g. British" />
                </div>
              </div>
            </section>

            {/* Right to work */}
            <section>
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <ShieldCheck className="h-5 w-5 text-primary" /> Right to work
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="a-share">6. Right to work share code</Label>
                  <Input id="a-share" value={form.right_to_work_sharecode} onChange={set("right_to_work_sharecode")} placeholder="Share code" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="a-sponsor">7. Do you require sponsorship or switch?</Label>
                  <Select value={form.requires_sponsorship} onValueChange={(v) => setForm((f) => ({ ...f, requires_sponsorship: v }))}>
                    <SelectTrigger id="a-sponsor"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {yesNoOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="a-dbs">8. DBS number</Label>
                  <Input id="a-dbs" value={form.dbs_number} onChange={set("dbs_number")} placeholder="If applicable" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="a-scw">9. Social Care Wales number</Label>
                  <Input id="a-scw" value={form.social_care_wales_number} onChange={set("social_care_wales_number")} placeholder="If registered" />
                </div>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Briefcase className="h-5 w-5 text-primary" /> Contact details
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="a-email">10. Email address *</Label>
                  <Input id="a-email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="a-phone">11. Phone number *</Label>
                  <Input id="a-phone" value={form.phone} onChange={set("phone")} placeholder="Mobile or landline" />
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="a-address">12. House address (incl. post code) *</Label>
                  <Input id="a-address" value={form.address} onChange={set("address")} placeholder="Street, town, post code" />
                </div>
              </div>
            </section>

            {/* Driving & education */}
            <section>
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Car className="h-5 w-5 text-primary" /> Driving &amp; education
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="a-license">13. Valid UK driver's licence?</Label>
                  <Select value={form.has_uk_driving_license} onValueChange={(v) => setForm((f) => ({ ...f, has_uk_driving_license: v }))}>
                    <SelectTrigger id="a-license"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {yesNoOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="a-car">14. Do you own your own car?</Label>
                  <Select value={form.owns_car} onValueChange={(v) => setForm((f) => ({ ...f, owns_car: v }))}>
                    <SelectTrigger id="a-car"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {yesNoOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="a-qual">15. Highest educational qualification</Label>
                  <Select value={form.highest_qualification} onValueChange={(v) => setForm((f) => ({ ...f, highest_qualification: v }))}>
                    <SelectTrigger id="a-qual"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {qualificationOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Role & experience */}
            <section>
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Briefcase className="h-5 w-5 text-primary" /> Role &amp; experience
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="a-job">16. Job position applied for *</Label>
                  <Input id="a-job" value={form.job_position} onChange={set("job_position")} placeholder="e.g. Care Worker" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="a-current">17. Current employment &amp; address of employer</Label>
                  <Input id="a-current" value={form.current_employment} onChange={set("current_employment")} placeholder="Role, company, address" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="a-previous">18. Previous employment &amp; address of employer</Label>
                  <Input id="a-previous" value={form.previous_employment} onChange={set("previous_employment")} placeholder="Role, company, address" />
                </div>
              </div>
            </section>

            {/* CV & training */}
            <section>
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <FileUp className="h-5 w-5 text-primary" /> CV &amp; training
              </h3>
              <div className="mt-4 grid gap-6 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="a-cv">19. Upload your CV *</Label>
                  <input
                    ref={fileInputRef}
                    id="a-cv"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={pickCv}
                    className="hidden"
                  />
                  {!cvFile ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-muted/30 px-6 py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
                    >
                      <UploadCloud className="h-8 w-8 text-primary" />
                      <span className="text-sm font-medium">Click to choose your CV</span>
                      <span className="text-xs text-muted-foreground">PDF, DOC or DOCX · max 10 MB</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-primary/30 bg-primary/5 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <FileText className="h-5 w-5 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{cvFile.name}</p>
                          <p className="text-xs text-muted-foreground">{(cvFile.size / 1024).toFixed(0)} KB</p>
                        </div>
                      </div>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setCvFile(null)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Alternatively, email your CV to{" "}
                    <a href="mailto:hr@manassehhealthcare.org" className="font-medium text-primary underline">
                      hr@manassehhealthcare.org
                    </a>{" "}
                    and note "ATTACHED" here.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="a-training">20. List all care training</Label>
                  <Textarea
                    id="a-training"
                    rows={7}
                    value={form.care_training}
                    onChange={set("care_training")}
                    placeholder="Please list all training undertaken in Health and Social Care in your previous employment."
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-col items-center gap-3 border-t pt-8 sm:flex-row sm:justify-between">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <BookOpen className="h-4 w-4 text-primary" />
                By submitting, you agree to Manasseh Healthcare processing your application data for recruitment purposes.
              </p>
              <Button type="submit" size="lg" disabled={submitting || uploading} className="w-full sm:w-auto">
                <Send className="h-4 w-4" />
                {uploading ? "Uploading CV…" : submitting ? "Submitting…" : "Submit application"}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}
