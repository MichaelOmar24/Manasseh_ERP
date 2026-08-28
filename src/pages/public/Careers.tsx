import { useRef, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
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
  ClipboardList,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { uploadCv } from "@/lib/upload";
import { cn } from "@/lib/utils";

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

const steps = [
  { title: "Personal details", icon: User, blurb: "About you" },
  { title: "Right to work", icon: ShieldCheck, blurb: "Visa & registrations" },
  { title: "Contact details", icon: Briefcase, blurb: "How to reach you" },
  { title: "Driving & education", icon: Car, blurb: "Licence & qualifications" },
  { title: "Role & experience", icon: ClipboardList, blurb: "Position & history" },
  { title: "CV & training", icon: FileUp, blurb: "Attach your CV" },
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

const stepValidation: ((form: FormState) => string | null)[] = [
  (f) => (!f.full_name ? "Please enter your full name." : !f.date_of_birth ? "Please enter your date of birth." : null),
  () => null,
  (f) => (!f.email ? "Please enter your email address." : !f.phone ? "Please enter your phone number." : !f.address ? "Please enter your house address." : null),
  () => null,
  (f) => (!f.job_position ? "Please enter the job position you are applying for." : null),
  () => null, // CV step validates on submit
];

export default function Careers() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const update = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

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

  const goNext = () => {
    const err = stepValidation[step](form);
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (!cvFile) {
      toast.error("Please upload your CV.");
      return;
    }
    setSubmitting(true);
    try {
      setUploading(true);
      const cvPath = await uploadCv(cvFile);
      setUploading(false);

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

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div>
      <section className="gradient-subtle">
        <div className="container py-14 lg:py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Join us</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Job Application Form</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Complete the form to apply for the job position — it takes about 5 minutes and
            you can review your answers before submitting.
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
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Flat 1, 5 Upper Portland Street, Aberystwyth, SY23 2DT</p>
          </div>
        </div>

        <Card className="mx-auto max-w-3xl p-6 shadow-soft lg:p-10">
          {/* Stepper */}
          <div className="grid grid-cols-6 gap-1 sm:gap-2">
            {steps.map((s, i) => (
              <button
                key={s.title}
                type="button"
                onClick={() => i < step && setStep(i)}
                className="group flex flex-col items-center gap-1.5"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all sm:h-10 sm:w-10",
                    i < step && "border-success bg-success text-white",
                    i === step && "border-primary bg-primary text-primary-foreground shadow-lift",
                    i > step && "border-border bg-muted text-muted-foreground",
                    i < step && "group-hover:scale-105",
                  )}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-center text-[10px] font-medium leading-tight sm:block",
                    i === step ? "text-primary" : i < step ? "text-muted-foreground" : "text-muted-foreground/50",
                  )}
                >
                  {s.title}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between px-1 text-xs text-muted-foreground">
            <span className="sm:hidden">{steps[step].title} — {steps[step].blurb}</span>
            <span className="hidden sm:block">{steps[step].blurb}</span>
            <span>Step {step + 1} of {steps.length}</span>
          </div>
          {/* Progress bar (mobile) */}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          {/* Step content */}
          <div className="mt-8 min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {(() => { const Icon = steps[step].icon; return <Icon className="h-5 w-5" />; })()}
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold">{steps[step].title}</h2>
                    <p className="text-xs text-muted-foreground">Fields marked * are required</p>
                  </div>
                </div>

                {step === 0 && <StepPersonal form={form} set={set} update={update} />}
                {step === 1 && <StepRightToWork form={form} set={set} update={update} />}
                {step === 2 && <StepContact form={form} set={set} />}
                {step === 3 && <StepDriving form={form} set={set} update={update} />}
                {step === 4 && <StepRole form={form} set={set} />}
                {step === 5 && (
                  <StepCv
                    cvFile={cvFile}
                    fileInputRef={fileInputRef}
                    onPick={pickCv}
                    onClear={() => setCvFile(null)}
                    form={form}
                    set={set}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t pt-6">
            <Button variant="outline" onClick={goBack} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={goNext}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={submitting || uploading} className="min-w-[180px]">
                <Send className="h-4 w-4" />
                {uploading ? "Uploading CV…" : submitting ? "Submitting…" : "Submit application"}
              </Button>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

/* ---------- Step components ---------- */

function Field({ id, label, required, children }: { id: string; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required ? <span className="text-destructive">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

function StepPersonal({ form, set, update }: { form: FormState; set: (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => void; update: (k: keyof FormState, v: string) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="p-name" label="1. Full name" required>
        <Input id="p-name" value={form.full_name} onChange={set("full_name")} placeholder="Your full name" />
      </Field>
      <Field id="p-dob" label="2. Date of birth" required>
        <Input id="p-dob" type="date" value={form.date_of_birth} onChange={set("date_of_birth")} />
      </Field>
      <Field id="p-gender" label="3. Gender">
        <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
          <SelectTrigger id="p-gender"><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>{genderOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field id="p-marital" label="4. Marital status">
        <Select value={form.marital_status} onValueChange={(v) => update("marital_status", v)}>
          <SelectTrigger id="p-marital"><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>{maritalOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field id="p-nat" label="5. Nationality">
        <Input id="p-nat" value={form.nationality} onChange={set("nationality")} placeholder="e.g. British" />
      </Field>
    </div>
  );
}

function StepRightToWork({ form, set, update }: { form: FormState; set: (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => void; update: (k: keyof FormState, v: string) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="r-share" label="6. Right to work share code">
        <Input id="r-share" value={form.right_to_work_sharecode} onChange={set("right_to_work_sharecode")} placeholder="Share code" />
      </Field>
      <Field id="r-sponsor" label="7. Do you require sponsorship or switch?">
        <Select value={form.requires_sponsorship} onValueChange={(v) => update("requires_sponsorship", v)}>
          <SelectTrigger id="r-sponsor"><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>{yesNoOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field id="r-dbs" label="8. DBS number">
        <Input id="r-dbs" value={form.dbs_number} onChange={set("dbs_number")} placeholder="If applicable" />
      </Field>
      <Field id="r-scw" label="9. Social Care Wales number">
        <Input id="r-scw" value={form.social_care_wales_number} onChange={set("social_care_wales_number")} placeholder="If registered" />
      </Field>
    </div>
  );
}

function StepContact({ form, set }: { form: FormState; set: (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="c-email" label="10. Email address" required>
        <Input id="c-email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
      </Field>
      <Field id="c-phone" label="11. Phone number" required>
        <Input id="c-phone" value={form.phone} onChange={set("phone")} placeholder="Mobile or landline" />
      </Field>
      <Field id="c-address" label="12. House address (incl. post code)" required>
        <Input id="c-address" value={form.address} onChange={set("address")} placeholder="Street, town, post code" />
      </Field>
    </div>
  );
}

function StepDriving({ form, set, update }: { form: FormState; set: (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => void; update: (k: keyof FormState, v: string) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="d-licence" label="13. Valid UK driver's licence?">
        <Select value={form.has_uk_driving_license} onValueChange={(v) => update("has_uk_driving_license", v)}>
          <SelectTrigger id="d-licence"><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>{yesNoOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field id="d-car" label="14. Do you own your own car?">
        <Select value={form.owns_car} onValueChange={(v) => update("owns_car", v)}>
          <SelectTrigger id="d-car"><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>{yesNoOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field id="d-qual" label="15. Highest educational qualification">
        <Select value={form.highest_qualification} onValueChange={(v) => update("highest_qualification", v)}>
          <SelectTrigger id="d-qual"><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>{qualificationOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
    </div>
  );
}

function StepRole({ form, set }: { form: FormState; set: (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="o-job" label="16. Job position applied for" required>
        <Input id="o-job" value={form.job_position} onChange={set("job_position")} placeholder="e.g. Care Worker" />
      </Field>
      <Field id="o-current" label="17. Current employment & address of employer">
        <Input id="o-current" value={form.current_employment} onChange={set("current_employment")} placeholder="Role, company, address" />
      </Field>
      <Field id="o-previous" label="18. Previous employment & address of employer">
        <Input id="o-previous" value={form.previous_employment} onChange={set("previous_employment")} placeholder="Role, company, address" />
      </Field>
    </div>
  );
}

function StepCv({
  cvFile,
  fileInputRef,
  onPick,
  onClear,
  form,
  set,
}: {
  cvFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  form: FormState;
  set: (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="cv-upload">19. Upload your CV *</Label>
        <input ref={fileInputRef} id="cv-upload" type="file" accept=".pdf,.doc,.docx" onChange={onPick} className="hidden" />
        {!cvFile ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-muted/30 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
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
            <Button type="button" size="sm" variant="ghost" onClick={onClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Alternatively, email your CV to{" "}
          <a href="mailto:hr@manassehhealthcare.org" className="font-medium text-primary underline">hr@manassehhealthcare.org</a>{" "}
          and note "ATTACHED" here.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cv-training">20. List all care training</Label>
        <Textarea
          id="cv-training"
          rows={8}
          value={form.care_training}
          onChange={set("care_training")}
          placeholder="Please list all training undertaken in Health and Social Care in your previous employment."
        />
      </div>
    </div>
  );
}
